import { badRequest } from "./AppError.js";

/** Validaciones de entrada reutilizables (sin dependencias externas). */

export function requiredString(
  value: unknown,
  field: string,
  max = 255
): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest(`El campo "${field}" es obligatorio`);
  }
  const v = value.trim();
  if (v.length > max) {
    throw badRequest(`El campo "${field}" supera los ${max} caracteres`);
  }
  return v;
}

export function optionalString(
  value: unknown,
  field: string,
  max = 255
): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw badRequest(`El campo "${field}" debe ser texto`);
  }
  const v = value.trim();
  if (v.length > max) {
    throw badRequest(`El campo "${field}" supera los ${max} caracteres`);
  }
  return v === "" ? null : v;
}

export function requiredId(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest(`El campo "${field}" debe ser un ID válido`);
  }
  return n;
}

export function optionalId(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return requiredId(value, field);
}

export function requiredPositiveNumber(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw badRequest(`El campo "${field}" debe ser un número mayor a 0`);
  }
  return n;
}

export function requiredQuantity(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest(`El campo "${field}" debe ser una cantidad mayor a 0`);
  }
  if (n > 1000) throw badRequest(`El campo "${field}" es demasiado grande`);
  return n;
}

export function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw badRequest(`El campo "${field}" debe ser booleano`);
}

export function optionalBoolean(
  value: unknown,
  field: string
): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return requiredBoolean(value, field);
}

export function requiredEmail(value: unknown, field = "email"): string {
  const v = requiredString(value, field, 150).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    throw badRequest(`El campo "${field}" no tiene un formato de email válido`);
  }
  return v;
}

/** Devuelve la fecha en formato YYYY-MM-DD validando que sea real. */
export function requiredDate(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest(`El campo "${field}" es obligatorio`);
  }
  const raw = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw badRequest(`El campo "${field}" debe tener formato YYYY-MM-DD`);
  }
  const d = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== raw) {
    throw badRequest(`El campo "${field}" no es una fecha válida`);
  }
  return raw;
}

export function requiredIdArray(value: unknown, field: string): number[] {
  if (!Array.isArray(value)) {
    throw badRequest(`El campo "${field}" debe ser una lista`);
  }
  return value.map((v) => requiredId(v, field));
}
