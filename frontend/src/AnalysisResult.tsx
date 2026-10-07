import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  interface Answer {
    question: string;
    operation: string;
    column: string;
    result: number | Record<string, number>;
  }
  
  interface AnalysisResultProps {
    answer: Answer;
  }
  
  function AnalysisResult({
    answer,
  }: AnalysisResultProps) {
    return (
      <div className="card">
        <h2>Analysis Result</h2>
  
        <p>{answer.question}</p>
  
        {typeof answer.result === "number" ? (
          <div className="single-result">
            <p>
              {answer.operation.charAt(0).toUpperCase() + answer.operation.slice(1)}{" "}
              {answer.column}
            </p>
  
            <strong>{answer.result.toFixed(2)}</strong>
          </div>
        ) : (
          <div className="result-details">
            {Object.entries(answer.result).map(([name, value]) => (
              <div className="result-item" key={name}>
                <span>{name}</span>
                <strong>{value.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}
  
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
    );
  }
  
  export default AnalysisResult;