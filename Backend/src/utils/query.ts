import { badRequest } from "./AppError.js";

export interface PageParams {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/** Lee page/pageSize de la query string y los convierte en limit/offset. */
export function parsePagination(query: Record<string, unknown>): PageParams {
  const page = Math.max(1, Number(query["page"] ?? 1) || 1);
  const raw = Number(query["pageSize"] ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, raw));
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}

/** Valida el campo de ordenamiento contra una whitelist. */
export function parseSort(
  query: Record<string, unknown>,
  allowed: Record<string, string | string[]>,
  fallback: string
): [string | string[], "ASC" | "DESC"] {
  const requested = String(query["sort"] ?? fallback);
  const column = allowed[requested] ?? allowed[fallback];
  if (!column) throw badRequest(`Orden inválido: ${requested}`);
  const dir = String(query["order"] ?? "asc").toUpperCase();
  if (dir !== "ASC" && dir !== "DESC") {
    throw badRequest('El parámetro "order" debe ser asc o desc');
  }
  return [column, dir];
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export function paginated<T>(
  rows: T[],
  count: number,
  p: PageParams
): Paginated<T> {
  return {
    data: rows,
    meta: {
      page: p.page,
      pageSize: p.pageSize,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / p.pageSize)),
    },
  };
}
