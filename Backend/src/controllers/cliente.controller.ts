import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as service from "../services/cliente.service.js";
import { requiredId } from "../utils/validation.js";

export const listClientes = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, ...(await service.listClientes(req.query as never)) });
});

export const getCliente = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.getCliente(id, req.user) });
});

export const createCliente = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.createCliente(req.body ?? {});
  res.status(201).json({ success: true, data });
});

export const updateCliente = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const data = await service.updateCliente(id, req.body ?? {}, req.user);
  res.json({ success: true, data });
});

export const deleteCliente = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  await service.deleteCliente(id);
  res.json({ success: true });
});
