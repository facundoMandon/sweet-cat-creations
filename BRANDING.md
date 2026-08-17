# Guía de personalización (white-label)

Todo lo que distingue a una marca de otra vive en `src/config/`. Para adaptar el
sitio a otro emprendimiento no hace falta tocar componentes ni CSS.

```
src/config/
├── types.ts     Interfaz de configuración (contratos tipados). No se toca por cliente.
├── brand.ts     Identidad: nombre, logo, contacto, SEO base, feature flags.
├── content.ts   Todos los textos: hero, footer, navegación, SEO por página.
├── theme.ts     Paleta, tipografías, radios y sombras.
└── index.ts     Punto de entrada único: la app importa siempre `@/config`.
```

## Checklist para una marca nueva

1. **`src/config/brand.ts`** — nombre, `slug`, tagline, descripción.
2. **Contacto** — WhatsApp del vendedor (formato internacional, sólo dígitos),
   email, dirección y `calendarId` del vendedor.
3. **Redes** — editar el array `social` (`instagram`, `facebook`, `tiktok`,
   `whatsapp`, `x`).
4. **SEO** — `titleTemplate`, `author` y `baseUrl` (dominio público).
5. **Feature flags** — activar/desactivar calendario, checkout por WhatsApp,
   notificaciones, registro público y credenciales demo.
6. **`src/config/content.ts`** — reescribir copys del hero, footer y los
   títulos/descripciones SEO de cada página.
7. **`src/config/theme.ts`** — elegir un preset (`palettes["paper-ink"]`) o
   pegar una paleta propia. Los colores aceptan **hex** (`#FF664B`) u `oklch()`;
   el hex se convierte automáticamente.
8. **Tipografías** — cambiar `fonts.sans`, `fonts.display` y la URL de
   `fonts.stylesheet` (Google Fonts). `stylesheet: null` si se usan fuentes del
   sistema.
9. **Imágenes** — reemplazar en `public/`: `mascot-cat.png` (logo),
   `hero-treats.png` (hero) y `favicon.ico`, o apuntar `brand.assets` a otros
   archivos.
10. **Entorno** — setear `VITE_API_URL` (frontend) y, en el backend,
    `DATABASE_URL`, `JWT_SECRET` y `SEED_TOKEN`.

## Cambiar sólo la paleta

```ts
// src/config/theme.ts
export const theme: ThemeConfig = {
  preset: "paper-ink",
  colors: palettes["paper-ink"], // o un objeto propio en hex
  ...
};
```

Las variables CSS se generan con `buildThemeCss()` y se inyectan en el `<head>`
desde `src/routes/__root.tsx`, sobreescribiendo los defaults de `src/styles.css`.

## Reglas

- **Nunca** hardcodear colores en los componentes (`bg-[#ff0000]`, `text-white`):
  usar siempre las clases semánticas (`bg-primary`, `text-muted-foreground`).
- **Nunca** poner secretos en `src/config/`: ese código viaja al navegador.
  `JWT_SECRET`, `DATABASE_URL` y `SEED_TOKEN` son variables de entorno del
  backend; la URL de la API es `VITE_API_URL`.
- Los componentes consumen la interfaz de `types.ts`, no valores literales: si
  más adelante la configuración se guarda en base de datos (modo SaaS
  multi-marca), alcanza con construir un `SiteConfig` distinto.
