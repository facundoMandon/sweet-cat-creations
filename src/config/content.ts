import type { ContentConfig } from "./types";

/**
 * Todos los textos visibles del sitio. Separado de `brand.ts` porque cambia
 * por motivos distintos (copy / marketing vs. identidad y contacto).
 */
export const content: ContentConfig = {
  home: {
    badge: "Productos artesanales",
    headline: "Dulces que te hacen",
    headlineAccent: "ronronear",
    subheadline:
      "Chocolates, postres y combos personalizados hechos con mucho amor. Endulzá cada momento especial.",
    ctaPrimary: "Ver catálogo",
    ctaSecondary: "Combos especiales",
    heroAlt: "Selección de dulces artesanales",
    categoriesTitle: "¿Qué preferís hoy?",
  },

  footer: {
    tagline: "Repostería y chocolates hechos con amor.",
    copyright: "© %s · Hecho con cacao y mucho amor.",
    nav: [
      { to: "/catalogo", label: "Catálogo" },
      { to: "/carrito", label: "Carrito" },
      { to: "/pedidos", label: "Mis pedidos" },
      { to: "/login", label: "Ingresar" },
    ],
  },

  nav: {
    store: [
      { to: "/", label: "Inicio" },
      { to: "/catalogo", label: "Catálogo" },
      { to: "/pedidos", label: "Mis pedidos" },
    ],
    adminSubtitle: "Panel admin",
  },

  search: {
    placeholder: "Buscar dulces...",
  },

  seo: {
    home: {
      title: "Black Cats — Dulces y chocolates personalizados",
      description:
        "Repostería y chocolatería artesanal personalizada. Combos, dedicatorias y dulces para cada evento especial.",
    },
    catalogo: {
      title: "Catálogo de dulces",
      description:
        "Explorá chocolates, postres, combos y opciones saladas de nuestro catálogo.",
    },
    producto: {
      title: "Detalle del producto",
      description: "Personalizá tu pedido con una dedicatoria especial.",
    },
    carrito: {
      title: "Tu carrito",
      description: "Revisá tus productos antes de finalizar la compra.",
    },
    checkout: {
      title: "Checkout",
      description: "Confirmá tus datos y finalizá tu pedido.",
    },
    pedidos: {
      title: "Mis pedidos",
      description: "Seguí el estado de tus pedidos personalizados.",
    },
    login: {
      title: "Iniciar sesión",
      description:
        "Ingresá a tu cuenta para ver tus pedidos y comprar más rápido.",
    },
    admin: {
      title: "Panel de administración",
      description:
        "Gestión de productos, pedidos, clientes y notificaciones.",
    },
  },

  whatsapp: {
    closing:
      "¡Muchas gracias por su atención! Quedo a la espera de la confirmación del pedido.",
    signature: "Saludos cordiales",
  },

  demo: {
    admin: "admin@blackcats.com / admin123",
    cliente: "cliente@blackcats.com / cliente123",
  },
};
