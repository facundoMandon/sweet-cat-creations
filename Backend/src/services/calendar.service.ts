import { nombreCliente, emailCliente } from "./cliente.service.js";
import type { Cliente, Pedido } from "../models/index.js";

/**
 * Recordatorios de entrega en el calendario del vendedor.
 *
 * Se crean dos eventos por pedido: 7 y 1 día antes de la fecha de entrega.
 * Las llamadas ocurren SIEMPRE después del COMMIT de la transacción, por lo que
 * un fallo acá nunca deja el pedido inconsistente.
 */

export const VENDEDOR_CALENDAR_ID =
  process.env["VENDEDOR_CALENDAR_ID"] ?? "facundo-mandon@hotmail.com";
export const APP_BASE_URL =
  process.env["APP_BASE_URL"] ?? "https://blackcats.lovable.app";
export const RECORDATORIO_DIAS = [7, 1] as const;

export interface RecordatorioEvento {
  key: string;
  dias: number;
  fecha: string;
  titulo: string;
  descripcion: string;
  url: string;
}

function restarDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha.getTime());
  d.setDate(d.getDate() - dias);
  return d;
}

export function buildRecordatorios(
  pedido: Pedido,
  clienteNombre: string
): RecordatorioEvento[] {
  const entrega = new Date(pedido.PedidoFechaEntrega);
  const url = `${APP_BASE_URL}/admin/pedidos/${pedido.PedidoID}`;
  return RECORDATORIO_DIAS.map((dias) => ({
    key: `pedido-${pedido.PedidoID}-d${dias}`,
    dias,
    fecha: restarDias(entrega, dias).toISOString(),
    titulo: `Recordatorio de Envío: Pedido N° ${pedido.PedidoID} - ${clienteNombre}`,
    descripcion: `El pedido N° ${pedido.PedidoID} del Cliente ${clienteNombre} deberá ser entregado en ${dias} días. Detalle: ${url}`,
    url,
  }));
}

/**
 * Crea o actualiza los recordatorios del pedido (idempotente por `key`).
 * Reemplazar el console.log por la llamada real a la API de Google Calendar.
 */
export async function syncRecordatorios(
  pedido: Pedido,
  cliente: Cliente | null
): Promise<void> {
  try {
    const eventos = buildRecordatorios(
      pedido,
      nombreCliente(cliente) ?? `Cliente ${pedido.ClienteID}`
    );
    for (const ev of eventos) {
      console.log("[calendar] upsert", VENDEDOR_CALENDAR_ID, ev.key, ev.fecha);
    }
  } catch (err) {
    console.error("[calendar] syncRecordatorios falló", err);
  }
}

/** Elimina los recordatorios del pedido (cancelación o baja). */
export async function deleteRecordatorios(pedidoId: number): Promise<void> {
  try {
    for (const dias of RECORDATORIO_DIAS) {
      console.log(
        "[calendar] delete",
        VENDEDOR_CALENDAR_ID,
        `pedido-${pedidoId}-d${dias}`
      );
    }
  } catch (err) {
    console.error("[calendar] deleteRecordatorios falló", err);
  }
}
