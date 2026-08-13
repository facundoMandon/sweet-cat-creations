import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as service from "../services/pedido.service.js";
import { requiredId } from "../utils/validation.js";

export const listPedidos = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    ...(await service.listPedidos(req.query as never, req.user)),
  });
});

export const getPedido = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.getPedido(id, req.user) });
});

export const createPedido = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.createPedido(req.body ?? {}, req.user);
  res.status(201).json({ success: true, data });
});

export const updatePedido = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const data = await service.updatePedido(id, req.body ?? {}, req.user);
  res.json({ success: true, data });
});

export const cambiarEstado = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const data = await service.cambiarEstado(id, req.body ?? {}, req.user);
  res.json({ success: true, data });
});

export const reprogramarPedido = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const data = await service.reprogramarPedido(id, req.body ?? {}, req.user);
  res.json({ success: true, data });
});

export const deletePedido = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  await service.deletePedido(id);
  res.json({ success: true });
});

export const resumenPedidos = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await service.resumenPedidos() });
});