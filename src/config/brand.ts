import type { BrandConfig } from "./types";

/**
 * Identidad de la marca. ÚNICO archivo a tocar para renombrar el sitio.
 *
 * IMPORTANTE: todo lo que está acá viaja al navegador. Nunca poner secretos
 * (JWT_SECRET, DATABASE_URL, SEED_TOKEN, API keys). La URL de la API vive en
 * la variable de entorno `VITE_API_URL`.
 */
export const brand: BrandConfig = {
  name: "Black Cats",
  slug: "blackcats",
  tagline: "Repostería y chocolates hechos con amor.",
  description:
    "Tienda online de repostería y chocolatería personalizada: combos, dedicatorias y dulces artesanales.",

  assets: {
    logo: "/mascot-cat.png",
    hero: "/hero-treats.png",
    favicon: "/favicon.ico",
  },

  contact: {
    // Formato internacional, sólo dígitos (país + área + número).
    whatsapp: "5493412288582",
    email: "hola@blackcats.com",
    address: "Rosario, Santa Fe",
    calendarId: "facundo-mandon@hotmail.com",
  },

  social: [
    { id: "instagram", label: "Instagram", href: "#" },
    { id: "facebook", label: "Facebook", href: "#" },
    { id: "tiktok", label: "TikTok", href: "#" },
  ],

  seo: {
    titleTemplate: "%s | Black Cats",
    author: "Black Cats",
    baseUrl: "https://blackcats.lovable.app",
  },

  storagePrefix: "blackcats",

  maps: {
    // Rosario, Santa Fe.
    defaultCenter: { lat: -32.9442426, lng: -60.6505388 },
    defaultZoom: 13,
    region: "ar",
  },

  features: {
    calendar: true,
    whatsappCheckout: true,
    notifications: true,
    publicRegister: true,
    demoCredentials: true,
    maps: true,
  },
};
