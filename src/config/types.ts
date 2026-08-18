/**
 * Interfaz de configuración del sitio (white-label).
 *
 * Los componentes consumen SIEMPRE estos contratos, nunca los objetos
 * concretos de `brand.ts` / `content.ts` / `theme.ts`. Si mañana la
 * configuración viene de una API o de una base de datos, los componentes
 * no cambian: sólo cambia quién construye el `SiteConfig`.
 */

/* ------------------------------------------------------------------ */
/* Marca                                                               */
/* ------------------------------------------------------------------ */

export interface SocialLink {
  /** Identificador del ícono: instagram | facebook | tiktok | whatsapp | x */
  id: "instagram" | "facebook" | "tiktok" | "whatsapp" | "x";
  label: string;
  href: string;
}

export interface BrandConfig {
  /** Nombre comercial visible en toda la interfaz. */
  name: string;
  /** Slug en minúsculas, sin espacios. Usado como prefijo de storage. */
  slug: string;
  /** Frase corta bajo el logo. */
  tagline: string;
  /** Descripción por defecto para SEO. */
  description: string;

  assets: {
    /** Logo / mascota del header, footer y sidebar admin. */
    logo: string;
    /** Imagen principal del hero. */
    hero: string;
    favicon: string;
  };

  contact: {
    /** Teléfono del vendedor en formato internacional, sólo dígitos. */
    whatsapp: string;
    email: string;
    /** Dirección física o zona de cobertura (opcional). */
    address?: string;
    /** Calendario donde se crean los recordatorios de envío. */
    calendarId: string;
  };

  social: SocialLink[];

  seo: {
    /** Plantilla de título; `%s` se reemplaza por el título de la página. */
    titleTemplate: string;
    author: string;
    /** URL pública del sitio (fallback para links absolutos). */
    baseUrl: string;
  };

  /** Prefijo de las claves de localStorage: `${storagePrefix}_cart`, etc. */
  storagePrefix: string;

  /** Configuración de medios (Cloudinary). */
  media: {
    /** Cloud name público de Cloudinary. */
    cloudinaryCloudName: string;
    /** API key pública para subida directa. */
    cloudinaryApiKey: string;
    /** Carpeta de destino por defecto en Cloudinary. */
    cloudinaryFolder: string;
    /** Transformación usada para tarjetas de catálogo. */
    cardTransformation: string;
    /** Transformación usada para el detalle del producto. */
    detailTransformation: string;
    /** Transformación usada para miniaturas (carrito, admin). */
    thumbTransformation: string;
  };

  /** Configuración del selector de ubicación (Google Maps). */
  maps: {
    /** Centro por defecto del mapa cuando el cliente todavía no eligió punto. */
    defaultCenter: { lat: number; lng: number };
    defaultZoom: number;
    /** Código de país ISO para sesgar el autocompletado (ej. "ar"). */
    region: string;
  };

  features: {
    calendar: boolean;
    whatsappCheckout: boolean;
    notifications: boolean;
    publicRegister: boolean;
    /** Muestra las credenciales demo en el login. */
    demoCredentials: boolean;
    /** Selector de ubicación en el checkout + mapa en el panel admin. */
    maps: boolean;
  };
}

/* ------------------------------------------------------------------ */
/* Contenido                                                           */
/* ------------------------------------------------------------------ */

export interface NavItem {
  to: string;
  label: string;
}

export interface PageSeo {
  title: string;
  description: string;
}

export interface ContentConfig {
  home: {
    badge: string;
    headline: string;
    /** Palabra destacada dentro del headline (se pinta con el color primario). */
    headlineAccent: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    heroAlt: string;
    categoriesTitle: string;
  };

  footer: {
    tagline: string;
    /** `%s` se reemplaza por el año actual. */
    copyright: string;
    nav: NavItem[];
  };

  nav: {
    store: NavItem[];
    /** Subtítulo del panel admin bajo el nombre de marca. */
    adminSubtitle: string;
  };

  search: {
    placeholder: string;
  };

  seo: Record<
    | "home"
    | "catalogo"
    | "producto"
    | "carrito"
    | "checkout"
    | "pedidos"
    | "login"
    | "admin",
    PageSeo
  >;

  whatsapp: {
    /** Línea de cierre antes de la firma. */
    closing: string;
    /** Firma final del mensaje. */
    signature: string;
  };

  demo?: {
    admin: string;
    cliente: string;
  };
}

/* ------------------------------------------------------------------ */
/* Tema                                                                */
/* ------------------------------------------------------------------ */

/** Color en hex (`#FF664B`) o en cualquier notación CSS (`oklch(...)`). */
export type ColorValue = string;

export interface ThemePalette {
  background: ColorValue;
  foreground: ColorValue;
  card: ColorValue;
  cardForeground: ColorValue;
  popover: ColorValue;
  popoverForeground: ColorValue;
  primary: ColorValue;
  primaryForeground: ColorValue;
  secondary: ColorValue;
  secondaryForeground: ColorValue;
  muted: ColorValue;
  mutedForeground: ColorValue;
  accent: ColorValue;
  accentForeground: ColorValue;
  success: ColorValue;
  successForeground: ColorValue;
  destructive: ColorValue;
  destructiveForeground: ColorValue;
  border: ColorValue;
  input: ColorValue;
  ring: ColorValue;
  chart1: ColorValue;
  chart2: ColorValue;
  chart3: ColorValue;
  chart4: ColorValue;
  chart5: ColorValue;
  sidebar: ColorValue;
  sidebarForeground: ColorValue;
  sidebarPrimary: ColorValue;
  sidebarPrimaryForeground: ColorValue;
  sidebarAccent: ColorValue;
  sidebarAccentForeground: ColorValue;
  sidebarBorder: ColorValue;
  sidebarRing: ColorValue;
}

export interface ThemeFonts {
  /** Familia para textos corrientes. */
  sans: string;
  /** Familia para títulos y elementos destacados. */
  display: string;
  /** URL de la hoja de estilos de fuentes (Google Fonts u otra). `null` = ninguna. */
  stylesheet: string | null;
}

export interface ThemeConfig {
  /** Nombre del preset activo (informativo). */
  preset: string;
  colors: ThemePalette;
  fonts: ThemeFonts;
  /** Radio base; el resto de los radios derivan de éste. */
  radius: string;
  shadows: {
    kawaii: string;
    kawaiiLg: string;
  };
}

/* ------------------------------------------------------------------ */
/* Configuración completa                                              */
/* ------------------------------------------------------------------ */

export interface SiteConfig {
  brand: BrandConfig;
  content: ContentConfig;
  theme: ThemeConfig;
}
