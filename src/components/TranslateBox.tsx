import React, { useState, useEffect } from "react";
import { translateFile } from "../api";
import { addGlossaryEntry, fetchGlossary, deleteGlossaryEntry } from "../api";

export default function TranslateBox({
  file,
  onResult,
  onStart,
}: {
  file: File | null;
  onResult: (text: string) => void;
  onStart: () => void;
}) {
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Glossary state
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  type GlossaryEntry = {
    id: number;
    word: string;
    meaning: string;
  };

  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);

  const [glossaryLoading, setGlossaryLoading] = useState(true);

  useEffect(() => {
    const loadGlossary = async () => {
      try {
        const data = await fetchGlossary();
        setGlossary(
          data.map((g: any) => ({
            id: g.id,
            word: g.src,
            meaning: g.tgt,
          }))
        );
      } catch (err) {
        console.error("Failed to load glossary:", err);
      } finally {
        setGlossaryLoading(false);
      }
    };

    loadGlossary();
  }, []);

  // Translation handlers
  // inside TranslateBox.tsx
  const handleFile = async () => {
    if (!file) return alert("Select a file first");

    onStart(); // ✅ tell App we're loading
    setLoading(true); // local button state

    try {
      const res = await translateFile(file, lang);
      const text = typeof res === "string" ? res : res.translation ?? "";
      onResult(text);
    } catch (err) {
      alert("Translation failed");
    } finally {
      setLoading(false);
    }
  };

  // Glossary handlers

  const removeGlossary = async (id: number) => {
    try {
      await deleteGlossaryEntry(id);
      setGlossary((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to delete glossary entry:", err);
      alert("Failed to delete glossary entry");
    }
  };

  const addToGlossary = async () => {
    if (!word.trim() || !meaning.trim()) {
      alert("Enter both word and meaning");
      return;
    }

    try {
      const created = await addGlossaryEntry(word.trim(), meaning.trim());

      setGlossary((prev) => [
        {
          id: created.id,
          word: created.src,
          meaning: created.tgt,
        },
        ...prev,
      ]);

      setWord("");
      setMeaning("");
    } catch (err) {
      console.error("Glossary API error:", err);
      alert("Failed to add glossary entry");
    }
  };

  return (
    <div className="translate-card" style={{ fontFamily: "Georgia" }}>
      <h2>Translate</h2>

      <label className="label" style={{ margin: "5px", color: "navy" }}>
        Target Language
      </label>

      <div className="custom-select">
        <div
          className="select-trigger"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {lang === "en" ? "English" : "Hindi"}
        </div>

        {dropdownOpen && (
          <div className="options">
            <div
              className="option"
              onClick={() => {
                setLang("en");
                setDropdownOpen(false);
              }}
            >
              English
            </div>
            <div
              className="option"
              onClick={() => {
                setLang("hi");
                setDropdownOpen(false);
              }}
            >
              Hindi
            </div>
          </div>
        )}
      </div>

      <button className="btn" disabled={!file || loading} onClick={handleFile}>
        {loading ? "Translating..." : "Translate File"}
      </button>

      <div className="divider" />

      {/* Local Glossary Section */}
      {/* Local Glossary Section */}
      <h3>Local Glossary</h3>

      <input
        type="text"
        placeholder="Enter word"
        className="word-input"
        value={word}
        onChange={(e) => setWord(e.target.value)}
      />

      <textarea
        placeholder="Enter meaning"
        className="meaning-input"
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
      />

      <button className="btn" onClick={addToGlossary}>
        Add Word to Glossary
      </button>

      {glossaryLoading ? (
        <p className="hint">Loading glossary...</p>
      ) : glossary.length === 0 ? (
        <p className="hint">No glossary entries yet</p>
      ) : (
        <div className="glossary-list">
          {glossary.map((entry) => (
            <div key={entry.id} className="glossary-item">
              <div>
                <strong>{entry.word}</strong>: {entry.meaning}
              </div>

              <button
                className="delete-btn"
                onClick={() => removeGlossary(entry.id)}
                title="Remove glossary entry"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .translate-card {
          background: var(--card-bg);
          color: var(--text);
          padding: 22px;
          border-radius: 18px;
          box-shadow: 0 6px 18px var(--card-shadow);
        }

        h2, h3 {
          margin-bottom: 10px;
        }

        .label {
          color: var(--text-soft);
          font-size: 0.9rem;
        }

        .custom-select {
          position: relative;
          margin-bottom: 14px;
        }

        .select-trigger {
          background: var(--input-bg);
          border: 1px solid var(--border);
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .select-trigger:hover {
          border-color: var(--border-hover);
        }

        .options {
          position: absolute;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          width: 100%;
          margin-top: 6px;
          z-index: 10;
          box-shadow: 0 6px 14px var(--card-shadow);
        }

        .option {
          padding: 10px;
          cursor: pointer;
        }

        .option:hover {
          background: var(--accent-soft);
        }

        .btn {
          width: 100%;
          padding: 10px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.25s;
          margin-top: 10px;
        }

        .btn:hover {
          background: var(--accent-hover);
        }

        .divider {
          height: 1px;
          background: var(--border);
          margin: 14px 0;
        }

        .word-input {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 8px;
          background: var(--input-bg);
          color: var(--text);
        }

        .word-input:focus {
          outline: none;
          border-color: var(--border-strong);
        }

        .meaning-input {
          width: 100%;
          height: 80px;
          padding: 10px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--input-bg);
          color: var(--text);
          resize: none;
        }

        .meaning-input:focus {
          outline: none;
          border-color: var(--border-strong);
        }

        .glossary-list {
          margin-top: 14px;
          padding: 12px;
          background: var(--input-bg);
          border-radius: 12px;
          max-height: 200px;
          overflow-y: auto;
        }

        .glossary-item {
          padding: 6px 0;
          border-bottom: 1px solid var(--border);
        }

        .glossary-item:last-child {
          border-bottom: none;
        }

        .glossary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.glossary-item:last-child {
  border-bottom: none;
}

.delete-btn {
  background: transparent;
  color: #c0392b;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.delete-btn:hover {
  background: rgba(192, 57, 43, 0.1);
}

      `}</style>
    </div>
  );
}
