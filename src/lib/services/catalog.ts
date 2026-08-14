import { api, USE_MOCK, unwrap, unwrapList } from '../api-client'
import { db, delay, nextId } from '../mock-db'
import type { Categoria, SubCategoria, ProdEstado, Evento } from '../types'

// --- Categorías ---
export const categoryService = {
  async list(): Promise<Categoria[]> {
    if (USE_MOCK) return delay(db.categorias)
    const { data } = await api.get('/categorias')
    return unwrapList<Categoria>(data)
  },
  async create(input: { CatDescripcion: string }): Promise<Categoria> {
    if (USE_MOCK) {
      const nuevo = { CatID: nextId(db.categorias, 'CatID'), ...input }
      db.categorias.push(nuevo)
      return delay(nuevo)
    }
    const { data } = await api.post('/categorias', input)
    return unwrap<Categoria>(data)
  },
  async update(id: number, input: { CatDescripcion: string }): Promise<Categoria> {
    if (USE_MOCK) {
      const idx = db.categorias.findIndex((x) => x.CatID === id)
      db.categorias[idx] = { ...db.categorias[idx]!, ...input }
      return delay(db.categorias[idx]!)
    }
    const { data } = await api.patch(`/categorias/${id}`, input)
    return unwrap<Categoria>(data)
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.categorias = db.categorias.filter((x) => x.CatID !== id)
      return delay(undefined)
    }
    await api.delete(`/categorias/${id}`)
  },
}

// --- Subcategorías ---
export const subcategoryService = {
  async list(): Promise<SubCategoria[]> {
    if (USE_MOCK) {
      return delay(
        db.subcategorias.map((s) => ({
          ...s,
          categoria: db.categorias.find((c) => c.CatID === s.CatID),
        })),
      )
    }
    const { data } = await api.get('/subcategorias')
    return unwrapList<SubCategoria>(data)
  },
  async create(input: {
    SubCatDescripcion: string
    CatID: number
  }): Promise<SubCategoria> {
    if (USE_MOCK) {
      const nuevo = { SubCatID: nextId(db.subcategorias, 'SubCatID'), ...input }
      db.subcategorias.push(nuevo)
      return delay(nuevo)
    }
    const { data } = await api.post('/subcategorias', input)
    return unwrap<SubCategoria>(data)
  },
  async update(
    id: number,
    input: { SubCatDescripcion: string; CatID: number },
  ): Promise<SubCategoria> {
    if (USE_MOCK) {
      const idx = db.subcategorias.findIndex((x) => x.SubCatID === id)
      db.subcategorias[idx] = { ...db.subcategorias[idx]!, ...input }
      return delay(db.subcategorias[idx]!)
    }
    const { data } = await api.patch(`/subcategorias/${id}`, input)
    return unwrap<SubCategoria>(data)
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.subcategorias = db.subcategorias.filter((x) => x.SubCatID !== id)
      return delay(undefined)
    }
    await api.delete(`/subcategorias/${id}`)
  },
}

// --- Estados de producto ---
export const prodEstadoService = {
  async list(): Promise<ProdEstado[]> {
    if (USE_MOCK) return delay(db.prodEstados)
    const { data } = await api.get('/estados/productos')
    return unwrapList<ProdEstado>(data)
  },
  async create(input: { ProdEstadoDescripcion: string }): Promise<ProdEstado> {
    if (USE_MOCK) {
      const nuevo = { ProdEstadoID: nextId(db.prodEstados, 'ProdEstadoID'), ...input }
      db.prodEstados.push(nuevo)
      return delay(nuevo)
    }
    throw new Error('Los estados de producto son fijos y no se pueden crear')
  },
  async update(
    id: number,
    input: { ProdEstadoDescripcion: string },
  ): Promise<ProdEstado> {
    if (USE_MOCK) {
      const idx = db.prodEstados.findIndex((x) => x.ProdEstadoID === id)
      db.prodEstados[idx] = { ...db.prodEstados[idx]!, ...input }
      return delay(db.prodEstados[idx]!)
    }
    throw new Error('Los estados de producto son fijos y no se pueden editar')
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.prodEstados = db.prodEstados.filter((x) => x.ProdEstadoID !== id)
      return delay(undefined)
    }
    throw new Error('Los estados de producto son fijos y no se pueden eliminar')
  },
}

// --- Eventos ---
export const eventoService = {
  async list(): Promise<Evento[]> {
    if (USE_MOCK) return delay(db.eventos)
    const { data } = await api.get('/eventos')
    return unwrapList<Evento>(data)
  },
  async create(input: { EventoNombre: string }): Promise<Evento> {
    if (USE_MOCK) {
      const nuevo = { EventoID: nextId(db.eventos, 'EventoID'), ...input }
      db.eventos.push(nuevo)
      return delay(nuevo)
    }
    const { data } = await api.post('/eventos', input)
    return unwrap<Evento>(data)
  },
  async update(id: number, input: { EventoNombre: string }): Promise<Evento> {
    if (USE_MOCK) {
      const idx = db.eventos.findIndex((x) => x.EventoID === id)
      db.eventos[idx] = { ...db.eventos[idx]!, ...input }
      return delay(db.eventos[idx]!)
    }
    const { data } = await api.patch(`/eventos/${id}`, input)
    return unwrap<Evento>(data)
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.eventos = db.eventos.filter((x) => x.EventoID !== id)
      return delay(undefined)
    }
    await api.delete(`/eventos/${id}`)
  },
}
