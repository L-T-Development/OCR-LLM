# services/file_parser.py
from pathlib import Path
import fitz  # PyMuPDF
from docx import Document
import pytesseract
from PIL import Image
import logging
import tempfile

logger = logging.getLogger("fileparser")

class FileParser:
    def __init__(self):
        pass

    def parse(self, filepath: Path):
        filepath = Path(filepath)
        suffix = filepath.suffix.lower()
        if suffix == ".pdf":
            return self._parse_pdf(filepath)
        if suffix in [".docx"]:
            return self._parse_docx(filepath)
        if suffix in [".txt"]:
            return self._parse_txt(filepath)
        # fallback: try OCR on file by opening as image
        return self._parse_image(filepath)

    def _parse_txt(self, path: Path):
        text = path.read_text(encoding="utf-8", errors="ignore")
        return {"text": text, "pages": 1, "positions": None}

    def _parse_docx(self, path: Path):
        doc = Document(str(path))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n".join(paragraphs)
        return {"text": text, "pages": 1, "positions": None}

    def _parse_pdf(self, path: Path):
        doc = fitz.open(str(path))
        all_texts = []
        positions = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            # extract blocks
            blocks = page.get_text("blocks")  # list of (x0, y0, x1, y1, "text", block_no)
            page_texts = []
            page_positions = []
            for b in blocks:
                x0, y0, x1, y1, text, block_no = b[:6]
                t = text.strip()
                if not t:
                    continue
                page_texts.append(t)
                page_positions.append({"text": t, "bbox": [x0, y0, x1 - x0, y1 - y0], "page": page_num + 1})
            if page_texts:
                # for now join with newline; keep positions aligned
                all_texts.extend(page_texts)
                positions.extend(page_positions)
        return {"text_blocks": all_texts, "positions": positions, "pages": len(doc)}

    def _parse_image(self, path: Path):
        # general OCR fallback
        img = Image.open(str(path)).convert("RGB")
        text = pytesseract.image_to_string(img, lang="rus+eng")
        return {"text": text, "pages": 1, "positions": None}
