import { sequelize, Pedido, Producto, Cliente, ProductoPedido } from '../models';
import { AppError } from '../utils/AppError';
import { serialize } from '../utils/serialize';
import { estados, canTransition } from '../utils/estados';
import * as notificacionService from './notificacion.service';
import * as calendarService from './calendar.service';

interface ItemPayload { productoId: number; cantidad: number; }
interface CreatePedidoPayload {
  clienteId: number;
  fechaEntrega: string | Date;
  items: ItemPayload[];
  notas?: string;
}

export async function createPedido(payload: CreatePedidoPayload, currentUser: any) {
  const t = await sequelize.transaction();
  try {
    const cliente = await Cliente.findByPk(payload.clienteId, { transaction: t });
    if (!cliente) throw new AppError(404, 'Cliente no encontrado');

    // Ownership: si ClienteEmail definido, forzar coincidencia o admin
    if (cliente.ClienteEmail && !currentUser?.isAdmin && currentUser?.email !== cliente.ClienteEmail) {
      throw new AppError(403, 'No autorizado para crear pedidos para este cliente');
    }

    const entrega = new Date(payload.fechaEntrega);
    const hoyMasUno = new Date();
    hoyMasUno.setHours(0, 0, 0, 0);
    hoyMasUno.setDate(hoyMasUno.getDate() + 1);
    if (isNaN(entrega.getTime()) || entrega < hoyMasUno) {
      throw new AppError(400, 'La fecha de entrega debe ser al menos mañana');
    }

    const pedido = await Pedido.create({
      clienteId: cliente.id,
      fechaEntrega: entrega,
      estado: estados.PENDIENTE ?? 'PENDIENTE',
      total: 0,
      notas: payload.notas ?? null,
    }, { transaction: t });

    let total = 0;
    for (const it of payload.items) {
      const prod = await Producto.findByPk(it.productoId, { transaction: t });
      if (!prod) throw new AppError(404, `Producto ${it.productoId} no encontrado`);
      if (prod.estado === 'Inactivo') throw new AppError(400, 'Producto inactivo no puede pedirse');

      const precio = Number(serialize(prod.precio));
      const subtotal = precio * it.cantidad;
      total += subtotal;

      // ProductoPedido es el join model según tu naming (ver Backend/src/models/ProductoPedido.ts)
      await ProductoPedido.create({
        pedidoId: pedido.id,
        productoId: prod.id,
        cantidad: it.cantidad,
        precioUnitario: precio,
        subtotal,
      }, { transaction: t });
    }

    pedido.total = total;
    await pedido.save({ transaction: t });

    t.afterCommit(async () => {
      try {
        const clienteReload = await Cliente.findByPk(cliente.id);
        await notificacionService.notifyPedidoCreated(pedido, clienteReload);
        const { eventId } = await calendarService.createEventForPedido(pedido);
        if (eventId) {
          await Pedido.update({ calendarEventId: eventId }, { where: { id: pedido.id } });
        }
      } catch (err) {
        console.error('afterCommit hooks failed', err);
      }
    });

    await t.commit();
    return pedido;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export async function getPedidoById(id: number) {
  const pedido = await Pedido.findByPk(id, {
    include: ['items', 'cliente'],
  });
  if (!pedido) throw new AppError(404, 'Pedido no encontrado');
  return pedido;
}

export async function changePedidoStatus(id: number, newStatus: string, actor: any) {
  const t = await sequelize.transaction();
  try {
    const pedido = await Pedido.findByPk(id, { transaction: t });
    if (!pedido) throw new AppError(404, 'Pedido no encontrado');
    const oldStatus = pedido.estado;
    if (oldStatus === newStatus) {
      await t.rollback();
      return pedido;
    }
    if (!canTransition(oldStatus, newStatus)) {
      throw new AppError(400, `Transición ${oldStatus} -> ${newStatus} no permitida`);
    }
    pedido.estado = newStatus;
    await pedido.save({ transaction: t });

    t.afterCommit(async () => {
      try {
        await notificacionService.notifyPedidoStatusChanged(pedido, oldStatus, newStatus);
        if ([estados.CONFIRMADO, estados.PROGRAMADO].includes(newStatus)) {
          if (pedido.calendarEventId) {
            await calendarService.updateEventForPedido(pedido, pedido.calendarEventId);
          } else {
            const { eventId } = await calendarService.createEventForPedido(pedido);
            if (eventId) {
              await Pedido.update({ calendarEventId: eventId }, { where: { id: pedido.id } });
            }
          }
        }
      } catch (err) {
        console.error('afterCommit status hooks failed', err);
      }
    });

    await t.commit();
    return pedido;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}
