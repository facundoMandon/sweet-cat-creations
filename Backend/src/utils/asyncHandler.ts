import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Envuelve un handler async para que cualquier rechazo llegue al errorHandler
 * global sin necesidad de try/catch en cada controller.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
