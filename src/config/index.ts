/**
 * Punto de entrada único de la configuración del sitio.
 *
 * El resto de la aplicación importa SIEMPRE desde `@/config`:
 *
 *   import { brand, content, siteConfig } from "@/config";
 *
 * ⚠️ TODO lo que vive en `src/config` es público: se compila dentro del
 * bundle del navegador. Nunca poner secretos acá (JWT_SECRET, DATABASE_URL,
 * SEED_TOKEN, claves de API). Los secretos son variables de entorno del
 * backend; la URL de la API es `VITE_API_URL`.
 */

import { brand } from "./brand";
import { content } from "./content";
import { theme } from "./theme";
import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = { brand, content, theme };

export { brand, content, theme };
export { buildThemeCss, hexToOklch, palettes, toCssColor } from "./theme";
export type * from "./types";

/* ------------------------------------------------------------------ */
/* Helpers derivados                                                   */
/* ------------------------------------------------------------------ */

/** Aplica la plantilla de título de la marca (`"%s | Marca"`). */
export function pageTitle(title: string): string {
  return brand.seo.titleTemplate.replace("%s", title);
}

/** Clave de localStorage prefijada con el slug de la marca. */
export function storageKey(key: string): string {
  return `${brand.storagePrefix}_${key}`;
}

/** Metadatos `head()` listos para una ruta, a partir de `content.seo`. */
export function seoMeta(page: keyof typeof content.seo, absolute = false) {
  const { title, description } = content.seo[page];
  const fullTitle = absolute ? title : pageTitle(title);
  return [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
  ];
}
