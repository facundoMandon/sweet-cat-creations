/**
 * Servicio de notificaciones (placeholder).
 * En producción reemplazar por integración con cola / proveedor de emails.
 */

export async function enqueueEmail(to: string, subject: string, html: string) {
  console.log('[notificacion] enqueueEmail', { to, subject });
  // Implementar encolar job (Bull/Redis) o enviar inmediatamente por SMTP/SendGrid.
  return Promise.resolve({ queued: true });
}

export async function notifyPedidoCreated(pedido: any, cliente: any) {
  const to = cliente.ClienteEmail ?? cliente.email;
  if (!to) {
    console.warn('notifyPedidoCreated: cliente sin email', cliente.id);
    return;
  }
  const subject = `Confirmación pedido #${pedido.id}`;
  const html = `<p>Hola ${cliente.nombre}, su pedido #${pedido.id} fue creado. Total: ${pedido.total}</p>`;
  return enqueueEmail(to, subject, html);
}

export async function notifyPedidoStatusChanged(pedido: any, oldStatus: string, newStatus: string) {
  const to = pedido.clienteEmail ?? pedido.cliente?.ClienteEmail ?? pedido.cliente?.email;
  if (!to) {
    console.warn('notifyPedidoStatusChanged: sin email disponible para pedido', pedido.id);
    return;
  }
  const subject = `Pedido #${pedido.id} - ${newStatus}`;
  const html = `<p>El estado de su pedido #${pedido.id} cambió de ${oldStatus} a ${newStatus}.</p>`;
  return enqueueEmail(to, subject, html);
}
