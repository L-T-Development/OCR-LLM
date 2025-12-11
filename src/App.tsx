import React, { useState } from "react";
import FileSelector from "./components/FileSelector";
import TranslateBox from "./components/TranslateBox";
import OutputPanel from "./components/OutputPanel";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span style={{ fontFamily: "fantasy" }}>Arx</span>
          <span style={{ fontFamily: "sans-serif" }}>Translator</span>
        </h1>
        <div style={{ position: "fixed", top: 20, right: 20 }}>
          <ThemeToggle />
        </div>
      </header>

      <div className="layout">
        <div className="left">
          <FileSelector onFile={setFile} />
          <TranslateBox
            file={file}
            onStart={() => {
              setOutput(""); // ✅ clear old text
              setLoading(true);
            }}
            onResult={(output) => {
              setOutput(output);
              setLoading(false);
            }}
          />
        </div>

        <div className="right">
          <OutputPanel text={output} isLoading={loading} />
        </div>
      </div>

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

        @media (max-width: 900px) {
          .layout {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
