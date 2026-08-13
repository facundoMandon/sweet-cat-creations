import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as service from "../services/producto.service.js";
import { requiredId } from "../utils/validation.js";

/** Catálogo público: sólo productos visibles. */
export const listCatalogo = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, ...(await service.listProductos(req.query as never, true)) });
});

export const getCatalogoProducto = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.getProducto(id, true) });
});

/** Administración: incluye inactivos. */
export const listProductos = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    ...(await service.listProductos(req.query as never, false)),
  });
});

export const getProducto = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.getProducto(id, false) });
});

export const createProducto = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await service.createProducto(req.body ?? {}) });
});

export const updateProducto = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.updateProducto(id, req.body ?? {}) });
});

export const desactivarProducto = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  res.json({ success: true, data: await service.desactivarProducto(id) });
});

export const deleteProducto = asyncHandler(async (req: Request, res: Response) => {
  const id = requiredId(req.params["id"], "id");
  await service.deleteProducto(id);
  res.json({ success: true });
});
