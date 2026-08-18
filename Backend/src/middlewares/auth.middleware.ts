import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../utils/AppError.js";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/jwt.js";

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

function toUser(payload: AccessTokenPayload): NonNullable<Request["user"]> {
  return {
    id: payload.sub,
    email: payload.email,
    rol: payload.rol,
    clienteId: payload.clienteId,
    raw: payload,
  };
}

/** Usuario anónimo: puede navegar la parte pública, no puede comprar. */
export const VISITANTE: NonNullable<Request["user"]> = {
  id: "",
  email: "",
  rol: "visitante",
};

/** Valida el Bearer JWT y publica el usuario en req.user. */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = readToken(req);


  console.log("AUTH HEADER:", req.headers.authorization);
  console.log("TOKEN:", token ? "EXISTE" : "NO EXISTE");
  
  if (!token) return next(unauthorized("Falta el token de acceso"));
  const payload = verifyAccessToken(token);

   console.log("JWT PAYLOAD:", payload);

  if (!payload) return next(unauthorized("Token inválido o expirado"));

  req.user = toUser(payload);
  next();
}

/**
 * Igual que authMiddleware pero no falla si no hay token: en ese caso el
 * request queda con rol "visitante" (sólo lectura de la parte pública).
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = readToken(req);
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = toUser(payload);
      return next();
    }
  }
  req.user = { ...VISITANTE };
  next();
}
