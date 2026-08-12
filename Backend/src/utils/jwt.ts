import crypto from "node:crypto";

/**
 * Verificación de JWT HS256 compatible con los access tokens emitidos por la
 * capa de autenticación de la aplicación (mismo secreto JWT_ACCESS_SECRET).
 */

export interface AccessTokenPayload {
  sub: string;
  email: string;
  rol: "admin" | "cliente";
  type?: string;
  exp: number;
  iat?: number;
  clienteId?: number;
}

function fromBase64Url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  const secret = process.env["JWT_ACCESS_SECRET"];
  if (!secret) {
    console.error("JWT_ACCESS_SECRET no está configurado");
    return null;
  }
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts as [string, string, string];

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest();
  const received = fromBase64Url(signature);
  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(body).toString("utf8")
    ) as AccessTokenPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }
    if (payload.type && payload.type !== "access") return null;
    return payload;
  } catch {
    return null;
  }
}
