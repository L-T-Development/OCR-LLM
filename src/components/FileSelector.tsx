import React, { useState } from "react";

export default function FileSelector({
  onFile,
}: {
  onFile: (f: File | null) => void;
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  return (
    <div className="file-card" style={{ fontFamily: "Georgia" }}>
      <h2>Select Document</h2>

      <div
        className={`dropzone ${dragActive ? "active" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
      >
        <p>Drag & Drop your file here</p>
        <span style={{ margin: "10px" }}>or</span>

        <input
          type="file"
          id="fileInput"
          accept=".pdf,.docx,.txt"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
        />

        <button
          className="browse"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          Browse Files
        </button>
      </div>

      <p className="hint">PDF, DOCX, TXT supported</p>

      <style>{`
        .file-card {
          background: var(--card-bg);
          padding: 22px;
          border-radius: 18px;
          box-shadow: 0 6px 18px var(--card-shadow);
          color: var(--text);
        }

        h2 {
          margin-bottom: 10px;
          color: var(--text);
        }

        .dropzone {
          border: 2px dashed var(--border);
          background: var(--input-bg);
          padding: 28px;
          border-radius: 16px;
          text-align: center;
          transition: 0.25s ease;
          cursor: pointer;
          color: var(--text);
        }

        .dropzone.active {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .dropzone button {
          margin-top: 10px;
          padding: 8px 14px;
          background: var(--accent);
          color: var(--button-text);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .dropzone button:hover {
          background: var(--accent-hover);
        }

        .hint {
          margin-top: 8px;
          color: var(--text-soft);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
