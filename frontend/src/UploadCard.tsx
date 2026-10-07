interface UploadCardProps {
    file: File | null;
    uploadResult: boolean;
    handleFileChange: (
      event: React.ChangeEvent<HTMLInputElement>
    ) => void;
  }
  
  function UploadCard({
    file,
    uploadResult,
    handleFileChange,
  }: UploadCardProps) {
    return (
      <div className="card">
        <h2>Upload Dataset</h2>
  
        <p>Upload a CSV file to begin analyzing your data.</p>
  
        <label className="upload-button">
          Choose CSV File
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            hidden
          />
        </label>
  
        {file && (
          <div className="file-status">
            <span>{file.name}</span>
            {uploadResult && <span className="status-badge">Ready</span>}
          </div>
        )}
      </div>
    );
  }
  
  export default UploadCard;