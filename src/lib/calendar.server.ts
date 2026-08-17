/**
 * Integración con Google Calendar (vía connector gateway de Lovable).
 * Server-only: nunca importar desde código de cliente.
 */

import { brand } from "@/config";

const GATEWAY_URL =
  "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

/** Calendario del vendedor donde se crean los recordatorios de envío. */
export const VENDEDOR_CALENDAR_ID = brand.contact.calendarId;

/** Fallback cuando no hay variable de entorno ni request disponible. */
export const DEFAULT_APP_BASE_URL = brand.seo.baseUrl.replace(/\/+$/, "") + "/";

/** Resuelve la URL base del sistema en este orden: env → request origin → fallback. */
export function resolveAppBaseUrl(request?: Request): string {
  const envUrl = process.env["APP_BASE_URL"];
  if (envUrl) return envUrl.replace(/\/+$/, "") + "/";
  const requestOrigin = request ? new URL(request.url).origin : undefined;
  if (requestOrigin) return requestOrigin + "/";
  return DEFAULT_APP_BASE_URL;
}

export function pedidoAdminUrl(pedidoId: number, request?: Request): string {
  return `${resolveAppBaseUrl(request)}admin/pedidos?pedido=${pedidoId}`;
}

/** Días de anticipación de cada recordatorio. */
export const RECORDATORIO_DIAS = [7, 1] as const;



export interface CalendarEvent {
  id: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  start?: { date?: string; dateTime?: string }
  end?: { date?: string; dateTime?: string }
  extendedProperties?: { private?: Record<string, string> }
}

function headers(): Record<string, string> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_CALENDAR_API_KEY"];
  if (!lovableKey || !connectionKey) {
    throw new Error(
      "Google Calendar no está conectado (faltan credenciales del conector).",
    );
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connectionKey,
    "Content-Type": "application/json",
  };
}

async function gateway<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method: init.method ?? "GET",
    headers: headers(),
    ...(init.body !== undefined
      ? { body: JSON.stringify(init.body) }
      : {}),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Google Calendar request failed [${res.status}]: ${errorBody}`);
    throw new Error(`Google Calendar [${res.status}]: ${errorBody}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

const calendarPath = () =>
  `/calendars/${encodeURIComponent(VENDEDOR_CALENDAR_ID)}/events`;

/** Fecha (YYYY-MM-DD) restando `dias` a la fecha de entrega. */
export function fechaRecordatorio(fechaEntrega: string, dias: number): string {
  const base = new Date(`${fechaEntrega.slice(0, 10)}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() - dias);
  return base.toISOString().slice(0, 10);
}

function addDay(fecha: string): string {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Lista los eventos de recordatorio de un pedido (o de todos). */
export async function listarRecordatorios(
  pedidoId?: number,
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    maxResults: "250",
    singleEvents: "true",
    orderBy: "startTime",
    privateExtendedProperty: `app=${brand.slug}`,
  });
  if (pedidoId !== undefined) {
    params.append("privateExtendedProperty", `pedidoId=${pedidoId}`);
  }
  const data = await gateway<{ items?: CalendarEvent[] }>(
    `${calendarPath()}?${params.toString()}`,
  );
  return data.items ?? [];
}

export async function eliminarRecordatorios(pedidoId: number): Promise<number> {
  const eventos = await listarRecordatorios(pedidoId);
  for (const ev of eventos) {
    await gateway<void>(`${calendarPath()}/${encodeURIComponent(ev.id)}`, {
      method: "DELETE",
    });
  }
  return eventos.length;
}

export interface SyncInput {
  pedidoId: number
  clienteNombre: string
  fechaEntrega: string | null
  /** Dirección de entrega mostrada/navegable desde el evento. */
  direccion?: string | null | undefined
  lat?: number | null | undefined
  lng?: number | null | undefined
  /** Si el pedido está cancelado, se eliminan los recordatorios. */
  cancelado?: boolean | undefined
}

/**
 * Crea (o recrea, si la fecha cambió) los recordatorios de 7 y 1 día antes.
 * Es idempotente: borra los eventos previos del pedido y vuelve a crearlos.
 */
export async function sincronizarRecordatorios(
  input: SyncInput,
  request?: Request,
): Promise<{ creados: number; eliminados: number }> {
  const eliminados = await eliminarRecordatorios(input.pedidoId);
  if (input.cancelado || !input.fechaEntrega) {
    return { creados: 0, eliminados };
  }

  const url = pedidoAdminUrl(input.pedidoId, request);
  const tienePunto =
    typeof input.lat === "number" && typeof input.lng === "number";
  const mapsUrl = tienePunto
    ? `https://www.google.com/maps/search/?api=1&query=${input.lat},${input.lng}`
    : input.direccion
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input.direccion)}`
      : null;
  const ubicacion = input.direccion ?? (tienePunto ? `${input.lat},${input.lng}` : null);
  const hoy = new Date().toISOString().slice(0, 10);
  let creados = 0;

  for (const dias of RECORDATORIO_DIAS) {
    const fecha = fechaRecordatorio(input.fechaEntrega, dias);
    if (fecha < hoy) continue; // no crear recordatorios en el pasado
    await gateway<CalendarEvent>(calendarPath(), {
      method: "POST",
      body: {
        summary: `Recordatorio de Envío: Pedido N° ${input.pedidoId} - ${input.clienteNombre}`,
        description:
          `El pedido N° ${input.pedidoId} del Cliente ${input.clienteNombre} deberá ser entregado en ${dias} ` +
          `${dias === 1 ? "día" : "días"}.` +
          (ubicacion ? `\n\nDirección de entrega: ${ubicacion}` : "") +
          (mapsUrl ? `\nCómo llegar: ${mapsUrl}` : "") +
          `\n\nVer detalle del pedido: ${url}`,
        location: ubicacion ?? url,
        source: { title: `Pedido N° ${input.pedidoId}`, url },
        start: { date: fecha },
        end: { date: addDay(fecha) },
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 9 * 60 }],
        },
        extendedProperties: {
          private: {
            app: brand.slug,
            pedidoId: String(input.pedidoId),
            diasAntes: String(dias),
            fechaEntrega: input.fechaEntrega.slice(0, 10),
          },
        },
      },
    });
    creados += 1;
  }

  return { creados, eliminados };
}
