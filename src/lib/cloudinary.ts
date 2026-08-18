import { brand } from "@/config/brand";

const CLOUD_NAME = brand.media.cloudinaryCloudName;

/**
 * Resuelve la URL pública de una imagen de producto.
 *
 * - Si existe `publicId` (Cloudinary) → se sirve con transformación on-the-fly.
 * - Si es una URL externa (http...) → se devuelve tal cual.
 * - Si es una ruta local relativa ("/cat.png") → se devuelve tal cual.
 * - Fallback → una imagen por defecto.
 *
 * `variant` determina el tamaño: "thumb", "card" o "detail".
 */
export function cloudinaryUrl(
  publicId: string | null | undefined,
  originalUrl: string | null | undefined,
  variant: "thumb" | "card" | "detail" = "card",
  fallback = brand.assets.logo
): string {
  if (publicId && CLOUD_NAME) {
    const transformation = {
      thumb: brand.media.thumbTransformation,
      card: brand.media.cardTransformation,
      detail: brand.media.detailTransformation,
    }[variant];
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
  }

  if (originalUrl?.startsWith("http") || originalUrl?.startsWith("/")) {
    return originalUrl;
  }

  return fallback;
}

/**
 * Firma subidas directas a Cloudinary desde el backend.
 */
export async function firmarUploadCloudinary(): Promise<{
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/firma`, {
    method: "POST",
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "No se pudo firmar la subida");
  }
  return json.data;
}

/**
 * Sube una imagen a Cloudinary usando una firma reciente.
 */
export async function subirImagenCloudinary(
  file: File,
  firma: Awaited<ReturnType<typeof firmarUploadCloudinary>>
): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", firma.apiKey);
  form.append("timestamp", String(firma.timestamp));
  form.append("folder", firma.folder);
  form.append("signature", firma.signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Error al subir imagen");
  }

  return {
    url: json.secure_url,
    publicId: json.public_id,
  };
}
