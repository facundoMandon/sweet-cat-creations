import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../utils/AppError.js";

export type Rol = "admin" | "cliente" | "visitante";

/** Exige uno de los roles indicados. */
export function requireRole(...roles: Array<Rol>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || req.user.rol === "visitante") {
      return next(
        unauthorized("Necesitás iniciar sesión para realizar esta acción")
      );
    }
    if (!roles.includes(req.user.rol)) return next(forbidden());
    next();
  };
}

/** Atajo: sólo administradores. */
export const requireAdmin = requireRole("admin");

/** Cliente o admin: cualquiera con cuenta que pueda operar sobre pedidos. */
export const requireCliente = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.rol === "visitante") {
    return next(
      unauthorized("Necesitás registrarte como cliente para poder comprar")
    );
  }
  next();
};
