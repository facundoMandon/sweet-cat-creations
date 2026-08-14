import { Op } from "sequelize";
import { Cliente, Pedido, Usuario } from "../models/index.js";
import { conflict, forbidden, notFound } from "../utils/AppError.js";
import { toJSON } from "../utils/serialize.js";
import {
  parsePagination,
  parseSort,
  paginated,
  type Paginated,
} from "../utils/query.js";
import { optionalString, requiredString } from "../utils/validation.js";
import { createUsuario, deleteUsuario } from "./usuario.service.js";

export interface AuthUser {
  id: string;
  email: string;
  rol: "admin" | "cliente" | "visitante";
  clienteId?: number | undefined;
}

const SORTS: Record<string, string | string[]> = {
  nombre: "$usuario.UsuarioNombre$",
  email: "$usuario.UsuarioEmail$",
  fecha: "createdAt",
  id: "ClienteID",
};

const USUARIO_INCLUDE = { model: Usuario, as: "usuario" } as const;

/** Aplana el perfil + su usuario para el frontend. */
export function publicCliente(cliente: Cliente) {
  const usuario = (cliente as unknown as { usuario?: Usuario }).usuario;
  return {
    ClienteID: cliente.ClienteID,
    UsuarioID: cliente.UsuarioID,
    ClienteNombre: usuario
      ? [usuario.UsuarioNombre, usuario.UsuarioApellido].filter(Boolean).join(" ")
      : "",
    ClienteEmail: usuario?.UsuarioEmail ?? null,
    ClienteTelefono: cliente.ClienteTelefono,
    ClienteDireccion: cliente.ClienteDireccion,
    Rol: usuario?.Rol ?? "cliente",
    createdAt: cliente.createdAt,
    updatedAt: cliente.updatedAt,
  };
}

/** Nombre completo del cliente (vive en el usuario asociado). */
export function nombreCliente(cliente: Cliente | null | undefined): string | null {
  if (!cliente) return null;
  const usuario = (cliente as unknown as { usuario?: Usuario }).usuario;
  if (!usuario) return null;
  return [usuario.UsuarioNombre, usuario.UsuarioApellido].filter(Boolean).join(" ");
}

/** Email de contacto del cliente (vive en el usuario asociado). */
export function emailCliente(cliente: Cliente | null | undefined): string | null {
  if (!cliente) return null;
  return (cliente as unknown as { usuario?: Usuario }).usuario?.UsuarioEmail ?? null;
}

/** Un cliente sólo puede operar sobre su propio perfil; el admin sobre todos. */
export function assertOwnership(user: AuthUser | undefined, cliente: Cliente): void {
  if (!user || user.rol === "visitante") throw forbidden();
  if (user.rol === "admin") return;

  const mismoPerfil = user.clienteId !== undefined && user.clienteId === cliente.ClienteID;
  const mismoUsuario = Number(user.id) === cliente.UsuarioID;
  if (!mismoPerfil && !mismoUsuario) {
    throw forbidden("No podés acceder a este cliente");
  }
}

/** Perfil de compra del usuario autenticado (o null si no tiene). */
export async function clienteDeUsuario(
  user: AuthUser | undefined
): Promise<Cliente | null> {
  if (!user || user.rol === "visitante") return null;
  if (user.clienteId) {
    const porId = await Cliente.findByPk(user.clienteId, { include: [USUARIO_INCLUDE] });
    if (porId) return porId;
  }
  return Cliente.findOne({
    where: { UsuarioID: Number(user.id) },
    include: [USUARIO_INCLUDE],
  });
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
          { ClienteTelefono: { [Op.iLike]: `%${q}%` } },
          { ClienteDireccion: { [Op.iLike]: `%${q}%` } },
          { "$usuario.UsuarioNombre$": { [Op.iLike]: `%${q}%` } },
          { "$usuario.UsuarioEmail$": { [Op.iLike]: `%${q}%` } },
        ],
      }
    : {};

  const { rows, count } = await Cliente.findAndCountAll({
    where: where as never,
    include: [USUARIO_INCLUDE],
    order: [[column as string, dir]],
    limit: page.limit,
    offset: page.offset,
    distinct: true,
    subQuery: false,
  });
  return paginated(
    rows.map((c) => toJSON(publicCliente(c))),
    count,
    page
  );
}

export async function getClienteEntity(id: number): Promise<Cliente> {
  const cliente = await Cliente.findByPk(id, { include: [USUARIO_INCLUDE] });
  if (!cliente) throw notFound("Cliente no encontrado");
  return cliente;
}

export async function getCliente(id: number, user: AuthUser | undefined) {
  const cliente = await getClienteEntity(id);
  assertOwnership(user, cliente);
  return toJSON(publicCliente(cliente));
}

/**
 * Alta de cliente: crea usuario (rol cliente) + perfil. Se usa desde el panel
 * admin; el registro público pasa por /api/auth/register.
 */
export async function createCliente(body: Record<string, unknown>) {
  const nombre = requiredString(
    body["nombre"] ?? body["ClienteNombre"],
    "ClienteNombre",
    150
  );
  const usuario = await createUsuario(
    { ...body, nombre, rol: "cliente" },
    { forzarRolCliente: true }
  );
  const cliente = await Cliente.findOne({
    where: { UsuarioID: Number(usuario.id) },
    include: [USUARIO_INCLUDE],
  });
  if (!cliente) throw notFound("No se pudo crear el perfil del cliente");
  return toJSON(publicCliente(cliente));
}

export async function updateCliente(
  id: number,
  body: Record<string, unknown>,
  user: AuthUser | undefined
) {
  const cliente = await getClienteEntity(id);
  assertOwnership(user, cliente);

  const data: Record<string, unknown> = {};
  if (body["ClienteTelefono"] !== undefined || body["telefono"] !== undefined) {
    data["ClienteTelefono"] = requiredString(
      body["ClienteTelefono"] ?? body["telefono"],
      "ClienteTelefono",
      50
    );
  }
  if (body["ClienteDireccion"] !== undefined || body["direccion"] !== undefined) {
    data["ClienteDireccion"] = requiredString(
      body["ClienteDireccion"] ?? body["direccion"],
      "ClienteDireccion",
      250
    );
  }
  await cliente.update(data);

  // Nombre/apellido/email viven en el usuario asociado (el email es de sólo
  // lectura desde acá: cambiar el email de acceso es otra operación).
  const usuario = (cliente as unknown as { usuario?: Usuario }).usuario;
  if (usuario) {
    const identidad: Record<string, unknown> = {};
    const nombre = body["ClienteNombre"] ?? body["nombre"];
    if (nombre !== undefined) {
      identidad["UsuarioNombre"] = requiredString(nombre, "ClienteNombre", 150);
    }
    const apellido = body["ClienteApellido"] ?? body["apellido"];
    if (apellido !== undefined) {
      identidad["UsuarioApellido"] = optionalString(apellido, "apellido", 150);
    }
    if (Object.keys(identidad).length > 0) await usuario.update(identidad);
  }

  return toJSON(publicCliente(await getClienteEntity(id)));
}

/**
 * Eliminación: sólo si el cliente no tiene pedidos asociados. De lo contrario
 * el usuario se desactiva para no romper el historial.
 */
export async function deleteCliente(id: number): Promise<void> {
  const cliente = await getClienteEntity(id);
  const pedidos = await Pedido.count({ where: { ClienteID: id } });
  if (pedidos > 0) {
    throw conflict("No se puede eliminar: el cliente tiene pedidos asociados");
  }
  await deleteUsuario(cliente.UsuarioID);
}
