# services/glossary.py
import sqlite3
from pathlib import Path
from typing import List, Dict
import logging
import re
import uuid

logger = logging.getLogger("glossary")

class GlossaryManager:
    def __init__(self, db_path: Path):
        self.db_path = Path(db_path)
        self._ensure_schema()
        self.cache = {}  # simple in-memory mapping src->tgt
        self._counter = 0

    def reset_counter(self):
        self._counter = 0


    def _ensure_schema(self):
        conn = sqlite3.connect(str(self.db_path))
        cur = conn.cursor()
        cur.execute("""
        CREATE TABLE IF NOT EXISTS glossary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            src TEXT NOT NULL,
            tgt TEXT NOT NULL,
            scope TEXT DEFAULT 'global'
        );
        """)
        conn.commit()
        conn.close()

    def _next_placeholder(self):
        tok = f"<extra_id_{self._counter}>"
        self._counter += 1
        return tok    

    def add(self, src: str, tgt: str, scope: str = "global") -> int:
        conn = sqlite3.connect(str(self.db_path))
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO glossary (src, tgt, scope) VALUES (?, ?, ?)",
            (src, tgt, scope)
        )
        conn.commit()
        entry_id = cur.lastrowid
        conn.close()

        self.reload_cache()
        return entry_id
    

    def apply_pre(self, text: str):
        out = text
        mapping = {}

        for src, tgt in self.cache.items():
            placeholder = self._next_placeholder()
            pattern = r"\b" + re.escape(src) + r"\b"

            if re.search(pattern, out, flags=re.IGNORECASE):
                out = re.sub(pattern, placeholder, out, flags=re.IGNORECASE)
                mapping[placeholder] = tgt

        return out, mapping


    def apply_post(self, translated_text: str, mapping: dict):
        out = translated_text
        for placeholder, tgt in mapping.items():
            out = out.replace(placeholder, tgt)
        return out



    def list_all(self) -> List[Dict]:
        conn = sqlite3.connect(str(self.db_path))
        cur = conn.cursor()
        cur.execute("SELECT id, src, tgt, scope FROM glossary ORDER BY id DESC")
        rows = cur.fetchall()
        conn.close()
        return [{"id": r[0], "src": r[1], "tgt": r[2], "scope": r[3]} for r in rows]

    def reload_cache(self):
        conn = sqlite3.connect(str(self.db_path))
        cur = conn.cursor()
        cur.execute("SELECT src, tgt FROM glossary")
        rows = cur.fetchall()
        conn.close()
        self.cache = {r[0]: r[1] for r in rows}
        logger.info(f"Loaded {len(self.cache)} glossary entries")

    def reload_into_cache(self, cache_manager):
        # also populate redis or provided cache
        self.reload_cache()
        if hasattr(cache_manager, "set"):
            # push all to cache as simple mapping
            for k, v in self.cache.items():
                try:
                    cache_manager.set(f"glossary:{k}", v)
                except Exception:
                    pass

    # def apply_pre(self, text: str) -> str:
    #     # replace exact matches with placeholders - simple approach
    #     # you can expand to regex/word-boundary matching
    #     out = text
    #     for src in self.cache:
    #         if src in out:
    #             placeholder = f"__G_{hash(src) & 0xffffffff:x}__"
    #             out = out.replace(src, placeholder)
    #     return out



    
    def delete(self, entry_id: int):
        conn = sqlite3.connect(str(self.db_path))
        cur = conn.cursor()
        cur.execute("DELETE FROM glossary WHERE id = ?", (entry_id,))
        conn.commit()
        conn.close()

