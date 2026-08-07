// Base de datos en memoria para el preview (sin backend).
// Clona los datos semilla y permite CRUD; los datos persisten durante la sesión.
import * as seed from './mock-data'
import type {
  Categoria,
  SubCategoria,
  ProdEstado,
  Evento,
  Producto,
  ProductoCombo,
  ProdEvento,
  Cliente,
  PedidoEstado,
  Pedido,
  ProductoPedido,
  Notificacion,
} from './types'

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

export const db = {
  categorias: clone(seed.categorias) as Categoria[],
  subcategorias: clone(seed.subcategorias) as SubCategoria[],
  prodEstados: clone(seed.prodEstados) as ProdEstado[],
  eventos: clone(seed.eventos) as Evento[],
  productos: clone(seed.productos) as Producto[],
  productoCombos: clone(seed.productoCombos) as ProductoCombo[],
  prodEventos: clone(seed.prodEventos) as ProdEvento[],
  clientes: clone(seed.clientes) as Cliente[],
  pedidoEstados: clone(seed.pedidoEstados) as PedidoEstado[],
  pedidos: clone(seed.pedidos) as Pedido[],
  productoPedidos: clone(seed.productoPedidos) as ProductoPedido[],
  notificaciones: clone(seed.notificaciones) as Notificacion[],
}

export function nextId<T>(rows: T[], pk: keyof T): number {
  return rows.reduce((max, r) => Math.max(max, Number(r[pk]) || 0), 0) + 1
}

// Simula latencia de red
export function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(clone(value)), ms))
}

// --- Helpers de relaciones para enriquecer productos y pedidos ---

export function enrichProducto(p: Producto): Producto {
  const subcategoria = db.subcategorias.find((s) => s.SubCatID === p.SubCatID)
  const categoria = subcategoria
    ? db.categorias.find((c) => c.CatID === subcategoria.CatID)
    : undefined
  const estado = db.prodEstados.find((e) => e.ProdEstadoID === p.ProdEstadoID)
  const eventoIds = db.prodEventos
    .filter((pe) => pe.ProdID === p.ProdID)
    .map((pe) => pe.EventoID)
  const eventos = db.eventos.filter((e) => eventoIds.includes(e.EventoID))
  const itemIds = db.productoCombos
    .filter((pc) => pc.ComboProdID === p.ProdID)
    .map((pc) => pc.ItemProdID)
  const itemsCombo = db.productos.filter((prod) => itemIds.includes(prod.ProdID))
  return {
    ...clone(p),
    subcategoria: subcategoria ? { ...subcategoria, categoria } : undefined,
    estado,
    eventos,
    itemsCombo: p.EsCombo ? itemsCombo.map((i) => clone(i)) : undefined,
  }
}

export function enrichPedido(pedido: Pedido): Pedido {
  const cliente = db.clientes.find((c) => c.ClienteID === pedido.ClienteID)
  const estado = db.pedidoEstados.find(
    (e) => e.PedidoEstadoID === pedido.PedidoEstadoID,
  )
  const renglones = db.productoPedidos
    .filter((r) => r.PedidoID === pedido.PedidoID)
    .map((r) => ({
      ...clone(r),
      producto: db.productos.find((p) => p.ProdID === r.ProdID),
    }))
  return { ...clone(pedido), cliente, estado, renglones }
}
