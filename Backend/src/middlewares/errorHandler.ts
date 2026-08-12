import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

/** 404 para rutas no registradas. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Manejo global de errores. Traduce errores conocidos de Sequelize a códigos
 * HTTP apropiados y nunca expone detalles internos al cliente.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  const name = (err as { name?: string })?.name ?? "";

  if (name === "SequelizeValidationError") {
    console.error("[validation]", err);
    res.status(400).json({ success: false, message: "Datos inválidos" });
    return;
  }
  if (name === "SequelizeUniqueConstraintError") {
    console.error("[unique]", err);
    res
      .status(409)
      .json({ success: false, message: "El registro ya existe" });
    return;
  }
  if (name === "SequelizeForeignKeyConstraintError") {
    console.error("[fk]", err);
    res.status(409).json({
      success: false,
      message:
        "La operación viola una relación existente entre registros",
    });
    return;
  }

  // Log interno completo, respuesta genérica hacia afuera.
  console.error("[error]", err);
  res
    .status(500)
    .json({ success: false, message: "Error interno del servidor" });
}
