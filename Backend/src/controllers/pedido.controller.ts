import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as pedidoService from '../services/pedido.service';

export const createPedido = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = (req as any).user;
  const pedido = await pedidoService.createPedido(payload, user);
  res.status(201).json({ success: true, data: pedido });
});

export const getPedido = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const pedido = await pedidoService.getPedidoById(id);
  res.json({ success: true, data: pedido });
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const user = (req as any).user;
  const pedido = await pedidoService.changePedidoStatus(id, status, user);
  res.json({ success: true, data: pedido });
});
