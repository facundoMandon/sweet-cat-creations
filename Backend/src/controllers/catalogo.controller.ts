import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as service from "../services/catalogo.service.js";
import { requiredId } from "../utils/validation.js";

/* ------------------------------- Categorías ------------------------------ */

export const listCategorias = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await service.listCategorias() });
});

export const getCategoria = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.getCategoria(id) });
});

export const createCategoria = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.createCategoria(req.body ?? {});
  res.status(201).json({ success: true, data });
});

export const updateCategoria = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const data = await service.updateCategoria(id, req.body ?? {});
  res.json({ success: true, data });
});

export const deleteCategoria = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  await service.deleteCategoria(id);
  res.json({ success: true });
});

/* ----------------------------- Subcategorías ------------------------------ */

export const listSubCategorias = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await service.listSubCategorias(req.query as never) });
});

export const getSubCategoria = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.getSubCategoria(id) });
});

export const createSubCategoria = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.createSubCategoria(req.body ?? {});
  res.status(201).json({ success: true, data });
});

export const updateSubCategoria = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const data = await service.updateSubCategoria(id, req.body ?? {});
  res.json({ success: true, data });
});

export const deleteSubCategoria = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  await service.deleteSubCategoria(id);
  res.json({ success: true });
});

/* -------------------------------- Eventos --------------------------------- */

export const listEventos = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await service.listEventos() });
});

export const getEvento = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.getEvento(id) });
});

export const createEvento = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.createEvento(req.body ?? {});
  res.status(201).json({ success: true, data });
});

export const updateEvento = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  const data = await service.updateEvento(id, req.body ?? {});
  res.json({ success: true, data });
});

export const deleteEvento = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  await service.deleteEvento(id);
  res.json({ success: true });
});

/* --------------------- Estados (referencia, sólo lectura) ----------------- */

export const listProdEstados = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await service.listProdEstados() });
});

export const listPedidoEstados = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await service.listPedidoEstados() });
});