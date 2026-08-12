/**
 * Error de aplicación con código HTTP asociado.
 * Todo error "esperado" (regla de negocio, validación, permisos) debe lanzarse
 * con esta clase para que el errorHandler global lo traduzca correctamente.
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    if (details !== undefined) this.details = details;
  }
}

export const badRequest = (msg: string, details?: unknown) =>
  new AppError(400, msg, details);
export const unauthorized = (msg = "Usuario no autenticado") =>
  new AppError(401, msg);
export const forbidden = (msg = "No tenés permisos para esta operación") =>
  new AppError(403, msg);
export const notFound = (msg = "Recurso inexistente") => new AppError(404, msg);
export const conflict = (msg: string, details?: unknown) =>
  new AppError(409, msg, details);
