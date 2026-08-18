import axios from "axios";
import { storageKey } from "@/config";

/**
 * Cliente HTTP centralizado.
 * VITE_API_URL debe estar definida (backend real). Ejemplo:
 *   VITE_API_URL=https://api-blackcats.onrender.com
 */
const API_URL = import.meta.env["VITE_API_URL"] as string | undefined;

if (!API_URL) {
  console.error(
    "VITE_API_URL no está definida. La app requiere el backend real para funcionar."
  );
}

const TOKEN_KEY = storageKey("token");

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : "/api",
  headers: { "Content-Type": "application/json" },
  // Render (plan free) puede tardar ~50s en despertar tras inactividad.
  timeout: 60000,
  withCredentials: true,
});

/** La API responde `{ success, data, meta }`; esto devuelve sólo `data`. */
export function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function unwrapList<T>(payload: unknown): T[] {
  const data = unwrap<T[]>(payload);
  return Array.isArray(data) ? data : [];
}
