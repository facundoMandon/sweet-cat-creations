import { ProdEstado, PedidoEstado } from "../models/index.js";

/** Estados válidos de producto (únicos permitidos por las reglas de negocio). */
export const PRODUCTO_ESTADOS = ["Activo", "Inactivo", "Sin Stock"] as const;
export type ProductoEstadoNombre = (typeof PRODUCTO_ESTADOS)[number];

/** Estados válidos de pedido. */
export const PEDIDO_ESTADOS = ["Pendiente", "Entregado", "Cancelado"] as const;
export type PedidoEstadoNombre = (typeof PEDIDO_ESTADOS)[number];

/** Transiciones permitidas entre estados de pedido. */
export const TRANSICIONES: Record<PedidoEstadoNombre, PedidoEstadoNombre[]> = {
  Pendiente: ["Entregado", "Cancelado"],
  Entregado: [],
  Cancelado: [],
};

const prodCache = new Map<string, number>();
const pedidoCache = new Map<string, number>();

/**
 * Garantiza que existan las filas de estados de referencia y cachea sus IDs.
 * Se ejecuta al arrancar el servidor.
 */
export async function ensureEstados(): Promise<void> {
  prodCache.clear();
  pedidoCache.clear();

  for (const descripcion of PRODUCTO_ESTADOS) {
    const [row] = await ProdEstado.findOrCreate({
      where: { ProdEstadoDescripcion: descripcion },
      defaults: { ProdEstadoDescripcion: descripcion } as never,
    });
    prodCache.set(descripcion, row.ProdEstadoID);
  }

  for (const descripcion of PEDIDO_ESTADOS) {
    const [row] = await PedidoEstado.findOrCreate({
      where: { PedidoEstadoDescripcion: descripcion },
      defaults: { PedidoEstadoDescripcion: descripcion } as never,
    });
    pedidoCache.set(descripcion, row.PedidoEstadoID);
  }
}

export async function prodEstadoId(nombre: ProductoEstadoNombre): Promise<number> {
  if (!prodCache.has(nombre)) await ensureEstados();
  return prodCache.get(nombre)!;
}

export async function pedidoEstadoId(nombre: PedidoEstadoNombre): Promise<number> {
  if (!pedidoCache.has(nombre)) await ensureEstados();
  return pedidoCache.get(nombre)!;
}

export async function prodEstadoNombre(id: number): Promise<string | undefined> {
  if (prodCache.size === 0) await ensureEstados();
  return [...prodCache.entries()].find(([, v]) => v === id)?.[0];
}

export async function pedidoEstadoNombre(
  id: number
): Promise<PedidoEstadoNombre | undefined> {
  if (pedidoCache.size === 0) await ensureEstados();
  return [...pedidoCache.entries()].find(([, v]) => v === id)?.[0] as
    | PedidoEstadoNombre
    | undefined;
}

/** IDs de los estados de producto que se muestran en el catálogo público. */
export async function estadosVisiblesCatalogo(): Promise<number[]> {
  return [await prodEstadoId("Activo"), await prodEstadoId("Sin Stock")];
}
