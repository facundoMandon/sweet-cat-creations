// Tipos alineados con los modelos Sequelize del backend Black Cats

export interface Categoria {
  CatID: number
  CatDescripcion: string
}

export interface SubCategoria {
  SubCatID: number
  SubCatDescripcion: string
  CatID: number
  categoria?: Categoria | undefined
}

export interface ProdEstado {
  ProdEstadoID: number
  ProdEstadoDescripcion: string
}

export interface Evento {
  EventoID: number
  EventoNombre: string
}

export interface Producto {
  ProdID: number
  ProdNombre: string
  ProdDescripcion: string | null
  SubCatID: number
  ProdEstadoID: number
  ProdImg: string | null
  EsCombo: boolean
  ProdPrecio: number
  createdAt?: string | undefined
  updatedAt?: string | undefined
  // Relaciones (embebidas por conveniencia en el mock)
  subcategoria?: SubCategoria | undefined
  estado?: ProdEstado | undefined
  eventos?: Evento[] | undefined
  itemsCombo?: Producto[] | undefined // productos que componen el combo
}

export interface ProductoCombo {
  ComboProdID: number
  ItemProdID: number
}

export interface ProdEvento {
  ProdID: number
  EventoID: number
}

export interface Cliente {
  ClienteID: number
  ClienteNombre: string
  ClienteTelefono: string | null
  ClienteDireccion: string | null
  createdAt?: string | undefined
  updatedAt?: string | undefined
}

export interface PedidoEstado {
  PedidoEstadoID: number
  PedidoEstadoDescripcion: string
}

export interface ProductoPedido {
  ProdPedidoID: number
  PedidoID: number
  ProdID: number
  Cantidad: number
  ProdPrecioUnitario: number
  TextoPersonalizado: string | null
  producto?: Producto | undefined
}

export interface Pedido {
  PedidoID: number
  PedidoFechaEntrega: string | null
  PedidoEstadoID: number
  ClienteID: number
  PedidoMontoTotal: number
  createdAt?: string | undefined
  updatedAt?: string | undefined
  cliente?: Cliente | undefined
  estado?: PedidoEstado | undefined
  renglones?: ProductoPedido[] | undefined
}

export type NotiEstado = 'enviado' | 'fallido' | 'pendiente'

export interface Notificacion {
  NotifID: number
  NotiEstado: NotiEstado
  NotiFecha: string
  PedidoID: number
  pedido?: Pedido | undefined
}

// --- Auth ---
export type Rol = 'admin' | 'cliente'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
  clienteId?: number | undefined
}

// --- Carrito ---
export interface CartItem {
  lineId: string // id local del renglón (permite repetidos con distinto texto)
  producto: Producto
  cantidad: number
  textoPersonalizado: string | null
}
