import React, { useState } from "react";

export default function OutputPanel({
  text,
  isLoading,
}: {
  text: string;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="output-card" style={{ fontFamily: "Georgia" }}>
      <div className="header">
        <h2>Translation Result</h2>
        {text && !isLoading && (
          <button className="copy-btn" onClick={copyText}>
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>

      {/* CONTENT STATE */}
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-text">
            Translating<span className="dots">...</span>
          </div>

          <div className="loader">
            <span />
            <span />
            <span />
          </div>

          <div className="buffer-card">
            <div className="shimmer" />
          </div>
        </div>
      ) : text ? (
        <div className="result">{text}</div>
      ) : (
        <p className="hint">No translation yet</p>
      )}

      <style>{`
        .output-card {
          width: 900px;
          max-width: 900px;
          background: var(--card-bg);
          color: var(--text);
          padding: 24px;
          border-radius: 18px;
          box-shadow: 0 6px 18px var(--card-shadow);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .copy-btn {
          padding: 8px 14px;
          background: var(--accent);
          color: var(--button-text);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .copy-btn:hover {
          background: var(--accent-hover);
        }

        .result {
          background: var(--input-bg);
          padding: 16px;
          border-radius: 14px;
          border: 1px solid var(--border);
          max-height: 250px;
          overflow-y: auto;
          white-space: pre-wrap;
          animation: fadeIn 0.3s ease;
        }

        .hint {
          color: var(--text-soft);
          text-align: center;
          opacity: 0.8;
        }

        /* ===== LOADER ===== */
        .loader {
          display: flex;
          gap: 10px;
          justify-content: center;
          align-items: center;
          height: 120px;
        }

        .loader span {
          width: 10px;
          height: 10px;
          background: var(--accent);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loader span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .loader span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ===== LOADING STATE ===== */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  padding: 20px 0;
  animation: fadeIn 0.25s ease;
}

.loading-text {
  font-size: 0.95rem;
  color: var(--text-soft);
  letter-spacing: 0.3px;
}

.dots {
  animation: dots 1.5s infinite steps(4, end);
}

/* ===== BUFFER CARD (ghost result panel) ===== */
.buffer-card {
  width: 100%;
  height: 140px;
  background: linear-gradient(
    110deg,
    var(--input-bg) 25%,
    var(--border) 37%,
    var(--input-bg) 63%
  );
  background-size: 200% 100%;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  opacity: 0.6;
}

/* ===== SHIMMER ===== */
.shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.08),
    transparent
  );
  animation: shimmerMove 1.6s infinite;
}

/* ===== ANIMATIONS ===== */
@keyframes shimmerMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes dots {
  0% { content: ""; }
  25% { content: "."; }
  50% { content: ".."; }
  75% { content: "..."; }
}

      `}</style>
    </div>
  );
}
