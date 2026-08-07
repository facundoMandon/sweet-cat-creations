import { api, USE_MOCK } from '../api-client'
import { db, delay, nextId } from '../mock-db'
import type { Categoria, SubCategoria, ProdEstado, Evento } from '../types'

// --- Categorías ---
export const categoryService = {
  async list(): Promise<Categoria[]> {
    if (USE_MOCK) return delay(db.categorias)
    const { data } = await api.get('/categorias')
    return data
  },
  async create(input: { CatDescripcion: string }): Promise<Categoria> {
    if (USE_MOCK) {
      const nuevo = { CatID: nextId(db.categorias, 'CatID'), ...input }
      db.categorias.push(nuevo)
      return delay(nuevo)
    }
    const { data } = await api.post('/categorias', input)
    return data
  },
  async update(id: number, input: { CatDescripcion: string }): Promise<Categoria> {
    if (USE_MOCK) {
      const idx = db.categorias.findIndex((x) => x.CatID === id)
      db.categorias[idx] = { ...db.categorias[idx], ...input }
      return delay(db.categorias[idx])
    }
    const { data } = await api.put(`/categorias/${id}`, input)
    return data
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
    return data
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
    return data
  },
  async update(
    id: number,
    input: { SubCatDescripcion: string; CatID: number },
  ): Promise<SubCategoria> {
    if (USE_MOCK) {
      const idx = db.subcategorias.findIndex((x) => x.SubCatID === id)
      db.subcategorias[idx] = { ...db.subcategorias[idx], ...input }
      return delay(db.subcategorias[idx])
    }
    const { data } = await api.put(`/subcategorias/${id}`, input)
    return data
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
    const { data } = await api.get('/producto-estados')
    return data
  },
  async create(input: { ProdEstadoDescripcion: string }): Promise<ProdEstado> {
    if (USE_MOCK) {
      const nuevo = { ProdEstadoID: nextId(db.prodEstados, 'ProdEstadoID'), ...input }
      db.prodEstados.push(nuevo)
      return delay(nuevo)
    }
    const { data } = await api.post('/producto-estados', input)
    return data
  },
  async update(
    id: number,
    input: { ProdEstadoDescripcion: string },
  ): Promise<ProdEstado> {
    if (USE_MOCK) {
      const idx = db.prodEstados.findIndex((x) => x.ProdEstadoID === id)
      db.prodEstados[idx] = { ...db.prodEstados[idx], ...input }
      return delay(db.prodEstados[idx])
    }
    const { data } = await api.put(`/producto-estados/${id}`, input)
    return data
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.prodEstados = db.prodEstados.filter((x) => x.ProdEstadoID !== id)
      return delay(undefined)
    }
    await api.delete(`/producto-estados/${id}`)
  },
}

// --- Eventos ---
export const eventoService = {
  async list(): Promise<Evento[]> {
    if (USE_MOCK) return delay(db.eventos)
    const { data } = await api.get('/eventos')
    return data
  },
  async create(input: { EventoNombre: string }): Promise<Evento> {
    if (USE_MOCK) {
      const nuevo = { EventoID: nextId(db.eventos, 'EventoID'), ...input }
      db.eventos.push(nuevo)
      return delay(nuevo)
    }
    const { data } = await api.post('/eventos', input)
    return data
  },
  async update(id: number, input: { EventoNombre: string }): Promise<Evento> {
    if (USE_MOCK) {
      const idx = db.eventos.findIndex((x) => x.EventoID === id)
      db.eventos[idx] = { ...db.eventos[idx], ...input }
      return delay(db.eventos[idx])
    }
    const { data } = await api.put(`/eventos/${id}`, input)
    return data
  },
  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      db.eventos = db.eventos.filter((x) => x.EventoID !== id)
      return delay(undefined)
    }
    await api.delete(`/eventos/${id}`)
  },
}
