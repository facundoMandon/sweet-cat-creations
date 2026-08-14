import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as service from "../services/usuario.service.js";
import { requiredId } from "../utils/validation.js";

export const listUsuarios = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, ...(await service.listUsuarios(req.query as never)) });
});

export const getUsuario = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.getUsuario(id, req.user) });
});

export const createUsuario = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.createUsuario(req.body ?? {});
  res.status(201).json({ success: true, data });
});

export const updateUsuario = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const data = await service.updateUsuario(id, req.body ?? {}, req.user);
  res.json({ success: true, data });
});

export const cambiarPassword = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  await service.cambiarPassword(id, req.body ?? {}, req.user);
  res.json({ success: true });
});

export const deleteUsuario = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const result = await service.deleteUsuario(id);
  res.json({
    success: true,
    message: result.eliminado
      ? "Usuario eliminado"
      : "El usuario tiene pedidos: se desactivó en lugar de eliminarse",
  });
});
