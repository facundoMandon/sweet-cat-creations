import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../utils/AppError.js";

/** Exige uno de los roles indicados. */
export function requireRole(...roles: Array<"admin" | "cliente">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.rol)) return next(forbidden());
    next();
  };
}

/** Atajo: sólo administradores. */
export const requireAdmin = requireRole("admin");
