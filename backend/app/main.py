from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv
import os
import io
import json

def analyze_data(df, operation, column, group_by=None, filter_column = None, filter_value = None):

    if filter_column and filter_value is not None:
        df = df[df[filter_column].astype(str).str.lower() == str(filter_value).lower()]

    if group_by:
        grouped = df.groupby(group_by)[column]

        if operation == "average":
            return grouped.mean().to_dict()

        elif operation == "sum":
            return grouped.sum().to_dict()

        elif operation == "minimum":
            return grouped.min().to_dict()

        elif operation == "maximum":
            return grouped.max().to_dict()

        elif operation == "count":
            return grouped.count().to_dict()

    if operation == "average":
        return df[column].mean()

    elif operation == "sum":
        return df[column].sum()

    elif operation == "minimum":
        return df[column].min()

    elif operation == "maximum":
        return df[column].max()

    elif operation == "count":
        return df[column].count()

    else:
        return None


app = FastAPI(title="InsightIQ API")

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

current_df = None


@app.get("/")
def home():
    return {"message": "Welcome to InsightIQ!"}


@app.get("/status")
def status_check():
    return {"status": "healthy"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global current_df

    contents = await file.read()

    current_df = pd.read_csv(io.BytesIO(contents))

    return {
        "filename": file.filename,
        "rows": len(current_df),
        "columns": len(current_df.columns),
        "column_names": list(current_df.columns),
        "data_types": current_df.dtypes.astype(str).to_dict(),
        "missing_values": current_df.isnull().sum().to_dict(),
        "numeric_summary": current_df.describe().to_dict()
    }


@app.get("/analyze-test")
def analyze_test():
    df = pd.DataFrame({
        "Price": [1200, 80, 40, 300, 450, 200, 150, 10],
        "Quantity": [2, 5, 10, 3, 2, 4, 6, 20]
    })

    result = analyze_data(df, "average", "Price")
    return {
        "operation": "average",
        "column": "Price",
        "result": result
    }
class Question(BaseModel):
    question: str


@app.post("/ask")
def ask_question(data: Question):

    if current_df is None:
        return {
            "error": "No dataset has been uploaded yet."
        }

    prompt = f"""
    You are a data analysis assistant for InsightIQ.

    The uploaded dataset has these columns:
    {list(current_df.columns)}

    The user asked:
    {data.question}

    Determine what analysis operation the user wants.
    Allowed operations:
    - average
    - sum
    - minimum
    - maximum
    - count

    If the user asks for an analysis "by" or "per" another column,
    use that column as group_by.

    If the user asks to analyze only a specific value from a column,
    use filter_column and filter_value.

    For example:

    "What is the average price by category?"
    Return:
    {{
        "operation": "average",
        "column": "Price",
        "group_by": "Category",
        "filter_column": null,
        "filter_value": null
    }}

    "What is the average price for Electronics?"
    Return:
    {{
        "operation": "average",
        "column": "Price",
        "group_by": null,
        "filter_column": "Category",
        "filter_value": "Electronics"
    }}

    If no grouping is requested, group_by should be null.

    If no filtering is requested, filter_column and filter_value should be null.

    Return ONLY valid JSON in this format:
    {{
        "operation": "average",
        "column": "Price",
        "group_by": null,
        "filter_column": null,
        "filter_value": null
    }}

    Do not calculate the answer yourself.
    Do not include any explanation outside the JSON.
    """

    response = client.responses.create(
        model="gpt-5-mini",
        input=prompt
    )

    analysis = json.loads(response.output_text)

    operation = analysis["operation"]
    column = analysis["column"]
    group_by = analysis.get("group_by")
    filter_column = analysis.get("filter_column")
    filter_value = analysis.get("filter_value")

    result = analyze_data(
        current_df,
        operation,
        column, 
        group_by,
        filter_column,
        filter_value
    )
    if hasattr(result, "item"):
        result = result.item()

    return {
        "question": data.question,
        "operation": operation,
        "column": column,
        "result": result
    }