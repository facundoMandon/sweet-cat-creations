import { Op, type WhereOptions } from "sequelize";
import { sequelize } from "../config/database.js";
import {
  Cliente,
  Pedido,
  PedidoEstado,
  Producto,
  ProdEstado,
  ProductoPedido,
} from "../models/index.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/AppError.js";
import { toJSON } from "../utils/serialize.js";
import {
  parsePagination,
  parseSort,
  paginated,
  type Paginated,
} from "../utils/query.js";
import {
  optionalId,
  optionalString,
  requiredDate,
  requiredId,
  requiredQuantity,
} from "../utils/validation.js";
import {
  pedidoEstadoId,
  pedidoEstadoNombre,
  prodEstadoId,
  TRANSICIONES,
  type PedidoEstadoNombre,
} from "../utils/estados.js";
import * as notificacionService from "./notificacion.service.js";
import * as calendarService from "./calendar.service.js";
import { assertOwnership, type AuthUser } from "./cliente.service.js";

const SORTS: Record<string, string | string[]> = {
  fecha: "PedidoFechaEntrega",
  creacion: "createdAt",
  total: "PedidoMontoTotal",
  id: "PedidoID",
};

const includes = () => [
  { model: Cliente, as: "cliente" },
  { model: PedidoEstado, as: "estado" },
  {
    model: ProductoPedido,
    as: "renglones",
    include: [{ model: Producto, as: "producto" }],
  },
];

interface RenglonInput {
  ProdID: number;
  Cantidad: number;
  TextoPersonalizado: string | null;
}

function parseRenglones(value: unknown): RenglonInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw badRequest("El pedido debe incluir al menos un renglón");
  }
  const items = value.map((raw) => {
    const r = raw as Record<string, unknown>;
    return {
      ProdID: requiredId(r["ProdID"], "ProdID"),
      Cantidad: requiredQuantity(r["Cantidad"], "Cantidad"),
      TextoPersonalizado: optionalString(
        r["TextoPersonalizado"],
        "TextoPersonalizado",
        500
      ),
    };
  });
  const ids = new Set(items.map((i) => i.ProdID));
  if (ids.size !== items.length) {
    throw badRequest("El pedido no puede repetir el mismo producto en dos renglones");
  }
  return items;
}

/** La entrega debe ser, como mínimo, mañana. */
function parseFechaEntrega(value: unknown): Date {
  const raw = requiredDate(value, "PedidoFechaEntrega");
  const fecha = new Date(`${raw}T00:00:00Z`);
  const minima = new Date();
  minima.setUTCHours(0, 0, 0, 0);
  minima.setUTCDate(minima.getUTCDate() + 1);
  if (fecha.getTime() < minima.getTime()) {
    throw badRequest("La fecha de entrega debe ser al menos el día de mañana");
  }
  return fecha;
}

async function resolverCliente(
  body: Record<string, unknown>,
  user: AuthUser | undefined
): Promise<Cliente> {
  const idPedido = optionalId(body["ClienteID"], "ClienteID");
  let cliente: Cliente | null = null;

  if (user && user.rol !== "admin") {
    if (user.clienteId) cliente = await Cliente.findByPk(user.clienteId);
    if (!cliente) {
      cliente = await Cliente.findOne({
        where: { ClienteEmail: user.email.toLowerCase() },
      });
    }
    if (!cliente) {
      throw forbidden("Tu usuario no tiene un cliente asociado");
    }
    if (idPedido && idPedido !== cliente.ClienteID) {
      throw forbidden("No podés crear pedidos para otro cliente");
    }
    return cliente;
  }

  if (!idPedido) throw badRequest('El campo "ClienteID" es obligatorio');
  cliente = await Cliente.findByPk(idPedido);
  if (!cliente) throw notFound("Cliente no encontrado");
  return cliente;
}

/**
 * Crea el pedido y sus renglones dentro de una única transacción.
 * Los precios se toman SIEMPRE de la base de datos, nunca del payload.
 */
export async function createPedido(
  body: Record<string, unknown>,
  user: AuthUser | undefined
) {
  const cliente = await resolverCliente(body, user);
  const fechaEntrega = parseFechaEntrega(body["PedidoFechaEntrega"]);
  const renglones = parseRenglones(body["renglones"] ?? body["items"]);
  const inactivoId = await prodEstadoId("Inactivo");
  const sinStockId = await prodEstadoId("Sin Stock");
  const pendienteId = await pedidoEstadoId("Pendiente");

  const pedidoId = await sequelize.transaction(async (t) => {
    const pedido = await Pedido.create(
      {
        PedidoFechaEntrega: fechaEntrega,
        PedidoEstadoID: pendienteId,
        ClienteID: cliente.ClienteID,
        PedidoMontoTotal: 0,
      } as never,
      { transaction: t }
    );

    let total = 0;
    for (const item of renglones) {
      const producto = await Producto.findByPk(item.ProdID, { transaction: t });
      if (!producto) throw notFound(`Producto ${item.ProdID} inexistente`);
      if (producto.ProdEstadoID === inactivoId) {
        throw conflict(`El producto "${producto.ProdNombre}" está inactivo`);
      }
      if (producto.ProdEstadoID === sinStockId) {
        throw conflict(`El producto "${producto.ProdNombre}" no tiene stock`);
      }

      const precio = Number(producto.ProdPrecio);
      total += precio * item.Cantidad;

      await ProductoPedido.create(
        {
          PedidoID: pedido.PedidoID,
          ProdID: producto.ProdID,
          Cantidad: item.Cantidad,
          ProdPrecioUnitario: precio,
          TextoPersonalizado: item.TextoPersonalizado,
        } as never,
        { transaction: t }
      );
    }

    await pedido.update(
      { PedidoMontoTotal: Number(total.toFixed(2)) },
      { transaction: t }
    );
    return pedido.PedidoID;
  });

  // Efectos externos: sólo después del COMMIT.
  const pedido = (await Pedido.findByPk(pedidoId))!;
  await notificacionService.notificarPedidoCreado(pedido, cliente);
  await calendarService.syncRecordatorios(pedido, cliente);

  return getPedido(pedidoId, user);
}

export async function listPedidos(
  query: Record<string, unknown>,
  user: AuthUser | undefined
): Promise<Paginated<unknown>> {
  const page = parsePagination(query);
  const [column, dir] = parseSort(query, SORTS, "creacion");

  const and: WhereOptions[] = [];

  const estadoId = optionalId(query["estadoId"], "estadoId");
  if (estadoId) and.push({ PedidoEstadoID: estadoId });

  const desde = query["desde"] ? requiredDate(query["desde"], "desde") : null;
  const hasta = query["hasta"] ? requiredDate(query["hasta"], "hasta") : null;
  if (desde) and.push({ PedidoFechaEntrega: { [Op.gte]: new Date(`${desde}T00:00:00Z`) } });
  if (hasta) and.push({ PedidoFechaEntrega: { [Op.lte]: new Date(`${hasta}T23:59:59Z`) } });

  if (user && user.rol !== "admin") {
    const propio = user.clienteId
      ? await Cliente.findByPk(user.clienteId)
      : await Cliente.findOne({ where: { ClienteEmail: user.email.toLowerCase() } });
    if (!propio) return paginated([], 0, page);
    and.push({ ClienteID: propio.ClienteID });
  } else {
    const clienteId = optionalId(query["clienteId"], "clienteId");
    if (clienteId) and.push({ ClienteID: clienteId });
  }

  const { rows, count } = await Pedido.findAndCountAll({
    where: and.length ? { [Op.and]: and } : {},
    include: includes(),
    order: [[column as string, dir]],
    limit: page.limit,
    offset: page.offset,
    distinct: true,
    subQuery: false,
  });
  return paginated(toJSON<unknown[]>(rows), count, page);
}

export async function getPedido(id: number, user: AuthUser | undefined) {
  const pedido = await Pedido.findByPk(id, { include: includes() });
  if (!pedido) throw notFound("Pedido no encontrado");
  const cliente = await Cliente.findByPk(pedido.ClienteID);
  if (cliente) assertOwnership(user, cliente);
  return toJSON(pedido);
}

/** Cambio de estado validando las transiciones permitidas. */
export async function cambiarEstado(
  id: number,
  body: Record<string, unknown>,
  user: AuthUser | undefined
) {
  const nuevoNombre = optionalString(body["estado"], "estado", 50) as
    | PedidoEstadoNombre
    | null;
  const nuevoId = nuevoNombre
    ? await pedidoEstadoId(nuevoNombre)
    : requiredId(body["PedidoEstadoID"], "PedidoEstadoID");

  const pedido = await Pedido.findByPk(id);
  if (!pedido) throw notFound("Pedido no encontrado");

  const actual = await pedidoEstadoNombre(pedido.PedidoEstadoID);
  const destino = nuevoNombre ?? (await pedidoEstadoNombre(nuevoId));
  if (!actual || !destino) throw badRequest("Estado de pedido desconocido");
  if (actual === destino) return getPedido(id, user);

  const permitidas = TRANSICIONES[actual] ?? [];
  if (!permitidas.includes(destino)) {
    throw conflict(`Transición no permitida: ${actual} -> ${destino}`);
  }

  await sequelize.transaction(async (t) => {
    await pedido.update({ PedidoEstadoID: nuevoId }, { transaction: t });
  });

  const cliente = await Cliente.findByPk(pedido.ClienteID);
  await notificacionService.notificarCambioEstado(pedido, cliente, actual, destino);
  if (destino === "Cancelado" || destino === "Entregado") {
    await calendarService.deleteRecordatorios(pedido.PedidoID);
  } else {
    await calendarService.syncRecordatorios(pedido, cliente);
  }

  return getPedido(id, user);
}

/** Reprogramación de la fecha de entrega (sólo pedidos pendientes). */
export async function reprogramarPedido(
  id: number,
  body: Record<string, unknown>,
  user: AuthUser | undefined
) {
  const pedido = await Pedido.findByPk(id);
  if (!pedido) throw notFound("Pedido no encontrado");
  const actual = await pedidoEstadoNombre(pedido.PedidoEstadoID);
  if (actual !== "Pendiente") {
    throw conflict("Sólo se pueden reprogramar pedidos pendientes");
  }
  const fecha = parseFechaEntrega(body["PedidoFechaEntrega"]);
  await pedido.update({ PedidoFechaEntrega: fecha });

  const cliente = await Cliente.findByPk(pedido.ClienteID);
  await calendarService.syncRecordatorios(pedido, cliente);
  return getPedido(id, user);
}

/**
 * Eliminación física: sólo pedidos cancelados. El resto se conserva como
 * historial (los renglones se borran en cascada).
 */
export async function deletePedido(id: number): Promise<void> {
  const pedido = await Pedido.findByPk(id);
  if (!pedido) throw notFound("Pedido no encontrado");
  const actual = await pedidoEstadoNombre(pedido.PedidoEstadoID);
  if (actual !== "Cancelado") {
    throw conflict("Sólo se pueden eliminar pedidos cancelados");
  }
  await sequelize.transaction(async (t) => {
    await ProductoPedido.destroy({ where: { PedidoID: id }, transaction: t });
    await pedido.destroy({ transaction: t });
  });
  await calendarService.deleteRecordatorios(id);
}

/** Métricas simples para el dashboard admin. */
export async function resumenPedidos() {
  const estados = await PedidoEstado.findAll();
  const conteos = await Promise.all(
    estados.map(async (e) => ({
      estado: e.PedidoEstadoDescripcion,
      cantidad: await Pedido.count({ where: { PedidoEstadoID: e.PedidoEstadoID } }),
    }))
  );
  const productosActivos = await Producto.count({
    where: { ProdEstadoID: { [Op.ne]: await prodEstadoId("Inactivo") } },
  });
  return toJSON({
    pedidosPorEstado: conteos,
    clientes: await Cliente.count(),
    productosActivos,
    estadosProducto: await ProdEstado.count(),
  });
}
