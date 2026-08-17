import type { ColorValue, ThemeConfig, ThemePalette } from "./types";

/* ------------------------------------------------------------------ */
/* Helpers de color: aceptan hex (#FF664B) u oklch(...) ya escrito     */
/* ------------------------------------------------------------------ */

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Convierte `#RRGGBB` a la notación `oklch(l c h)`. */
export function hexToOklch(hex: string): string {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = srgbToLinear(parseInt(full.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(full.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(full.slice(4, 6), 16) / 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;

  const round = (n: number, d: number) => Number(n.toFixed(d));
  return `oklch(${round(L, 3)} ${round(C, 3)} ${round(H, 1)})`;
}

/** Normaliza cualquier `ColorValue` a una cadena CSS válida. */
export function toCssColor(value: ColorValue): string {
  return value.trim().startsWith("#") ? hexToOklch(value) : value;
}

/* ------------------------------------------------------------------ */
/* Presets                                                             */
/* ------------------------------------------------------------------ */

/** Paleta actual: coral #FF664B / rosa #FFC3C3 / menta #64C0A6 / tinta #08090A. */
const kawaiiCoral: ThemePalette = {
  background: "oklch(0.969 0.004 56.4)",
  foreground: "oklch(0.139 0.003 246.3)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.139 0.003 246.3)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.139 0.003 246.3)",
  primary: "oklch(0.7 0.192 32.1)",
  primaryForeground: "oklch(1 0 0)",
  secondary: "oklch(0.871 0.069 18.6)",
  secondaryForeground: "oklch(0.36 0.109 28.9)",
  muted: "oklch(0.967 0 89.9)",
  mutedForeground: "oklch(0.564 0.008 39.4)",
  accent: "oklch(0.937 0.032 32.1)",
  accentForeground: "oklch(0.36 0.109 28.9)",
  success: "oklch(0.744 0.097 173)",
  successForeground: "oklch(0.305 0.055 172.1)",
  destructive: "oklch(0.626 0.193 23)",
  destructiveForeground: "oklch(1 0 0)",
  border: "oklch(0.923 0.016 36.5)",
  input: "oklch(0.907 0.015 33.1)",
  ring: "oklch(0.7 0.192 32.1)",
  chart1: "oklch(0.7 0.192 32.1)",
  chart2: "oklch(0.744 0.097 173)",
  chart3: "oklch(0.871 0.069 18.6)",
  chart4: "oklch(0.784 0.159 73)",
  chart5: "oklch(0.653 0.168 286.7)",
  sidebar: "oklch(1 0 0)",
  sidebarForeground: "oklch(0.139 0.003 246.3)",
  sidebarPrimary: "oklch(0.7 0.192 32.1)",
  sidebarPrimaryForeground: "oklch(1 0 0)",
  sidebarAccent: "oklch(0.968 0.016 32)",
  sidebarAccentForeground: "oklch(0.7 0.192 32.1)",
  sidebarBorder: "oklch(0.923 0.016 36.5)",
  sidebarRing: "oklch(0.7 0.192 32.1)",
};

/** Preset oscuro con acento esmeralda. */
const midnightEmerald: ThemePalette = {
  background: "#0d1117",
  foreground: "#e8edf3",
  card: "#151b24",
  cardForeground: "#e8edf3",
  popover: "#151b24",
  popoverForeground: "#e8edf3",
  primary: "#2dd4a8",
  primaryForeground: "#04231b",
  secondary: "#1e2733",
  secondaryForeground: "#cfe0ea",
  muted: "#1a212b",
  mutedForeground: "#93a1b1",
  accent: "#1e3a34",
  accentForeground: "#73ffb8",
  success: "#4ade80",
  successForeground: "#052e16",
  destructive: "#f2555a",
  destructiveForeground: "#ffffff",
  border: "#232c38",
  input: "#2a3441",
  ring: "#2dd4a8",
  chart1: "#2dd4a8",
  chart2: "#4ade80",
  chart3: "#67e8f9",
  chart4: "#f7931e",
  chart5: "#a78bfa",
  sidebar: "#111820",
  sidebarForeground: "#e8edf3",
  sidebarPrimary: "#2dd4a8",
  sidebarPrimaryForeground: "#04231b",
  sidebarAccent: "#1e3a34",
  sidebarAccentForeground: "#73ffb8",
  sidebarBorder: "#232c38",
  sidebarRing: "#2dd4a8",
};

/** Preset neutro y editorial (papel & tinta). */
const paperInk: ThemePalette = {
  background: "#f5f3ee",
  foreground: "#0d0d0d",
  card: "#ffffff",
  cardForeground: "#0d0d0d",
  popover: "#ffffff",
  popoverForeground: "#0d0d0d",
  primary: "#2d2d2d",
  primaryForeground: "#ffffff",
  secondary: "#e8e4dd",
  secondaryForeground: "#2d2d2d",
  muted: "#eeece7",
  mutedForeground: "#6b6b6b",
  accent: "#e0dcd3",
  accentForeground: "#2d2d2d",
  success: "#3f7d5b",
  successForeground: "#ffffff",
  destructive: "#a8332c",
  destructiveForeground: "#ffffff",
  border: "#ddd8cf",
  input: "#d3cec4",
  ring: "#2d2d2d",
  chart1: "#2d2d2d",
  chart2: "#6b6b6b",
  chart3: "#a8a29a",
  chart4: "#c9a84c",
  chart5: "#3f7d5b",
  sidebar: "#ffffff",
  sidebarForeground: "#0d0d0d",
  sidebarPrimary: "#2d2d2d",
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: "#e8e4dd",
  sidebarAccentForeground: "#2d2d2d",
  sidebarBorder: "#ddd8cf",
  sidebarRing: "#2d2d2d",
};

export const palettes = {
  "kawaii-coral": kawaiiCoral,
  "midnight-emerald": midnightEmerald,
  "paper-ink": paperInk,
} as const;

/* ------------------------------------------------------------------ */
/* Tema activo                                                         */
/* ------------------------------------------------------------------ */

export const theme: ThemeConfig = {
  preset: "kawaii-coral",
  colors: palettes["kawaii-coral"],
  fonts: {
    sans: '"Nunito", ui-sans-serif, system-ui, sans-serif',
    display: '"Baloo 2", "Quicksand", ui-rounded, sans-serif',
    stylesheet:
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
  },
  radius: "1rem",
  shadows: {
    kawaii: "0 8px 24px -14px oklch(0.139 0.003 246.3 / 0.35)",
    kawaiiLg: "0 18px 40px -20px oklch(0.139 0.003 246.3 / 0.35)",
  },
};

/* ------------------------------------------------------------------ */
/* Emisión de variables CSS                                            */
/* ------------------------------------------------------------------ */

const CSS_VAR_BY_TOKEN: Record<keyof ThemePalette, string> = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  success: "--success",
  successForeground: "--success-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
  sidebar: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarAccentForeground: "--sidebar-accent-foreground",
  sidebarBorder: "--sidebar-border",
  sidebarRing: "--sidebar-ring",
};

/**
 * Genera el bloque `:root { ... }` con las variables del tema activo.
 * Se inyecta en el `<head>` y sobreescribe los defaults de `styles.css`.
 */
export function buildThemeCss(config: ThemeConfig = theme): string {
  const lines: string[] = [`--radius: ${config.radius};`];

  (Object.keys(CSS_VAR_BY_TOKEN) as Array<keyof ThemePalette>).forEach(
    (token) => {
      lines.push(`${CSS_VAR_BY_TOKEN[token]}: ${toCssColor(config.colors[token])};`);
    },
  );

  return [
    ":root{",
    ...lines,
    `--brand-font-sans: ${config.fonts.sans};`,
    `--brand-font-display: ${config.fonts.display};`,
    `--brand-shadow-kawaii: ${config.shadows.kawaii};`,
    `--brand-shadow-kawaii-lg: ${config.shadows.kawaiiLg};`,
    "}",
  ].join("");
}
