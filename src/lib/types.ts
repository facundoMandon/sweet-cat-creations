// Tipos alineados con los modelos Sequelize del backend Black Cats

export interface Categoria {
  CatID: number
  CatDescripcion: string
}

export interface SubCategoria {
  SubCatID: number
  SubCatDescripcion: string
  CatID: number
  categoria?: Categoria
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
  createdAt?: string
  updatedAt?: string
  // Relaciones (embebidas por conveniencia en el mock)
  subcategoria?: SubCategoria
  estado?: ProdEstado
  eventos?: Evento[]
  itemsCombo?: Producto[] // productos que componen el combo
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
  createdAt?: string
  updatedAt?: string
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
  producto?: Producto
}

export interface Pedido {
  PedidoID: number
  PedidoFechaEntrega: string | null
  PedidoEstadoID: number
  ClienteID: number
  PedidoMontoTotal: number
  createdAt?: string
  updatedAt?: string
  cliente?: Cliente
  estado?: PedidoEstado
  renglones?: ProductoPedido[]
}

export type NotiEstado = 'enviado' | 'fallido' | 'pendiente'

export interface Notificacion {
  NotifID: number
  NotiEstado: NotiEstado
  NotiFecha: string
  PedidoID: number
  pedido?: Pedido
}

// --- Auth ---
export type Rol = 'admin' | 'cliente'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
  clienteId?: number
}

// --- Carrito ---
export interface CartItem {
  lineId: string // id local del renglón (permite repetidos con distinto texto)
  producto: Producto
  cantidad: number
  textoPersonalizado: string | null
}
