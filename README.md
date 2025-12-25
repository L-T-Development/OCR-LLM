# ⤨ 🗺 ARX Translate – Offline Document Translator

ARX Translate is a fully offline translation tool designed to translate Russian documents (PDF, DOCX, TXT) into English or Hindi using local NLP models. The system uses a React + Vite frontend and a Python Flask backend with offline MarianMT models for translation and PyMuPDF/Tesseract for text extraction.

# Project Setup Guide

## Frontend Setup (React + Vite)

```bash
cd frontend
npm install
```

### Start Frontend

```bash
npm run dev
```

## Backend Setup (Flask + MarianMT Model)

### 1. Install dependencies

(Activate your Python environment first)

```bash
cd backend
pip install -r requirements.txt
```

### 2. Place your offline MarianMT model

Your model must be stored here:

```
backend/models/content/opus-mt-ru-en/
```

### 3. Start Backend Server

```bash
cd backend
cd app
python main.py --port 8000 --auth-token dev123 --models-dir "../models/content" --use-onnx
python main.py --port 8000 --auth-token dev123 --models-dir "../models/content"
```

Backend will now run on:

```
http://127.0.0.1:8000
```

# Folder Structure

```
arx-translate/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── services/
│   │   │   └── translator.py
│   │   └── utils/
│   ├── models/
│   │   └── content/
│   │       └── opus-mt-ru-en/
│   └── requirements.txt
│
└── README.md
```


