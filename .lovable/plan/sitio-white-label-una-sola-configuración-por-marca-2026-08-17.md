# Sitio "white-label": una sola configuración por marca

Sí, es totalmente posible y no lleva mucho trabajo, porque la mitad ya está hecha.

## Cómo está hoy

- **Colores: ya son variables.** Todo el CSS usa tokens (`--primary`, `--background`, `--secondary`, etc.) en `src/styles.css` y los componentes usan clases semánticas (`bg-primary`, `text-muted-foreground`). Cambiar la paleta hoy = editar ~25 líneas en un solo archivo.
- **Lo que NO es variable todavía:** el nombre "Black Cats" (aparece en navbar, footer, sidebar, ~10 títulos SEO, mensaje de WhatsApp), las fuentes (Baloo 2 / Nunito cargadas a mano en `__root.tsx`), el teléfono del vendedor, el mail del calendario, la URL base, los textos del hero/footer, las claves de localStorage (`blackcats_cart`) y el logo.

## Qué se construye

### 1. `src/config/types.ts` — la interfaz de configuración

Contratos tipados (`BrandConfig`, `ContentConfig`, `ThemeConfig`, `SiteConfig`) que definen qué campos existen y cuáles son obligatorios. Los componentes consumen esta interfaz, no los objetos concretos: si mañana la config viene de una API o de una base de datos, los componentes no cambian.

### 2. `src/config/brand.ts` — identidad y contacto

- Nombre, slug, tagline, logo, favicon, mascota.
- Contacto: WhatsApp del vendedor, email, redes sociales, dirección física.
- SEO base: plantilla de títulos (`"%s | {marca}"`), autor, URL pública.
- Calendar ID del vendedor.
- Prefijo de almacenamiento local (`{slug}_cart`, `{slug}_user`).
- Feature flags: calendario, WhatsApp, notificaciones, registro público.

Solo datos públicos de marca. Ningún secreto.

### 3. `src/config/content.ts` — todos los textos

Separado de la marca, porque cambia por motivos distintos:

- Copys del hero, secciones de la home, footer.
- Títulos y descripciones SEO de cada ruta.
- Etiquetas de navegación (tienda y sidebar admin).
- Mensajes vacíos, de error y de éxito.
- Plantilla del mensaje de WhatsApp.

### 4. `src/config/theme.ts` — paleta, tipografías, radios

- Paleta como objeto (`primary`, `secondary`, `accent`, `success`, `destructive`, `background`, `foreground`, neutros) más `radius`, fuentes y sombras.
- El tema se inyecta en `<head>` como variables CSS, así `styles.css` solo consume `var(...)`.
- El `<link>` de Google Fonts se genera desde la config, no hardcodeado.
- 2-3 presets de ejemplo (`kawaii-coral` actual, uno oscuro, uno neutro) para cambiar la estética en una línea.

### 5. `src/config/index.ts` — punto de entrada único

Reexporta todo y expone un objeto `siteConfig: SiteConfig` que agrupa `brand`, `content` y `theme`. La app importa siempre `@/config`, nunca los archivos individuales.

### 6. Secretos y entorno: fuera de la config visual

- La URL de la API sigue en `VITE_API_URL` (variable de entorno), leída en `src/lib/api-client.ts`. No entra en `brand.ts`.
- `JWT_SECRET`, `DATABASE_URL` y `SEED_TOKEN` permanecen exclusivamente como variables de entorno del backend, nunca en `src/config`.
- Se agrega un comentario-guardia en `src/config/index.ts` que deja explícito que ese directorio es público y va al bundle del navegador.

### 7. Reemplazo de valores fijos

Sustituir todas las apariciones detectadas por lecturas de `@/config`: navbar, footer, sidebar admin, `head()` de cada ruta, `whatsapp.ts`, `calendar.server.ts`, `cart-context`, `auth-context`, hero de la home, credenciales demo del login.

### 8. Documento de traspaso: `BRANDING.md`

Checklist para vender el molde: editar `brand.ts`, ajustar textos en `content.ts`, elegir paleta en `theme.ts`, reemplazar imágenes en `public/`, setear `VITE_API_URL` y los secretos del backend.

## Detalles técnicos

- Los cuatro archivos de config son módulos TS puros (sin dependencias), importables desde cliente y server.
- Las variables CSS se emiten desde `__root.tsx` con un `<style>` generado a partir de `theme.ts`, sobreescribiendo `:root`; `styles.css` conserva los defaults para que nada quede sin estilo durante SSR.
- Colores en `oklch` (como hoy) con helper para aceptar hex y convertirlo.
- Nada de lógica de negocio cambia: es refactor de presentación y configuración.

## Alcance

No incluye: multi-tenant en runtime (varias marcas en la misma instancia), panel visual de theming, ni cambio de idioma. Si más adelante querés vender SaaS en vez de instancias separadas, la config se mueve a base de datos respetando la misma interfaz `SiteConfig`.

