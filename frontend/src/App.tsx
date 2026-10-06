import { useState } from "react";

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
    <div>
      <h1>InsightIQ</h1>

      <p>Upload a CSV dataset to begin.</p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {file && <p>Selected file: {file.name}</p>}

      {error && <p>{error}</p>}

      {uploadResult && (
        <div>
          <h2>Dataset Information</h2>

          <p>Rows: {uploadResult.rows}</p>
          <p>Columns: {uploadResult.columns}</p>

          <h3>Column Names</h3>

          <ul>
            {uploadResult.column_names.map((column: string) => (
              <li key={column}>{column}</li>
            ))}
          </ul>
        </div>
      )}

      {uploadResult && (
        <div>
          <h2>Ask a Question</h2>

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
      )}

      {answer && (
        <div>
          <h2>Answer</h2>

          <p>
            Question: {answer.question}
          </p>

          <p>
            Operation: {answer.operation}
          </p>

          <p>
            Column: {answer.column}
          </p>

          <p>
            Result: {JSON.stringify(answer.result)}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;