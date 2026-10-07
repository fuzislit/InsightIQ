import { useState } from "react";

import UploadCard from "./UploadCard";
import DatasetOverview from "./DatasetOverview";
import AnalysisResult from "./AnalysisResult";

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

  const [loading, setLoading] = useState(false);

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
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>InsightIQ</h1>
        <p>AI-powered data analytics from your CSV files.</p>
      </header>

      <UploadCard
        file={file}
        uploadResult={uploadResult !== null}
        handleFileChange={handleFileChange}
      />

      {error && <p>{error}</p>}

      {uploadResult && (
        <div className="dashboard-grid">

          <DatasetOverview uploadResult={uploadResult} />

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

                <button onClick={handleAsk} disabled={loading}>
                  {loading ? "Analyzing..." : "Ask"}
                </button>
              </div>
            </div>

            {answer && (
              <AnalysisResult answer={answer} />
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default App;