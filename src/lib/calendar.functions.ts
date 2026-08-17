import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const syncSchema = z.object({
  pedidoId: z.number().int().positive(),
  clienteNombre: z.string().min(1).max(200),
  fechaEntrega: z.string().min(8).max(40).nullable(),
  direccion: z.string().max(300).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  cancelado: z.boolean().optional(),
});

/** Crea/actualiza los recordatorios (7 y 1 día antes) en Google Calendar. */
export const syncPedidoRecordatorios = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => syncSchema.parse(data))
  .handler(async ({ data }) => {
    const { sincronizarRecordatorios } = await import("./calendar.server");
    const request = getRequest();
    try {
      return { ok: true as const, ...(await sincronizarRecordatorios(data, request)) };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  });

/** Elimina los recordatorios de un pedido (cancelación / borrado). */
export const deletePedidoRecordatorios = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ pedidoId: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { eliminarRecordatorios } = await import("./calendar.server");
    try {
      return { ok: true as const, eliminados: await eliminarRecordatorios(data.pedidoId) };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  });

/** Lista los eventos del calendario del vendedor para el panel admin. */
export const listRecordatorios = createServerFn({ method: "GET" }).handler(
  async () => {
    const { listarRecordatorios, VENDEDOR_CALENDAR_ID } = await import(
      "./calendar.server"
    );
    try {
      const items = await listarRecordatorios();
      return {
        ok: true as const,
        calendarId: VENDEDOR_CALENDAR_ID,
        eventos: items.map((e) => ({
          id: e.id,
          titulo: e.summary ?? "",
          descripcion: e.description ?? "",
          url: e.location ?? "",
          htmlLink: e.htmlLink ?? "",
          fecha: e.start?.date ?? e.start?.dateTime?.slice(0, 10) ?? "",
          pedidoId: Number(e.extendedProperties?.private?.["pedidoId"] ?? 0),
          diasAntes: Number(e.extendedProperties?.private?.["diasAntes"] ?? 0),
        })),
      };
    } catch (error) {
      return {
        ok: false as const,
        calendarId: VENDEDOR_CALENDAR_ID,
        eventos: [],
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },
);
