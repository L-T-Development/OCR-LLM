# services/translator.py
from pathlib import Path
from typing import List
import logging
import html


logger = logging.getLogger("translator")

class Translator:
    def __init__(self, models_dir: Path, use_onnx: bool = False):
        self.models_dir = Path(models_dir)
        self.use_onnx = use_onnx
        self.ready = False

        if use_onnx:
            self._load_onnx()
        else:
            self._load_pytorch()

        self.ready = True

    # -------------------------
    # ONNX Runtime loader
    # -------------------------
    def _load_onnx(self):
        from optimum.onnxruntime import ORTModelForSeq2SeqLM
        from transformers import MarianTokenizer

        model_path = self.models_dir / "opus-mt-ru-en-onnx"
        if not model_path.exists():
            raise FileNotFoundError(f"ONNX model not found at {model_path}")

        self.model_name = model_path.name
        self.tokenizer = MarianTokenizer.from_pretrained(str(model_path))
        self.model = ORTModelForSeq2SeqLM.from_pretrained(
            str(model_path),
            provider="CPUExecutionProvider"
        )

        logger.info("✅ Loaded ONNX Runtime model")

    # -------------------------
    # PyTorch fallback loader
    # -------------------------
    def _load_pytorch(self):
        import torch
        from transformers import MarianMTModel, MarianTokenizer

        model_path = self.models_dir / "opus-mt-ru-en"
        if not model_path.exists():
            raise FileNotFoundError(f"PyTorch model not found at {model_path}")

        self.model_name = model_path.name
        self.tokenizer = MarianTokenizer.from_pretrained(str(model_path))
        self.model = MarianMTModel.from_pretrained(str(model_path))

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.model.eval()

        logger.info(f"✅ Loaded PyTorch model on {self.device}")

    # -------------------------
    # Unified inference
    # -------------------------
    def translate_batch(
        self,
        texts: List[str],
        target: str = "en",
        max_length: int = 256
    ) -> List[str]:

        if not texts:
            return []

        inputs = self.tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=max_length
        )

        if not self.use_onnx:
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

        outputs = self.model.generate(
            **inputs,
            max_length=max_length
            )

        decoded = self.tokenizer.batch_decode(
            outputs,
            skip_special_tokens=True
        )
        cleaned = [html.unescape(t) for t in decoded]
        
        return cleaned

