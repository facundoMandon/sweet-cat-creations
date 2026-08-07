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

export const categorias: Categoria[] = [
  { CatID: 1, CatDescripcion: 'Chocolates' },
  { CatID: 2, CatDescripcion: 'Postres' },
  { CatID: 3, CatDescripcion: 'Galletas' },
  { CatID: 4, CatDescripcion: 'Combos' },
]

export const subcategorias: SubCategoria[] = [
  { SubCatID: 1, SubCatDescripcion: 'Trufas y Bombones', CatID: 1 },
  { SubCatID: 2, SubCatDescripcion: 'Tabletas', CatID: 1 },
  { SubCatID: 3, SubCatDescripcion: 'Pasteles', CatID: 2 },
  { SubCatID: 4, SubCatDescripcion: 'Cupcakes', CatID: 2 },
  { SubCatID: 5, SubCatDescripcion: 'Macarons', CatID: 3 },
  { SubCatID: 6, SubCatDescripcion: 'Galletas Decoradas', CatID: 3 },
  { SubCatID: 7, SubCatDescripcion: 'Cajas Combo', CatID: 4 },
]

export const prodEstados: ProdEstado[] = [
  { ProdEstadoID: 1, ProdEstadoDescripcion: 'Disponible' },
  { ProdEstadoID: 2, ProdEstadoDescripcion: 'Agotado' },
  { ProdEstadoID: 3, ProdEstadoDescripcion: 'Próximamente' },
]

export const eventos: Evento[] = [
  { EventoID: 1, EventoNombre: 'Cumpleaños' },
  { EventoID: 2, EventoNombre: 'San Valentín' },
  { EventoID: 3, EventoNombre: 'Aniversario' },
  { EventoID: 4, EventoNombre: 'Baby Shower' },
  { EventoID: 5, EventoNombre: 'Halloween' },
]

export const productos: Producto[] = [
  {
    ProdID: 1,
    ProdNombre: 'Trufas de Chocolate Negro',
    ProdDescripcion:
      'Trufas artesanales de cacao 70% con un corazón cremoso de ganache. Caja de 9 unidades.',
    SubCatID: 1,
    ProdEstadoID: 1,
    ProdImg: '/products/trufas.png',
    EsCombo: false,
    ProdPrecio: 180,
  },
  {
    ProdID: 2,
    ProdNombre: 'Bombones Surtidos',
    ProdDescripcion:
      'Surtido de bombones rellenos de avellana, caramelo salado y frambuesa. Caja de 12.',
    SubCatID: 1,
    ProdEstadoID: 1,
    ProdImg: '/products/bombones.png',
    EsCombo: false,
    ProdPrecio: 240,
  },
  {
    ProdID: 3,
    ProdNombre: 'Tableta Personalizada',
    ProdDescripcion:
      'Tableta de chocolate con leche donde escribimos el mensaje que tú quieras. Ideal para regalar.',
    SubCatID: 2,
    ProdEstadoID: 1,
    ProdImg: '/products/tableta.png',
    EsCombo: false,
    ProdPrecio: 150,
  },
  {
    ProdID: 4,
    ProdNombre: 'Cheesecake de Fresa',
    ProdDescripcion:
      'Cheesecake cremoso horneado con mermelada de fresa natural y base de galleta. 8 porciones.',
    SubCatID: 3,
    ProdEstadoID: 1,
    ProdImg: '/products/cheesecake.png',
    EsCombo: false,
    ProdPrecio: 320,
  },
  {
    ProdID: 5,
    ProdNombre: 'Cupcakes Kawaii (x6)',
    ProdDescripcion:
      'Media docena de cupcakes de vainilla decorados con caritas kawaii en buttercream.',
    SubCatID: 4,
    ProdEstadoID: 1,
    ProdImg: '/products/cupcakes.png',
    EsCombo: false,
    ProdPrecio: 210,
  },
  {
    ProdID: 6,
    ProdNombre: 'Macarons Pastel (x9)',
    ProdDescripcion:
      'Macarons franceses en colores pastel: pistacho, frambuesa, lavanda y vainilla.',
    SubCatID: 5,
    ProdEstadoID: 1,
    ProdImg: '/products/macarons.png',
    EsCombo: false,
    ProdPrecio: 230,
  },
  {
    ProdID: 7,
    ProdNombre: 'Galletas Gato Negro',
    ProdDescripcion:
      'Galletas de mantequilla decoradas con royal icing en forma de gatito negro. Personalizables.',
    SubCatID: 6,
    ProdEstadoID: 1,
    ProdImg: '/products/galletas-gato.png',
    EsCombo: false,
    ProdPrecio: 160,
  },
  {
    ProdID: 8,
    ProdNombre: 'Brownie Fudge',
    ProdDescripcion:
      'Brownie denso y húmedo con trozos de chocolate belga. Caja de 6 cuadros.',
    SubCatID: 3,
    ProdEstadoID: 2,
    ProdImg: '/products/brownie.png',
    EsCombo: false,
    ProdPrecio: 140,
  },
  {
    ProdID: 9,
    ProdNombre: 'Cake Pops (x8)',
    ProdDescripcion:
      'Bolitas de pastel bañadas en chocolate con sprinkles de colores. Perfectas para fiestas.',
    SubCatID: 4,
    ProdEstadoID: 3,
    ProdImg: '/products/cakepops.png',
    EsCombo: false,
    ProdPrecio: 190,
  },
  {
    ProdID: 10,
    ProdNombre: 'Combo San Valentín',
    ProdDescripcion:
      'Caja romántica con trufas, tableta personalizada y galletas de corazón. Endulza a quien más quieres.',
    SubCatID: 7,
    ProdEstadoID: 1,
    ProdImg: '/products/combo-valentin.png',
    EsCombo: true,
    ProdPrecio: 450,
  },
  {
    ProdID: 11,
    ProdNombre: 'Combo Cumpleaños Feliz',
    ProdDescripcion:
      'Caja festiva con cupcakes kawaii, cake pops y bombones surtidos. Ideal para celebrar.',
    SubCatID: 7,
    ProdEstadoID: 1,
    ProdImg: '/products/combo-cumple.png',
    EsCombo: true,
    ProdPrecio: 520,
  },
]

// Combos: ComboProdID incluye ItemProdID
export const productoCombos: ProductoCombo[] = [
  { ComboProdID: 10, ItemProdID: 1 }, // Valentín -> Trufas
  { ComboProdID: 10, ItemProdID: 3 }, // Valentín -> Tableta
  { ComboProdID: 10, ItemProdID: 7 }, // Valentín -> Galletas gato
  { ComboProdID: 11, ItemProdID: 5 }, // Cumple -> Cupcakes
  { ComboProdID: 11, ItemProdID: 9 }, // Cumple -> Cake pops
  { ComboProdID: 11, ItemProdID: 2 }, // Cumple -> Bombones
]

export const prodEventos: ProdEvento[] = [
  { ProdID: 1, EventoID: 2 },
  { ProdID: 3, EventoID: 2 },
  { ProdID: 3, EventoID: 3 },
  { ProdID: 5, EventoID: 1 },
  { ProdID: 6, EventoID: 4 },
  { ProdID: 7, EventoID: 5 },
  { ProdID: 9, EventoID: 1 },
  { ProdID: 10, EventoID: 2 },
  { ProdID: 11, EventoID: 1 },
]

export const clientes: Cliente[] = [
  {
    ClienteID: 1,
    ClienteNombre: 'María López',
    ClienteTelefono: '+52 55 1234 5678',
    ClienteDireccion: 'Av. Reforma 123, CDMX',
    createdAt: '2024-11-02T10:00:00.000Z',
  },
  {
    ClienteID: 2,
    ClienteNombre: 'Diego Ramírez',
    ClienteTelefono: '+52 33 8765 4321',
    ClienteDireccion: 'Calle Morelos 45, Guadalajara',
    createdAt: '2024-12-15T14:30:00.000Z',
  },
  {
    ClienteID: 3,
    ClienteNombre: 'Ana Torres',
    ClienteTelefono: '+52 81 2222 3333',
    ClienteDireccion: 'Blvd. Díaz Ordaz 900, Monterrey',
    createdAt: '2025-01-20T09:15:00.000Z',
  },
]

export const pedidoEstados: PedidoEstado[] = [
  { PedidoEstadoID: 1, PedidoEstadoDescripcion: 'Pendiente' },
  { PedidoEstadoID: 2, PedidoEstadoDescripcion: 'En preparación' },
  { PedidoEstadoID: 3, PedidoEstadoDescripcion: 'Listo para entrega' },
  { PedidoEstadoID: 4, PedidoEstadoDescripcion: 'Entregado' },
  { PedidoEstadoID: 5, PedidoEstadoDescripcion: 'Cancelado' },
]

export const pedidos: Pedido[] = [
  {
    PedidoID: 1,
    PedidoFechaEntrega: '2025-02-14T12:00:00.000Z',
    PedidoEstadoID: 2,
    ClienteID: 1,
    PedidoMontoTotal: 630,
    createdAt: '2025-02-01T11:00:00.000Z',
  },
  {
    PedidoID: 2,
    PedidoFechaEntrega: '2025-01-25T16:00:00.000Z',
    PedidoEstadoID: 4,
    ClienteID: 2,
    PedidoMontoTotal: 320,
    createdAt: '2025-01-18T18:20:00.000Z',
  },
  {
    PedidoID: 3,
    PedidoFechaEntrega: '2025-03-01T10:00:00.000Z',
    PedidoEstadoID: 1,
    ClienteID: 3,
    PedidoMontoTotal: 450,
    createdAt: '2025-02-20T08:45:00.000Z',
  },
]

export const productoPedidos: ProductoPedido[] = [
  {
    ProdPedidoID: 1,
    PedidoID: 1,
    ProdID: 1,
    Cantidad: 1,
    ProdPrecioUnitario: 180,
    TextoPersonalizado: null,
  },
  {
    ProdPedidoID: 2,
    PedidoID: 1,
    ProdID: 3,
    Cantidad: 1,
    ProdPrecioUnitario: 150,
    TextoPersonalizado: 'Te amo, Sofi',
  },
  {
    ProdPedidoID: 3,
    PedidoID: 1,
    ProdID: 3,
    Cantidad: 2,
    ProdPrecioUnitario: 150,
    TextoPersonalizado: 'Feliz día',
  },
  {
    ProdPedidoID: 4,
    PedidoID: 2,
    ProdID: 4,
    Cantidad: 1,
    ProdPrecioUnitario: 320,
    TextoPersonalizado: null,
  },
  {
    ProdPedidoID: 5,
    PedidoID: 3,
    ProdID: 10,
    Cantidad: 1,
    ProdPrecioUnitario: 450,
    TextoPersonalizado: 'Para mi persona favorita',
  },
]

export const notificaciones: Notificacion[] = [
  {
    NotifID: 1,
    NotiEstado: 'enviado',
    NotiFecha: '2025-02-01T11:05:00.000Z',
    PedidoID: 1,
  },
  {
    NotifID: 2,
    NotiEstado: 'enviado',
    NotiFecha: '2025-01-18T18:25:00.000Z',
    PedidoID: 2,
  },
  {
    NotifID: 3,
    NotiEstado: 'pendiente',
    NotiFecha: '2025-02-20T08:50:00.000Z',
    PedidoID: 3,
  },
  {
    NotifID: 4,
    NotiEstado: 'fallido',
    NotiFecha: '2025-02-20T09:00:00.000Z',
    PedidoID: 3,
  },
]
