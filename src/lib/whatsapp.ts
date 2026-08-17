import { formatCurrency, formatDate } from './format'
import type { CartItem } from './types'
import { brand, content } from '@/config'

// Número del vendedor en formato internacional, solo dígitos (país + área + número)
export const VENDEDOR_WHATSAPP = brand.contact.whatsapp

export interface OrderMessageInput {
  pedidoId: number
  cliente: string
  direccion: string
  fechaEntrega: string | null
  items: CartItem[]
  total: number
}

export function buildOrderMessage(input: OrderMessageInput): string {
  const lineas = input.items.map((it) => {
    const subtotal = it.producto.ProdPrecio * it.cantidad
    const texto = it.textoPersonalizado
      ? `\n   (Texto personalizado): "${it.textoPersonalizado}"`
      : ''
    return `• ${it.producto.ProdNombre} - x${it.cantidad} - ${formatCurrency(subtotal)}${texto}`
  })

  return [
    `*PEDIDO N° ${input.pedidoId}*`,
    '',
    `*Cliente:* ${input.cliente}`,
    '',
    '*Productos:*',
    ...lineas,
    '',
    `*Dirección de envío:* ${input.direccion}`,
    `*Fecha de entrega:* ${formatDate(input.fechaEntrega)}`,
    '',
    `*TOTAL: ${formatCurrency(input.total)}*`,
    '',
    content.whatsapp.closing,
    `${content.whatsapp.signature} - ${brand.name}`,
  ].join('\n')
}

export function whatsappUrl(message: string, phone = VENDEDOR_WHATSAPP): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
