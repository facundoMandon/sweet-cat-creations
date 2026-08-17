# Sitio "white-label": una sola configuración por marca

Sí, es totalmente posible y no lleva mucho trabajo, porque la mitad ya está hecha.

## Cómo está hoy

- **Colores: ya son variables.** Todo el CSS usa tokens (`--primary`, `--background`, `--secondary`, etc.) en `src/styles.css` y los componentes usan clases semánticas (`bg-primary`, `text-muted-foreground`). Cambiar la paleta hoy = editar ~25 líneas en un solo archivo.
- **Lo que NO es variable todavía:** el nombre "Black Cats" (aparece en navbar, footer, sidebar, ~10 títulos SEO, mensaje de WhatsApp), las fuentes (Baloo 2 / Nunito cargadas a mano en `__root.tsx`), el teléfono del vendedor, el mail del calendario, la URL base, los textos del hero/footer, las claves de localStorage (`blackcats_cart`) y el logo.

## Qué se construye

### 1. Un único archivo de marca: `src/config/brand.ts`

Todo lo que cambia entre clientes vive ahí:

- Identidad: nombre, tagline, descripción, logo, favicon.
- Contacto: WhatsApp del vendedor, email, redes, dirección.
- SEO: plantilla de títulos (`"%s | {marca}"`), descripciones por página, URL base.
- Integraciones: calendar ID del vendedor, URL de la API backend.
- Textos de la home (hero, secciones) y del footer.
- Prefijo de almacenamiento local (`{slug}_cart`, `{slug}_user`).
- Feature flags: mostrar/ocultar calendario, WhatsApp, notificaciones.

### 2. Un archivo de tema: `src/config/theme.ts` + tokens en CSS

- Paleta expresada como un objeto de marca (`primary`, `secondary`, `accent`, `success`, `destructive`, `background`, `foreground`, neutros) más `radius`, `fonts` y sombras.
- El tema se inyecta en `<head>` como variables CSS, así `styles.css` deja de tener valores fijos y solo consume `var(...)`.
- Fuentes: el `<link>` de Google Fonts se genera desde la config, no hardcodeado.
- Se incluyen 2-3 presets de ejemplo (`kawaii-coral` actual, uno oscuro, uno neutro) para mostrar el cambio de estética en un cambio de línea.

### 3. Reemplazo de valores fijos

Sustituir todas las apariciones detectadas por lecturas de la config: navbar, footer, sidebar admin, `head()` de cada ruta, `whatsapp.ts`, `calendar.server.ts`, `cart-context`, `auth-context`, hero de la home, credenciales demo del login.

### 4. Documento de traspaso: `BRANDING.md`

Checklist de 10 pasos para vender el molde: cambiar `brand.ts`, elegir/definir paleta en `theme.ts`, reemplazar logo/imágenes en `src/assets`, apuntar la API, listo.

## Detalles técnicos

- `brand.ts` y `theme.ts` son módulos TS puros (sin dependencias) importables desde cliente y server.
- Las variables CSS se emiten desde `__root.tsx` con un `<style>` generado a partir de `theme.ts`, sobreescribiendo `:root`; `styles.css` conserva los defaults para que nada quede sin estilo durante SSR.
- Los colores se definen en formato `oklch` (igual que hoy) con helper para aceptar hex y convertirlo, así vos podés pegar una paleta en hex.
- Nada de lógica de negocio cambia: es refactor de presentación y configuración.

## Alcance

No incluye: multi-tenant en runtime (varias marcas en la misma instancia), panel visual de theming, ni cambio de idioma. Si más adelante querés vender SaaS en vez de instancias separadas, la config se mueve a base de datos sobre esta misma estructura.
