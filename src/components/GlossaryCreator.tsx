import React, { useState } from "react";
import { extractGlossaryPairs, addGlossaryEntry } from "../api";

interface CandidatePair {
  src: string;
  tgt: string;
  selected: boolean;
}

export default function GlossaryCreator() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [pairs, setPairs] = useState<CandidatePair[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleExtract = async () => {
    setError("");
    setSuccess("");
    setPairs([]);

    if (!sourceFile || !targetFile) {
      setError(
        "Please upload both the Russian source and its translated document."
      );
      return;
    }

    setLoading(true);
    try {
      const data = await extractGlossaryPairs(sourceFile, targetFile);

      if (!data || !Array.isArray(data.pairs)) {
        setError("Invalid response from backend.");
        return;
      }

      const mapped = data.pairs.map((p: any) => ({
        src: p.src,
        tgt: p.tgt,
        selected: true,
      }));

      if (mapped.length === 0) {
        setError(
          "No valid glossary pairs found. The document may not contain extractable text."
        );
      } else {
        setPairs(mapped);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err.message ||
        "Failed to extract glossary pairs.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setPairs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAll = () => {
    setPairs((prev) => prev.map((p) => ({ ...p, selected: true })));
  };

  const saveSelected = async () => {
    setError("");
    setSuccess("");

    const selected = pairs.filter((p) => p.selected);
    if (selected.length === 0) {
      setError("Select at least one glossary pair to save.");
      return;
    }

    setSaving(true);
    try {
      for (const pair of selected) {
        await addGlossaryEntry(pair.src, pair.tgt);
      }
      setSuccess(`Successfully saved ${selected.length} glossary entries.`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err.message ||
        "Error saving glossary entries.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="creator-wrapper">
      <div className="creator-card">
        <h2>Dynamic Glossary Creator</h2>
        <p className="subtitle">
          Upload a Russian document and its verified translation to
          auto-generate glossary entries.
        </p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="upload-section">
          <div className="upload-box">
            <label>Russian Source Document</label>
            <input
              type="file"
              onChange={(e) => setSourceFile(e.target.files?.[0] || null)}
            />
            {sourceFile && <span className="file-name">{sourceFile.name}</span>}
          </div>

          <div className="upload-box">
            <label>Human-Translated Document</label>
            <input
              type="file"
              onChange={(e) => setTargetFile(e.target.files?.[0] || null)}
            />
            {targetFile && <span className="file-name">{targetFile.name}</span>}
          </div>
        </div>

        <button
          className="btn primary"
          onClick={handleExtract}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            "Generate Glossary Candidates"
          )}
        </button>

        {loading && (
          <div className="status-hint">
            Analyzing documents and aligning terminology…
          </div>
        )}

        {pairs.length > 0 && (
          <div className="pairs-section">
            <div className="pairs-header">
              <h3>Review Extracted Pairs</h3>
              <button className="small-btn" onClick={selectAll}>
                Select All
              </button>
            </div>

            <div className="pairs-list">
              {pairs.map((p, idx) => (
                <div className="pair-item" key={idx}>
                  <label className="pair-text">
                    <input
                      type="checkbox"
                      checked={p.selected}
                      onChange={() => toggleSelect(idx)}
                    />
                    <span>
                      <strong>{p.src}</strong> → {p.tgt}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <button
              className="btn success-btn"
              onClick={saveSelected}
              disabled={saving}
            >
              {saving ? (
                <span className="spinner" />
              ) : (
                "Save Selected to Glossary"
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .creator-wrapper {
          display: flex;
          justify-content: center;
          padding: 40px 20px;
        }

        .creator-card {
          width: 100%;
          max-width: 880px;
          background: var(--card-bg);
          padding: 32px;
          border-radius: 18px;
          box-shadow: 0 8px 28px var(--card-shadow);
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        h2 {
          margin: 0;
        }

        .subtitle {
          color: var(--text-soft);
          font-size: 0.95rem;
        }

        .alert {
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .alert.error {
          background: rgba(192, 57, 43, 0.12);
          color: #c0392b;
        }

        .alert.success {
          background: rgba(46, 204, 113, 0.12);
          color: #27ae60;
        }

        .upload-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .upload-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .file-name {
          font-size: 0.8rem;
          color: var(--text-soft);
        }

        .btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          transition: 0.25s ease;
        }

        .btn.primary {
          background: var(--accent);
          color: white;
        }

        .btn.success-btn {
          background: #27ae60;
          color: white;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .status-hint {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-soft);
        }

        .pairs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pairs-list {
          border: 1px solid var(--border);
          border-radius: 14px;
          max-height: 300px;
          overflow-y: auto;
          background: var(--input-bg);
        }

        .pair-item {
          padding: 12px;
          border-bottom: 1px solid var(--border);
        }

        .pair-item:last-child {
          border-bottom: none;
        }

        .pair-text {
          display: flex;
          gap: 10px;
          align-items: center;
          cursor: pointer;
        }

        .small-btn {
          background: var(--accent-soft);
          border: none;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .upload-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
