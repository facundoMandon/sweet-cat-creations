import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as service from "../services/auth.service.js";
import { unauthorized } from "../utils/AppError.js";
import { REFRESH_TTL_SECONDS } from "../utils/jwt.js";

const REFRESH_COOKIE = "blackcats_refresh";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie?.(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: REFRESH_TTL_SECONDS * 1000,
    path: "/",
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie?.(REFRESH_COOKIE, { path: "/" });
}

/** Lee la cookie de refresh sin depender de cookie-parser. */
function readRefreshCookie(req: Request): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === REFRESH_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function responder(res: Response, sesion: service.SesionEmitida, status = 200) {
  setRefreshCookie(res, sesion.refreshToken);
  res.status(status).json({
    success: true,
    token: sesion.token,
    expiresIn: sesion.expiresIn,
    usuario: sesion.usuario,
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  responder(res, await service.register(req.body ?? {}), 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  responder(res, await service.login(req.body ?? {}));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token =
    (req.body?.refreshToken as string | undefined) ?? readRefreshCookie(req);
  responder(res, await service.refresh(token));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.rol === "visitante") throw unauthorized();
  res.json({ success: true, data: await service.me(Number(req.user.id)) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearRefreshCookie(res);
  res.json({ success: true });
});
