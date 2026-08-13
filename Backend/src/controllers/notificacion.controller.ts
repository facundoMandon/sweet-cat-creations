import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as service from "../services/notificacion.service.js";
import { requiredId } from "../utils/validation.js";

export const listNotificaciones = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    ...(await service.listNotificaciones(req.query as never)),
  });
});

export const reenviarNotificacion = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.reenviarNotificacion(id) });
});