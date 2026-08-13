import { Op } from "sequelize";
import { Cliente, Pedido } from "../models/index.js";
import { conflict, forbidden, notFound } from "../utils/AppError.js";
import { toJSON } from "../utils/serialize.js";
import {
  parsePagination,
  parseSort,
  paginated,
  type Paginated,
} from "../utils/query.js";
import {
  optionalString,
  requiredString,
} from "../utils/validation.js";

const SORTS: Record<string, string | string[]> = {
  nombre: "ClienteNombre",
  fecha: "createdAt",
  id: "ClienteID",
  rol: "Rol", // ✏️ 1. Habilitado ordenamiento por Rol
};

export interface AuthUser {
  id: string;
  email: string;
  rol: "admin" | "cliente";
  clienteId?: number | undefined;
}

/** Un cliente sólo puede operar sobre su propio registro; el admin sobre todos. */
export function assertOwnership(user: AuthUser | undefined, cliente: Cliente): void {
  if (!user) throw forbidden();
  if (user.rol === "admin") return;

  // ✏️ 2. Conversión segura para comparar id numérico contra clienteID
  const userIdNum = user.clienteId ?? Number(user.id);
  const mismoId = !isNaN(userIdNum) && userIdNum === cliente.ClienteID;
  const mismoEmail =
    !!cliente.ClienteEmail &&
    cliente.ClienteEmail.toLowerCase() === user.email.toLowerCase();

  if (!mismoId && !mismoEmail) throw forbidden("No podés acceder a este cliente");
}

function parseInput(body: Record<string, unknown>, partial = false) {
  const out: Record<string, unknown> = {};

  if (!partial || body["ClienteNombre"] !== undefined) {
    out["ClienteNombre"] = requiredString(body["ClienteNombre"], "ClienteNombre", 150);
  }

  // 🔒 Teléfono y Dirección SIGUEN SIENDO OBLIGATORIOS (requiredString)
  if (!partial || body["ClienteTelefono"] !== undefined) {
    out["ClienteTelefono"] = requiredString(
      body["ClienteTelefono"],
      "ClienteTelefono",
      50
    );
  }
  if (!partial || body["ClienteDireccion"] !== undefined) {
    out["ClienteDireccion"] = requiredString(
      body["ClienteDireccion"],
      "ClienteDireccion",
      250
    );
  }

  // ✏️ 3. Parseo y sanitización del Rol
  if (body["Rol"] !== undefined) {
    const rolInput = requiredString(body["Rol"], "Rol", 50);
    out["Rol"] = rolInput === "admin" ? "admin" : "cliente";
  } else if (!partial) {
    out["Rol"] = "cliente"; // Rol por defecto en creación
  }

  if (body["ClienteEmail"] !== undefined) {
    const email = optionalString(body["ClienteEmail"], "ClienteEmail", 150);
    out["ClienteEmail"] = email ? email.toLowerCase() : null;
  }
  return out;
}

export async function listClientes(
  query: Record<string, unknown>
): Promise<Paginated<unknown>> {
  const page = parsePagination(query);
  const [column, dir] = parseSort(query, SORTS, "nombre");

  const q = optionalString(query["q"], "q", 150);
  const where = q
    ? {
        [Op.or]: [
          { ClienteNombre: { [Op.iLike]: `%${q}%` } },
          { ClienteEmail: { [Op.iLike]: `%${q}%` } },
          { ClienteTelefono: { [Op.iLike]: `%${q}%` } },
          { Rol: { [Op.iLike]: `%${q}%` } }, // ✏️ 4. Permite filtrar por Rol en las búsquedas
        ],
      }
    : {};

  const { rows, count } = await Cliente.findAndCountAll({
    where,
    order: [[column as string, dir]],
    limit: page.limit,
    offset: page.offset,
  });
  return paginated(toJSON<unknown[]>(rows), count, page);
}

export async function getClienteEntity(id: number): Promise<Cliente> {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) throw notFound("Cliente no encontrado");
  return cliente;
}

export async function getCliente(id: number, user: AuthUser | undefined) {
  const cliente = await getClienteEntity(id);
  assertOwnership(user, cliente);
  return toJSON(cliente);
}

// ✏️ 5. Se agregó `user?: AuthUser` para controlar asignación de roles al crear
export async function createCliente(
  body: Record<string, unknown>,
  user?: AuthUser
) {
  const data = parseInput(body);

  // Si NO es admin el que crea la cuenta (ej. registro público), se fuerza el rol a "cliente"
  if (user?.rol !== "admin") {
    data["Rol"] = "cliente";
  }

  const email = data["ClienteEmail"] as string | null | undefined;
  if (email) {
    const dup = await Cliente.findOne({ where: { ClienteEmail: email } });
    if (dup) throw conflict("Ya existe un cliente con ese email");
  }
  return toJSON(await Cliente.create(data as never));
}

export async function updateCliente(
  id: number,
  body: Record<string, unknown>,
  user: AuthUser | undefined
) {
  const cliente = await getClienteEntity(id);
  assertOwnership(user, cliente);
  const data = parseInput(body, true);

  // ✏️ 6. Protección: sólo el admin puede modificar email Y asignación de rol
  if (user?.rol !== "admin") {
    delete data["ClienteEmail"];
    delete data["Rol"];
  }

  const email = data["ClienteEmail"] as string | null | undefined;
  if (email) {
    const dup = await Cliente.findOne({
      where: { ClienteEmail: email, ClienteID: { [Op.ne]: id } },
    });
    if (dup) throw conflict("Ya existe un cliente con ese email");
  }

  await cliente.update(data);
  return toJSON(cliente);
}

/**
 * Eliminación: sólo si el cliente no tiene pedidos asociados. De lo contrario
 * se rechaza para no romper el historial.
 */
export async function deleteCliente(id: number): Promise<void> {
  const cliente = await getClienteEntity(id);
  const pedidos = await Pedido.count({ where: { ClienteID: id } });
  if (pedidos > 0) {
    throw conflict("No se puede eliminar: el cliente tiene pedidos asociados");
  }
  await cliente.destroy();
}