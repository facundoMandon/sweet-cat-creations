import { api, unwrap, unwrapList } from '../api-client'
import type { Categoria, SubCategoria, ProdEstado, Evento } from '../types'

// --- Categorías ---
export const categoryService = {
  async list(): Promise<Categoria[]> {
    const { data } = await api.get('/categorias')
    return unwrapList<Categoria>(data)
  },
  async create(input: { CatDescripcion: string }): Promise<Categoria> {
    const { data } = await api.post('/categorias', input)
    return unwrap<Categoria>(data)
  },
  async update(id: number, input: { CatDescripcion: string }): Promise<Categoria> {
    const { data } = await api.patch(`/categorias/${id}`, input)
    return unwrap<Categoria>(data)
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`)
  },
}

// --- Subcategorías ---
export const subcategoryService = {
  async list(): Promise<SubCategoria[]> {
    const { data } = await api.get('/subcategorias')
    return unwrapList<SubCategoria>(data)
  },
  async create(input: {
    SubCatDescripcion: string
    CatID: number
  }): Promise<SubCategoria> {
    const { data } = await api.post('/subcategorias', input)
    return unwrap<SubCategoria>(data)
  },
  async update(
    id: number,
    input: { SubCatDescripcion: string; CatID: number },
  ): Promise<SubCategoria> {
    const { data } = await api.patch(`/subcategorias/${id}`, input)
    return unwrap<SubCategoria>(data)
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/subcategorias/${id}`)
  },
}

// --- Estados de producto ---
export const prodEstadoService = {
  async list(): Promise<ProdEstado[]> {
    const { data } = await api.get('/estados/productos')
    return unwrapList<ProdEstado>(data)
  },
  async create(): Promise<ProdEstado> {
    throw new Error('Los estados de producto son fijos y no se pueden crear')
  },
  async update(): Promise<ProdEstado> {
    throw new Error('Los estados de producto son fijos y no se pueden editar')
  },
  async remove(): Promise<void> {
    throw new Error('Los estados de producto son fijos y no se pueden eliminar')
  },
}

// --- Eventos ---
export const eventoService = {
  async list(): Promise<Evento[]> {
    const { data } = await api.get('/eventos')
    return unwrapList<Evento>(data)
  },
  async create(input: { EventoNombre: string }): Promise<Evento> {
    const { data } = await api.post('/eventos', input)
    return unwrap<Evento>(data)
  },
  async update(id: number, input: { EventoNombre: string }): Promise<Evento> {
    const { data } = await api.patch(`/eventos/${id}`, input)
    return unwrap<Evento>(data)
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/eventos/${id}`)
  },
}
