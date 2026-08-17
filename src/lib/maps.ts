/**
 * Helpers de Google Maps seguros para el navegador (sólo construyen URLs).
 * Las llamadas a la API viven en `maps.functions.ts` (servidor).
 */

import { brand } from "@/config";

export interface Ubicacion {
  /** Dirección formateada tal cual la devuelve Google (o la que escribió el cliente). */
  direccion: string
  lat: number | null
  lng: number | null
  placeId: string | null
  /** "Timbre 3B, portón negro", etc. */
  referencias: string | null
}

export const ubicacionVacia: Ubicacion = {
  direccion: "",
  lat: null,
  lng: null,
  placeId: null,
  referencias: null,
}

export function tieneCoordenadas(
  u: { lat?: number | null; lng?: number | null } | null | undefined,
): boolean {
  return (
    !!u &&
    typeof u.lat === "number" &&
    typeof u.lng === "number" &&
    Number.isFinite(u.lat) &&
    Number.isFinite(u.lng)
  )
}

/** Link para ver el punto en Google Maps. */
export function mapsPlaceUrl(input: {
  lat?: number | null
  lng?: number | null
  direccion?: string | null
}): string {
  if (tieneCoordenadas(input)) {
    return `https://www.google.com/maps/search/?api=1&query=${input.lat},${input.lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    input.direccion ?? "",
  )}`
}

/** Link "Cómo llegar": abre la navegación en la app de Maps del celular. */
export function mapsDirectionsUrl(input: {
  lat?: number | null
  lng?: number | null
  direccion?: string | null
  placeId?: string | null
}): string {
  const destino = tieneCoordenadas(input)
    ? `${input.lat},${input.lng}`
    : (input.direccion ?? "")
  const placeParam = input.placeId
    ? `&destination_place_id=${encodeURIComponent(input.placeId)}`
    : ""
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destino,
  )}${placeParam}&travelmode=driving`
}

/** URL del mapa embebido (iframe) para el panel admin. */
export function mapsEmbedUrl(input: {
  lat?: number | null
  lng?: number | null
  direccion?: string | null
  zoom?: number
}): string | null {
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
    | string
    | undefined
  if (!key) return null
  const zoom = input.zoom ?? 16
  if (tieneCoordenadas(input)) {
    return `https://www.google.com/maps/embed/v1/view?key=${key}&center=${input.lat},${input.lng}&zoom=${zoom}&maptype=roadmap`
  }
  if (input.direccion) {
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(
      input.direccion,
    )}&zoom=${zoom}`
  }
  return null
}

export const mapsDefaults = brand.maps
