// Tipos alineados con los modelos Sequelize del backend Black Cats

export interface Categoria {
  CatID: number
  CatDescripcion: string
}

export interface SubCategoria {
  // Identidad compuesta: el número reinicia en 1 dentro de cada categoría
  CatID: number
  SubCatID: number
  SubCatDescripcion: string
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
  CatID: number
  SubCatID: number
  ProdEstadoID: number
  ProdImg: string | null
  ProdImgPublicId?: string | null
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
  PedidoFechaEntrega: string
  PedidoEstadoID: number
  ClienteID: number
  PedidoMontoTotal: number
  /** Dirección de entrega del pedido (puede diferir de la del perfil). */
  PedidoDireccion?: string | null | undefined
  PedidoLat?: number | null | undefined
  PedidoLng?: number | null | undefined
  PedidoPlaceID?: string | null | undefined
  PedidoReferencias?: string | null | undefined
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
/** `visitante` = sin sesión: puede navegar pero no comprar. */
export type Rol = 'admin' | 'cliente' | 'visitante'

export interface Usuario {
  id: string | number
  nombre: string
  apellido?: string | null | undefined
  email: string
  rol: Rol
  activo?: boolean | undefined
  telefono?: string | null | undefined
  direccion?: string | null | undefined
  clienteId?: number | null | undefined
}


/** Perfil de compra asociado a un Usuario (1:1). */
export interface Cliente {
  ClienteID: number
  UsuarioID?: number | null | undefined
  ClienteNombre: string
  ClienteApellido?: string | null | undefined
  ClienteEmail?: string | null | undefined
  ClienteTelefono: string
  ClienteDireccion: string
  ClienteLat?: number | null | undefined
  ClienteLng?: number | null | undefined
  ClientePlaceID?: string | null | undefined
  Rol?: Rol | undefined
  createdAt?: string | undefined
  updatedAt?: string | undefined
}



// --- Carrito ---
export interface CartItem {
  lineId: string // id local del renglón (permite repetidos con distinto texto)
  producto: Producto
  cantidad: number
  textoPersonalizado: string | null
}
