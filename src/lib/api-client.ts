import axios from "axios";

/**
 * Cliente HTTP centralizado.
 * Definí VITE_API_URL (ej: http://localhost:3000) para consumir tu API Express real.
 * Si no está definida, la app funciona con la capa de datos mock incluida.
 */
export const API_URL = 
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";
export const USE_MOCK = !API_URL;

const TOKEN_KEY = "blackcats_token";

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
});

// Interceptor de request: inyecta el JWT en cada llamada
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: normaliza errores y cierra sesión ante un 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      setToken(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("blackcats_user");
      }
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Ocurrió un error inesperado";
    return Promise.reject(new Error(message));
  },
);
