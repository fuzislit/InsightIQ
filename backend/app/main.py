
from fastapi import FastAPI

app = FastAPI(title="InsightIQ API")


@app.get("/")
def home():
    return {"message": "Welcome to InsightIQ!"}

@app.get("/status")
def status_check(): 
    return{"status": "Healthy"}