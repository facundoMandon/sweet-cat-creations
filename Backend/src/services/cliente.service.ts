import { Op } from 'sequelize';
import { sequelize, Cliente } from '../models';
import { AppError } from '../utils/AppError';
import { validateClientePayload } from '../utils/validation';

export async function createCliente(payload: any) {
  validateClientePayload(payload);
  const cliente = await Cliente.create(payload);
  return cliente;
}

export async function getClienteById(id: number) {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) throw new AppError(404, 'Cliente no encontrado');
  return cliente;
}

export async function findClientes(query: { q?: string; page?: number; limit?: number }) {
  const where: any = { bajaLogica: false };
  if (query.q) {
    where[Op.or] = [
      { nombre: { [Op.iLike]: `%${query.q}%` } },
      { apellido: { [Op.iLike]: `%${query.q}%` } },
      { ClienteEmail: { [Op.iLike]: `%${query.q}%` } },
    ];
  }
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;
  const { rows, count } = await Cliente.findAndCountAll({ where, limit, offset });
  return { data: rows, count, page, limit };
}

export async function updateCliente(id: number, payload: any) {
  validateClientePayload(payload, { partial: true });
  const cliente = await getClienteById(id);
  await cliente.update(payload);
  return cliente;
}

export async function softDeleteCliente(id: number) {
  const cliente = await getClienteById(id);
  // Evitar borrado físico si tiene pedidos; marcar baja lógica en ese caso.
  const pedidosCount = await sequelize.models.Pedido.count({ where: { clienteId: id } });
  if (pedidosCount > 0) {
    cliente.bajaLogica = true;
    await cliente.save();
    return cliente;
  }
  await cliente.destroy();
  return cliente;
}
