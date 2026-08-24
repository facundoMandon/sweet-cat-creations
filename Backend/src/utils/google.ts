import crypto from "node:crypto";
import { badRequest, unauthorized } from "./AppError.js";

/**
 * Verificación de `id_token` de Google Identity Services sin dependencias:
 * se descargan las claves públicas (JWKS) de Google, se valida la firma RS256
 * y luego los claims (iss, aud, exp, email_verified).
 */

const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

interface Jwk {
  kid: string;
  n: string;
  e: string;
  kty: string;
  alg?: string;
}

let cache: { keys: Jwk[]; expiresAt: number } | null = null;

async function getKeys(): Promise<Jwk[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.keys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw unauthorized("No se pudieron validar las credenciales de Google");
  const body = (await res.json()) as { keys?: Jwk[] };
  const keys = body.keys ?? [];
  // Respetamos el Cache-Control de Google; por defecto 1 hora.
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control") ?? "")?.[1]);
  const ttl = Number.isFinite(maxAge) && maxAge > 0 ? maxAge : 3600;
  cache = { keys, expiresAt: Date.now() + ttl * 1000 };
  return keys;
}

function fromBase64Url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function publicKeyFromJwk(jwk: Jwk): crypto.KeyObject {
  return crypto.createPublicKey({
    key: { kty: "RSA", n: jwk.n, e: jwk.e } as never,
    format: "jwk",
  });
}

export interface GooglePerfil {
  sub: string;
  email: string;
  emailVerificado: boolean;
  nombre: string | null;
  apellido: string | null;
  avatar: string | null;
}

/** Devuelve el perfil de Google si el token es válido; si no, lanza 401. */
export async function verifyGoogleIdToken(idToken: unknown): Promise<GooglePerfil> {
  if (typeof idToken !== "string" || idToken.length < 20) {
    throw badRequest("Falta el token de Google");
  }
  const clientId = process.env["GOOGLE_CLIENT_ID"];
  if (!clientId) throw unauthorized("El inicio de sesión con Google no está configurado");

  const parts = idToken.split(".");
  if (parts.length !== 3) throw unauthorized("Token de Google inválido");
  const [rawHeader, rawBody, rawSignature] = parts as [string, string, string];

  let header: { kid?: string; alg?: string };
  let claims: Record<string, unknown>;
  try {
    header = JSON.parse(fromBase64Url(rawHeader).toString("utf8"));
    claims = JSON.parse(fromBase64Url(rawBody).toString("utf8"));
  } catch {
    throw unauthorized("Token de Google inválido");
  }
  if (header.alg !== "RS256") throw unauthorized("Token de Google inválido");

  const keys = await getKeys();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw unauthorized("Token de Google inválido (clave desconocida)");

  const ok = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${rawHeader}.${rawBody}`),
    publicKeyFromJwk(jwk),
    fromBase64Url(rawSignature)
  );
  if (!ok) throw unauthorized("Token de Google inválido (firma)");

  const now = Math.floor(Date.now() / 1000);
  const exp = Number(claims["exp"]);
  if (!Number.isFinite(exp) || exp <= now) throw unauthorized("El token de Google expiró");
  if (!ISSUERS.includes(String(claims["iss"]))) {
    throw unauthorized("Token de Google inválido (emisor)");
  }
  // Aceptamos varios client IDs separados por coma (preview + producción).
  const permitidos = clientId.split(",").map((c) => c.trim()).filter(Boolean);
  if (!permitidos.includes(String(claims["aud"]))) {
    throw unauthorized("Token de Google inválido (audiencia)");
  }

  const email = String(claims["email"] ?? "").toLowerCase();
  if (!email) throw unauthorized("Google no compartió el email de la cuenta");
  const emailVerificado =
    claims["email_verified"] === true || claims["email_verified"] === "true";
  if (!emailVerificado) {
    throw unauthorized("La cuenta de Google no tiene el email verificado");
  }

  return {
    sub: String(claims["sub"]),
    email,
    emailVerificado,
    nombre:
      (claims["given_name"] as string | undefined) ??
      (claims["name"] as string | undefined) ??
      null,
    apellido: (claims["family_name"] as string | undefined) ?? null,
    avatar: (claims["picture"] as string | undefined) ?? null,
  };
}
