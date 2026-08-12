import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/** Valida el Bearer JWT y publica el usuario en req.user. */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = readToken(req);
  if (!token) return next(unauthorized("Falta el token de acceso"));

  const payload = verifyAccessToken(token);
  if (!payload) return next(unauthorized("Token inválido o expirado"));

  req.user = {
    id: payload.sub,
    email: payload.email,
    rol: payload.rol,
    clienteId: payload.clienteId,
    raw: payload,
  };
  next();
}

/** Igual que authMiddleware pero no falla si no hay token (rutas públicas). */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = readToken(req);
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = {
        id: payload.sub,
        email: payload.email,
        rol: payload.rol,
        clienteId: payload.clienteId,
        raw: payload,
      };
    }
  }
  next();
}
