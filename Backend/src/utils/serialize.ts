/**
 * pg devuelve los DECIMAL como string. Estas utilidades normalizan los campos
 * numéricos antes de enviarlos al frontend.
 */

const DECIMAL_FIELDS = new Set([
  "ProdPrecio",
  "ProdPrecioUnitario",
  "PedidoMontoTotal",
  "Subtotal",
]);

export function normalize<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => normalize(v)) as unknown as T;
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (DECIMAL_FIELDS.has(k) && v !== null && v !== undefined) {
        out[k] = Number(v);
      } else {
        out[k] = normalize(v);
      }
    }
    return out as unknown as T;
  }
  return value;
}

/** Convierte instancias de Sequelize (o arrays) a JSON normalizado. */
export function toJSON<T = unknown>(data: unknown): T {
  const plain =
    data && typeof (data as { toJSON?: () => unknown }).toJSON === "function"
      ? (data as { toJSON: () => unknown }).toJSON()
      : Array.isArray(data)
        ? data.map((d) =>
            d && typeof (d as { toJSON?: () => unknown }).toJSON === "function"
              ? (d as { toJSON: () => unknown }).toJSON()
              : d
          )
        : data;
  return normalize(plain) as T;
}
