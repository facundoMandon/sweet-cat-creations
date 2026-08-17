import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

function gatewayHeaders(): Record<string, string> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !connectionKey) {
    throw new Error("Google Maps no está conectado (faltan credenciales del conector).");
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connectionKey,
  };
}

function explicar403(body: string): string {
  if (body.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
    return "La clave de servidor de Google Maps tiene restricción por dominio. Configurala como 'Ninguna' o por IP en Google Cloud Console.";
  }
  if (body.includes("API_KEY_SERVICE_BLOCKED")) {
    return "La clave de servidor de Google Maps no habilita esta API. Agregala a la lista de APIs permitidas en Google Cloud Console.";
  }
  return "Google Maps rechazó la solicitud (403). Revisá las restricciones de la clave.";
}

export interface GeocodeResultado {
  direccion: string
  lat: number
  lng: number
  placeId: string | null
}

/**
 * Geocodifica una dirección escrita a mano (sólo cuando el cliente no eligió
 * un punto en el mapa). Se llama una vez al confirmar el pedido.
 */
export const geocodificarDireccion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ direccion: z.string().min(3).max(300) }).parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const res = await fetch(
        `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(
          data.direccion,
        )}`,
        { headers: gatewayHeaders() },
      );
      if (res.status === 403) {
        const body = await res.text();
        console.error(`Google Maps geocode 403: ${body}`);
        return { ok: false as const, error: explicar403(body) };
      }
      if (!res.ok) {
        const body = await res.text();
        console.error(`Google Maps geocode [${res.status}]: ${body}`);
        return { ok: false as const, error: `Google Maps [${res.status}]` };
      }
      const json = (await res.json()) as {
        status?: string
        results?: Array<{
          formatted_address?: string
          place_id?: string
          geometry?: { location?: { lat: number; lng: number } }
        }>
      };
      const first = json.results?.[0];
      const loc = first?.geometry?.location;
      if (!first || !loc) {
        return { ok: false as const, error: "No encontramos esa dirección en el mapa" };
      }
      return {
        ok: true as const,
        resultado: {
          direccion: first.formatted_address ?? data.direccion,
          lat: loc.lat,
          lng: loc.lng,
          placeId: first.place_id ?? null,
        } satisfies GeocodeResultado,
      };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  });
