import { Notificacion, Pedido, Cliente } from "../models/index.js";
import { nombreCliente, emailCliente } from "./cliente.service.js";
import { notFound } from "../utils/AppError.js";
import { toJSON } from "../utils/serialize.js";
import {
  parsePagination,
  parseSort,
  paginated,
  type Paginated,
} from "../utils/query.js";
import { optionalId, optionalString } from "../utils/validation.js";

const SORTS: Record<string, string | string[]> = {
  fecha: "NotiFecha",
  id: "NotifID",
};

/**
 * Envío real de la notificación. Hoy escribe en el log; para producción
 * reemplazar por el proveedor de email/WhatsApp manteniendo la misma firma.
 */
async function enviar(
  pedido: Pedido,
  cliente: Cliente | null,
  asunto: string
): Promise<boolean> {
  const destino = emailCliente(cliente);
  if (!destino) {
    console.warn("[notificacion] pedido sin email de destino", pedido.PedidoID);
    return false;
  }
  console.log("[notificacion]", { destino, asunto, pedido: pedido.PedidoID });
  return true;
}

/**
 * Registra (y "envía") una notificación asociada a un pedido.
 * Se invoca siempre DESPUÉS del COMMIT: un fallo acá nunca revierte el pedido.
 */
export async function registrarNotificacion(
  pedido: Pedido,
  cliente: Cliente | null,
  asunto: string
): Promise<void> {
  let estado: "enviado" | "fallido" = "fallido";
  try {
    estado = (await enviar(pedido, cliente, asunto)) ? "enviado" : "fallido";
  } catch (err) {
    console.error("[notificacion] error de envío", err);
  }
  try {
    await Notificacion.create({
      NotiEstado: estado,
      NotiFecha: new Date(),
      PedidoID: pedido.PedidoID,
    } as never);
  } catch (err) {
    console.error("[notificacion] no se pudo registrar", err);
  }
}

export async function notificarPedidoCreado(
  pedido: Pedido,
  cliente: Cliente | null
): Promise<void> {
  await registrarNotificacion(
    pedido,
    cliente,
    `Confirmación del pedido N° ${pedido.PedidoID}`
  );
}

/**
 * Notificación especial cuando el pedido fue cancelado por el propio cliente
 * (y no por el administrador). El registro queda igualmente asociado al
 * pedido; en un canal real esto dispararía un aviso al administrador.
 */
export async function notificarCancelacionPorCliente(
  pedido: Pedido,
  cliente: Cliente | null
): Promise<void> {
  console.log(
    "[notificacion] Aviso al administrador: el pedido fue cancelado por el cliente",
    { pedidoId: pedido.PedidoID, cliente: nombreCliente(cliente) ?? pedido.ClienteID }
  );
  await registrarNotificacion(
    pedido,
    cliente,
    `El cliente canceló el pedido N° ${pedido.PedidoID}`
  );
}

export async function notificarCambioEstado(
  pedido: Pedido,
  cliente: Cliente | null,
  estadoAnterior: string,
  estadoNuevo: string
): Promise<void> {
  await registrarNotificacion(
    pedido,
    cliente,
    `Pedido N° ${pedido.PedidoID}: ${estadoAnterior} -> ${estadoNuevo}`
  );
}

export async function listNotificaciones(
  query: Record<string, unknown>
): Promise<Paginated<unknown>> {
  const page = parsePagination(query);
  const [column, dir] = parseSort(query, SORTS, "fecha");

  const where: Record<string, unknown> = {};
  const pedidoId = optionalId(query["pedidoId"], "pedidoId");
  if (pedidoId) where["PedidoID"] = pedidoId;
  const estado = optionalString(query["estado"], "estado", 20);
  if (estado) where["NotiEstado"] = estado;

  const { rows, count } = await Notificacion.findAndCountAll({
    where,
    order: [[column as string, dir]],
    limit: page.limit,
    offset: page.offset,
    include: [{ model: Pedido, as: "pedido" }],
  });
  return paginated(toJSON<unknown[]>(rows), count, page);
}

/** Reintenta el envío de una notificación fallida. */
export async function reenviarNotificacion(id: number) {
  const noti = await Notificacion.findByPk(id);
  if (!noti) throw notFound("Notificación no encontrada");
  const pedido = await Pedido.findByPk(noti.PedidoID);
  if (!pedido) throw notFound("Pedido asociado inexistente");
  const cliente = await Cliente.findByPk(pedido.ClienteID);

  let estado: "enviado" | "fallido" = "fallido";
  try {
    estado = (await enviar(pedido, cliente, `Reenvío pedido N° ${pedido.PedidoID}`))
      ? "enviado"
      : "fallido";
  } catch (err) {
    console.error("[notificacion] reintento fallido", err);
  }
  await noti.update({ NotiEstado: estado, NotiFecha: new Date() });
  return toJSON(noti);
}