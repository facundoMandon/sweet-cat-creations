/**
 * Servicio de calendario (placeholder).
 * Integrar con Google Calendar u otro proveedor real según sea necesario.
 */

export async function createEventForPedido(pedido: any) {
  console.log('[calendar] createEventForPedido', pedido.id, pedido.fechaEntrega);
  // Lógica real: llamar API externa y retornar eventId.
  const eventId = `evt_${pedido.id}_${Date.now()}`;
  return { eventId };
}

export async function updateEventForPedido(pedido: any, eventId: string) {
  console.log('[calendar] updateEventForPedido', eventId, 'pedido', pedido.id);
  // Lógica real: patch event en proveedor
  return { eventId };
}

export async function deleteEventForPedido(eventId: string) {
  console.log('[calendar] deleteEventForPedido', eventId);
  return { deleted: true };
}
