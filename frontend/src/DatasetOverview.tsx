interface UploadResult {
    filename: string;
    rows: number;
    columns: number;
    column_names: string[];
    data_types: Record<string, string>;
    missing_values: Record<string, number>;
    numeric_summary: Record<string, Record<string, number>>;
  }
  
  interface DatasetOverviewProps {
    uploadResult: UploadResult;
  }
  
  function DatasetOverview({
    uploadResult,
  }: DatasetOverviewProps) {
    return (
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
    );
  }
  
  export default DatasetOverview;