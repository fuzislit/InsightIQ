import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UploadResult {
  filename: string;
  rows: number;
  columns: number;
  column_names: string[];
  data_types: Record<string, string>;
  missing_values: Record<string, number>;
  numeric_summary: Record<string, Record<string, number>>;
}

interface Answer {
  question: string;
  operation: string;
  column: string;
  result: number | Record<string, number>;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);

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
    } catch {
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
    } catch {
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
        <div className="dashboard-grid">

          <div className="card dataset-card">
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

            <div className="dataset-details">

              <div className="detail-section">
                <h3>Columns</h3>

                {uploadResult.column_names.map((column: string) => (
                  <div className="detail-row" key={column}>
                    <span className="detail-name">{column}</span>
                    <span className="detail-value">
                      {uploadResult.data_types[column]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h3>Missing Values</h3>

                {uploadResult.column_names.map((column: string) => (
                  <div className="detail-row" key={column}>
                    <span className="detail-name">{column}</span>
                    <span className="detail-value">
                      {uploadResult.missing_values[column]}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            <h3>Numeric Summary</h3>

            <div className="table-container">
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
          </div>


          <div className="dashboard-side">

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

            {answer && (
              <div className="card">
                <h2>Analysis Result</h2>

                <p>{answer.question}</p>

                <div className="result-details">
                  <div className="result-item">
                    <strong>Operation:</strong> {answer.operation}
                  </div>

                  <div className="result-item">
                    <strong>Column:</strong> {answer.column}
                  </div>

                  <div className="result-item">
                    <strong>Result:</strong> {JSON.stringify(answer.result)}
                  </div>
                </div>

                {typeof answer.result === "object" && answer.result !== null && (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={Object.entries(answer.result).map(([name, value]) => ({
                          name,
                          value,
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid
                          stroke="#2a2f3a"
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9ca3af", fontSize: 13 }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9ca3af", fontSize: 13 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#171a21",
                            border: "1px solid #343a46",
                            borderRadius: "8px",
                            color: "#f3f4f6",
                          }}
                        />

                        <Bar
                          dataKey="value"
                          fill="#3b82f6"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={70}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;