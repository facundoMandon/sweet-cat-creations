import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as clienteService from '../services/cliente.service';

export const createCliente = asyncHandler(async (req: Request, res: Response) => {
  const cliente = await clienteService.createCliente(req.body);
  res.status(201).json({ success: true, data: cliente });
});

export const getCliente = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const cliente = await clienteService.getClienteById(id);
  res.json({ success: true, data: cliente });
});

export const listClientes = asyncHandler(async (req: Request, res: Response) => {
  const { q, page, limit } = req.query as any;
  const result = await clienteService.findClientes({ q, page: Number(page || 1), limit: Number(limit || 20) });
  res.json({ success: true, ...result });
});

export const updateCliente = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const cliente = await clienteService.updateCliente(id, req.body);
  res.json({ success: true, data: cliente });
});

export const deleteCliente = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const cliente = await clienteService.softDeleteCliente(id);
  res.json({ success: true, data: cliente });
});
