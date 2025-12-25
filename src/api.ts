// src/api.ts
import axios from "axios";
const BASE = "http://127.0.0.1:8000";
const TOKEN = "dev123";

type BackendCfg = {
  port?: number;
  token?: string;
  url?: string;
} | null;

function getElectronCfg(): BackendCfg {
  // In Electron renderer we may have window.__BACKEND_CONFIG injected by main process
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return typeof window !== "undefined" && (window as any).__BACKEND_CONFIG
    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (window as any).__BACKEND_CONFIG
    : null;
}

function getEnvCfg(): BackendCfg {
  // Vite env vars (set VITE_BACKEND_URL and VITE_APP_TOKEN for dev if desired)
  const url = import.meta.env.VITE_BACKEND_URL as string | undefined;
  const token = import.meta.env.VITE_APP_TOKEN as string | undefined;
  return { url, token };
}

function getBase(): string {
  const e = getElectronCfg();
  if (e && e.port) return `http://127.0.0.1:${e.port}`;
  const env = getEnvCfg();
  if (env && env.url) return env.url;
  return "http://127.0.0.1:8000"; // default dev backend
}

function getHeaders() {
  const e = getElectronCfg();
  if (e && e.token) return { Authorization: `Bearer ${e.token}` };
  const env = getEnvCfg();
  if (env && env.token) return { Authorization: `Bearer ${env.token}` };

  return { Authorization: `Bearer ${TOKEN}` }; // fallback to TOKEN defined at top
}

// Generic request helpers
async function post<T = any>(path: string, data?: any, opts?: any): Promise<T> {
  const res = await axios.post(`${getBase()}${path}`, data, {
    headers: { ...getHeaders(), ...(opts?.headers || {}) },
    timeout: opts?.timeout || 60000,
  });
  return res.data;
}

async function postForm<T = any>(
  path: string,
  formData: FormData,
  opts?: any
): Promise<T> {
  const res = await axios.post(`${getBase()}${path}`, formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
      ...(opts?.headers || {}),
    },
    timeout: opts?.timeout || 120000,
  });
  return res.data;
}

// Exported API
export async function translateText(text: string, target = "en") {
  return await post("/translate", { text, target_lang: target });
}

export async function translateFile(file: File, target = "en") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("target_lang", target);
  return await postForm("/files/translate", fd);
}

export async function getGlossary() {
  const res = await axios.get(`${getBase()}/glossary`, {
    headers: getHeaders(),
  });
  return res.data;
}

export async function addGlossaryEntry(word: string, meaning: string) {
  const res = await axios.post(
    `${BASE}/glossary`,
    {
      src: word,
      tgt: meaning,
      scope: "global",
    },
    { headers: getHeaders() }
  );

  // IMPORTANT: backend must return the inserted row id
  return res.data;
}

export async function deleteGlossaryEntry(id: number) {
  const res = await axios.delete(`${BASE}/glossary/${id}`, {
    headers: getHeaders(),
  });

  return res.data;
}
export async function fetchGlossary() {
  const res = await axios.get(`${BASE}/glossary`, {
    headers: getHeaders(),
  });

  return res.data;
}

export async function extractGlossaryPairs(sourceFile: File, targetFile: File) {
  const fd = new FormData();
  fd.append("source", sourceFile); // MUST match backend
  fd.append("target", targetFile);

  const res = await axios.post(`${getBase()}/glossary/extract`, fd, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
    },
    timeout: 120000,
  });

  return res.data;
}

export default {
  translateText,
  translateFile,
  getGlossary,
};
