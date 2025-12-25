import React, { useState } from "react";
import FileSelector from "./components/FileSelector";
import TranslateBox from "./components/TranslateBox";
import OutputPanel from "./components/OutputPanel";
import ThemeToggle from "./components/ThemeToggle";
import GlossaryCreator from "./components/GlossaryCreator";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"translate" | "glossary">("translate");

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>
          <span style={{ fontFamily: "fantasy" }}>Arx</span>
          <span style={{ fontFamily: "sans-serif" }}>Translator</span>
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="switch-btn"
            onClick={() =>
              setView(view === "translate" ? "glossary" : "translate")
            }
          >
            {view === "translate"
              ? "Open Glossary Creator"
              : "Back to Translator"}
          </button>

          <div style={{ position: "fixed", top: 20, right: 20 }}>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* MAIN VIEW SWITCH */}
      {view === "translate" ? (
        <div className="layout">
          <div className="left">
            <FileSelector onFile={setFile} />

            <TranslateBox
              file={file}
              onStart={() => {
                setOutput("");
                setLoading(true);
              }}
              onResult={(o) => {
                setOutput(o);
                setLoading(false);
              }}
            />
          </div>

          <div className="right">
            <OutputPanel text={output} isLoading={loading} />
          </div>
        </div>
      ) : (
        <div className="glossary-page">
          <GlossaryCreator />
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .app {
          padding: 24px;
          color: var(--text);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .switch-btn {
          padding: 10px 18px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.25s;
        }

        .switch-btn:hover {
          background: var(--accent-hover);
        }

        .layout {
          display: flex;
          gap: 24px;
        }

        .left {
          flex: 4;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .right {
          flex: 6;
        }

        .glossary-page {
          margin-top: 20px;
        }

        @media (max-width: 900px) {
          .layout {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
