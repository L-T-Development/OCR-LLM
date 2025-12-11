#!/usr/bin/env python3
"""
Production-ready Flask backend launcher.

CLI args:
  --port <int>          bind port (default 8000)
  --auth-token <str>    token used to secure local API (required)
  --models-dir <path>   path where model subfolders live (default ./models/content)
"""
from flask_cors import CORS
import argparse
import logging
import signal
import sys
from pathlib import Path
from flask import Flask, request, jsonify, send_file, abort
from services.translator import Translator
from services.file_parser import FileParser
from services.glossary import GlossaryManager
from services.cache import CacheManager
import hashlib

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("translator-backend")

parser = argparse.ArgumentParser()
parser.add_argument("--port", type=int, default=8000)
parser.add_argument("--auth-token", type=str, required=True)
parser.add_argument("--models-dir", type=str, default="./models/content")
parser.add_argument("--use-onnx", action="store_true", help="Use ONNX optimized model")
parser.add_argument("--db-path", type=str, default="./db/glossary.db")
parser.add_argument("--no-redis", action="store_true", help="Disable Redis and use in-memory cache")
args = parser.parse_args()

# Ensure paths exist
models_dir = Path(args.models_dir).resolve()
db_path = Path(args.db_path).resolve()
db_path.parent.mkdir(parents=True, exist_ok=True)


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # dev only; tighten for prod/Electron


# Initialize core services
translator = Translator(models_dir=models_dir, use_onnx=args.use_onnx)
file_parser = FileParser()
glossary = GlossaryManager(db_path=db_path)
cache = CacheManager(use_redis=(not args.no_redis))

AUTH_TOKEN = args.auth_token


def require_auth(func):
    from functools import wraps
    @wraps(func)
    def wrapper(*a, **kw):
        token = request.headers.get("x-app-token", "")
        if not token or token != AUTH_TOKEN:
            return jsonify({"error": "unauthorized"}), 401
        return func(*a, **kw)
    return wrapper


@app.route("/health", methods=["GET"])
@require_auth
def health():
    return jsonify({"status": "ok", "model": translator.model_name, "ready": translator.ready})


@app.route("/translate", methods=["POST"])
@require_auth
def translate_endpoint():
    glossary.reset_counter()
    payload = request.get_json(force=True, silent=True) or {}
    text = payload.get("text") or payload.get("texts")
    target = payload.get("target_lang", "en")
    if text is None:
        return jsonify({"error": "missing 'text' field"}), 400

    # unify to list
    seq = text if isinstance(text, list) else [text]
    # caching
    raw = "||".join(seq)
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    cache_key = f"translate:{translator.model_name}:{target}:{digest}"
    cached = cache.get(cache_key)
    if cached:
        return jsonify({"translation": cached})

    # apply glossary pre-processing (simple placeholder logic)
    prepped = []
    maps = []
    
    for t in seq:
        p, m = glossary.apply_pre(t)
        prepped.append(p)
        maps.append(m)
    
    translated = translator.translate_batch(prepped, target=target)
    
    post = [
        glossary.apply_post(tr, m)
        for tr, m in zip(translated, maps)
    ]

    cache.set(cache_key, post)
    return jsonify({"translation": post if len(post) > 1 else post[0]})


@app.route("/files/translate", methods=["POST"])
@require_auth
def files_translate():
    """
    Accepts multipart file upload: 'file' and form field 'target_lang'.
    Returns: { translation: "...", positions: [{text, bbox, page}], meta: {...} }
    positions optional (if parser can provide bbox)
    """
    if "file" not in request.files:
        return jsonify({"error": "no file provided"}), 400
    f = request.files["file"]
    target = request.form.get("target_lang", "en")

    # Save temp file
    temp_dir = Path("./tmp")
    temp_dir.mkdir(parents=True, exist_ok=True)
    tmp_path = temp_dir / f.filename
    f.save(str(tmp_path))

    try:
        glossary.reset_counter()
        parsed = file_parser.parse(tmp_path)
        texts = parsed.get("text_blocks") or [parsed.get("text", "")]
        # apply pre-glossary
        prepped_texts = []
        glossary_maps = []

        for t in texts:
            p, m = glossary.apply_pre(t)
            prepped_texts.append(p)
            glossary_maps.append(m)

        translated = translator.translate_batch(prepped_texts, target=target)

        post = [
            glossary.apply_post(tr, m)
            for tr, m in zip(translated, glossary_maps)
        ]

        # attach positions if available
        positions = parsed.get("positions", [])
        # make mapping: positions[i] -> post[i]
        result_positions = []
        if positions and len(positions) == len(post):
            for pos, ptext in zip(positions, post):
                result_positions.append({"text": ptext, "bbox": pos.get("bbox"), "page": pos.get("page")})
        response = {"translation": " ".join(post), "positions": result_positions, "meta": {"pages": parsed.get("pages", 1)}}
        return jsonify(response)
    finally:
        try:
            tmp_path.unlink()
        except Exception:
            pass


@app.route("/glossary", methods=["GET"])
@require_auth
def get_glossary():
    entries = glossary.list_all()
    return jsonify(entries)

@app.route("/glossary/<int:entry_id>", methods=["DELETE"])
@require_auth
def delete_glossary(entry_id):
    glossary.delete(entry_id)
    glossary.reload_into_cache(cache)
    return jsonify({"status": "deleted"})


@app.route("/glossary", methods=["POST"])
@require_auth
def add_glossary():
    payload = request.get_json(force=True, silent=True) or {}
    src = payload.get("src")
    tgt = payload.get("tgt")
    scope = payload.get("scope", "global")
    if not src or not tgt:
        return jsonify({"error": "src and tgt required"}), 400
    entry_id = glossary.add(src, tgt, scope=scope)
    glossary.reload_into_cache(cache)

    return jsonify({
        "id": entry_id,
        "src": src,
        "tgt": tgt,
        "scope": scope
    })





def shutdown_signal_handler(signum, frame):
    logger.info("Shutting down...")
    try:
        cache.close()
    except Exception:
        pass
    sys.exit(0)


if __name__ == "__main__":
    # load glossary into cache for fast lookup
    glossary.reload_into_cache(cache)
    signal.signal(signal.SIGINT, shutdown_signal_handler)
    signal.signal(signal.SIGTERM, shutdown_signal_handler)
    logger.info(f"Starting backend on port {args.port} (models: {models_dir})")
    app.run(host="127.0.0.1", port=args.port, debug=False, threaded=True)
