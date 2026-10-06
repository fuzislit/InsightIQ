import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<any>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError("");
    setUploadResult(null);
    setAnswer(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadResult(data);
    } catch (err) {
      setError("Could not upload the file. Make sure the backend is running.");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      return;
    }

    setError("");
    setAnswer(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Question failed");
      }

      const data = await response.json();
      setAnswer(data);
    } catch (err) {
      setError("Could not process the question.");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>InsightIQ</h1>
        <p>AI-powered data analytics from your CSV files.</p>
      </header>

    <div className="card">
      <h2>Upload Dataset</h2>

      <p>Upload a CSV file to begin analyzing your data.</p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {file && <p>Selected file: {file.name}</p>}
    </div>

      {error && <p>{error}</p>}

      {uploadResult && (
        <div className = "card">
          <h2>Dataset Overview</h2>

    <p>
      <strong>File:</strong> {uploadResult.filename}
    </p>

    <div className="stats">
      <div className="stat-card">
        <span className="stat-value">{uploadResult.rows}</span>
        <span className="stat-label">Rows</span>
      </div>

      <div className="stat-card">
        <span className="stat-value">{uploadResult.columns}</span>
        <span className="stat-label">Columns</span>
      </div>
    </div>

    <h3>Columns</h3>

    <ul>
      {uploadResult.column_names.map((column: string) => (
        <li key={column}>
          <strong>{column}</strong> — {uploadResult.data_types[column]}
        </li>
      ))}
    </ul>

    <h3>Missing Values</h3>

    <ul>
      {uploadResult.column_names.map((column: string) => (
        <li key={column}>
          {column}: {uploadResult.missing_values[column]}
        </li>
      ))}
    </ul>

    <h3>Numeric Summary</h3>

    <table>
      <thead>
        <tr>
          <th>Statistic</th>

          {Object.keys(uploadResult.numeric_summary).map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {["count", "mean", "min", "max"].map((statistic) => (
          <tr key={statistic}>
            <td>{statistic}</td>

            {Object.keys(uploadResult.numeric_summary).map((column) => (
              <td key={column}>
                {uploadResult.numeric_summary[column][statistic]?.toFixed(2)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
  

      {uploadResult && (
          <div className="card">
              <h2>Ask your Data</h2>

              <div className="question-row">
              <input
                type="text"
                placeholder="What is the average price?"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />

              <button onClick={handleAsk}>
                Ask
              </button>
            </div>
        </div>
      )}

      {answer && (
          <div className="card">
          <h2>Analysis Result</h2>

          <p>
            <strong>Question:</strong> {answer.question}
          </p>

          <p>
            <strong>Operation:</strong> {answer.operation}
          </p>

          <p>
            <strong>Column:</strong> {answer.column}
          </p>

          <p>
            <strong>Result:</strong> {JSON.stringify(answer.result)}
          </p>

          {typeof answer.result === "object" && answer.result !== null && (
            <BarChart
              width={700}
              height={350}
              margin={{ top: 10, right: 20, left: 20, bottom: 40 }}
              data={Object.entries(answer.result).map(([name, value]) => ({
                name,
                value,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          )}
        </div>
      )}
    </div>
  );
}

export default App;