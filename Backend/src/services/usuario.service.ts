import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import { Cliente, Pedido, Usuario } from "../models/index.js";
import type { RolPersistido } from "../models/Usuario.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/AppError.js";
import { toJSON } from "../utils/serialize.js";
import {
  parsePagination,
  parseSort,
  paginated,
  type Paginated,
} from "../utils/query.js";
import {
  optionalBoolean,
  optionalString,
  requiredEmail,
  requiredString,
} from "../utils/validation.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export interface AuthUser {
  id: string;
  email: string;
  rol: "admin" | "cliente" | "visitante";
  clienteId?: number | undefined;
}

const SORTS: Record<string, string | string[]> = {
  nombre: "UsuarioNombre",
  email: "UsuarioEmail",
  rol: "Rol",
  fecha: "createdAt",
  id: "UsuarioID",
};

const PERFIL = { model: Cliente, as: "cliente" } as const;

/** Vista pública de un usuario (nunca incluye el hash). */
export function publicUsuario(u: Usuario, cliente?: Cliente | null) {
  const perfil = cliente ?? (u as unknown as { cliente?: Cliente }).cliente ?? null;
  return {
    id: u.UsuarioID,
    nombre: u.UsuarioNombre,
    apellido: u.UsuarioApellido,
    email: u.UsuarioEmail,
    rol: u.Rol,
    activo: u.Activo,
    clienteId: perfil?.ClienteID ?? null,
    telefono: perfil?.ClienteTelefono ?? null,
    direccion: perfil?.ClienteDireccion ?? null,
    createdAt: u.createdAt,
  };
}

export function parseRol(value: unknown): RolPersistido {
  const rol = requiredString(value, "rol", 20).toLowerCase();
  if (rol === "admin" || rol === "cliente") return rol;
  throw badRequest('El campo "rol" debe ser "admin" o "cliente"');
}

function parsePassword(value: unknown): string {
  const pass = requiredString(value, "password", 128);
  if (pass.length < 6) {
    throw badRequest("La contraseña debe tener al menos 6 caracteres");
  }
  return pass;
}

export async function getUsuarioEntity(id: number): Promise<Usuario> {
  const usuario = await Usuario.findByPk(id, { include: [PERFIL] });
  if (!usuario) throw notFound("Usuario no encontrado");
  return usuario;
}

export async function findByEmail(email: string): Promise<Usuario | null> {
  return Usuario.findOne({
    where: { UsuarioEmail: email.toLowerCase() },
    include: [PERFIL],
  });
}

/** Sólo el propio usuario o un admin. */
export function assertSelfOrAdmin(user: AuthUser | undefined, usuarioId: number): void {
  if (!user || user.rol === "visitante") throw forbidden();
  if (user.rol === "admin") return;
  if (Number(user.id) !== usuarioId) {
    throw forbidden("No podés acceder a los datos de otro usuario");
  }
}

/**
 * Alta de usuario. Si el rol es "cliente" se crea también su perfil de compra
 * dentro de la misma transacción.
 */
export async function createUsuario(
  body: Record<string, unknown>,
  opts: { forzarRolCliente?: boolean } = {}
) {
  const nombre = requiredString(body["nombre"] ?? body["UsuarioNombre"], "nombre", 150);
  const apellido = optionalString(
    body["apellido"] ?? body["UsuarioApellido"],
    "apellido",
    150
  );
  const email = requiredEmail(body["email"] ?? body["UsuarioEmail"]);
  const password = parsePassword(body["password"] ?? body["contrasenia"]);
  const rol: RolPersistido = opts.forzarRolCliente
    ? "cliente"
    : body["rol"] !== undefined
      ? parseRol(body["rol"])
      : "cliente";

  // Para el rol cliente, teléfono y dirección son obligatorios: se necesitan
  // para poder entregar el pedido.
  const telefono =
    rol === "cliente"
      ? requiredString(body["telefono"] ?? body["ClienteTelefono"], "telefono", 50)
      : optionalString(body["telefono"] ?? body["ClienteTelefono"], "telefono", 50);
  const direccion =
    rol === "cliente"
      ? requiredString(body["direccion"] ?? body["ClienteDireccion"], "direccion", 250)
      : optionalString(body["direccion"] ?? body["ClienteDireccion"], "direccion", 250);

  if (await findByEmail(email)) {
    throw conflict("Ya existe un usuario con ese email");
  }

  const usuarioId = await sequelize.transaction(async (t) => {
    const usuario = await Usuario.create(
      {
        UsuarioNombre: nombre,
        UsuarioApellido: apellido,
        UsuarioEmail: email,
        UsuarioContraseniaHash: hashPassword(password),
        Rol: rol,
      } as never,
      { transaction: t }
    );

    if (rol === "cliente") {
      await Cliente.create(
        {
          UsuarioID: usuario.UsuarioID,
          ClienteTelefono: telefono ?? "",
          ClienteDireccion: direccion ?? "",
        } as never,
        { transaction: t }
      );
    }
    return usuario.UsuarioID;
  });

  return publicUsuario(await getUsuarioEntity(usuarioId));
}

export async function listUsuarios(
  query: Record<string, unknown>
): Promise<Paginated<unknown>> {
  const page = parsePagination(query);
  const [column, dir] = parseSort(query, SORTS, "nombre");

  const and: Record<string, unknown>[] = [];
  const q = optionalString(query["q"], "q", 150);
  if (q) {
    and.push({
      [Op.or]: [
        { UsuarioNombre: { [Op.iLike]: `%${q}%` } },
        { UsuarioApellido: { [Op.iLike]: `%${q}%` } },
        { UsuarioEmail: { [Op.iLike]: `%${q}%` } },
      ],
    });
  }
  if (query["rol"] !== undefined) and.push({ Rol: parseRol(query["rol"]) });
  const activo = optionalBoolean(query["activo"], "activo");
  if (activo !== undefined) and.push({ Activo: activo });

  const { rows, count } = await Usuario.findAndCountAll({
    where: and.length ? { [Op.and]: and } : {},
    include: [PERFIL],
    order: [[column as string, dir]],
    limit: page.limit,
    offset: page.offset,
    distinct: true,
  });
  return paginated(
    rows.map((u) => toJSON(publicUsuario(u))),
    count,
    page
  );
}

export async function getUsuario(id: number, user: AuthUser | undefined) {
  assertSelfOrAdmin(user, id);
  return publicUsuario(await getUsuarioEntity(id));
}

export async function updateUsuario(
  id: number,
  body: Record<string, unknown>,
  user: AuthUser | undefined
) {
  assertSelfOrAdmin(user, id);
  const usuario = await getUsuarioEntity(id);

  const data: Record<string, unknown> = {};
  if (body["nombre"] !== undefined || body["UsuarioNombre"] !== undefined) {
    data["UsuarioNombre"] = requiredString(
      body["nombre"] ?? body["UsuarioNombre"],
      "nombre",
      150
    );
  }
  if (body["apellido"] !== undefined || body["UsuarioApellido"] !== undefined) {
    data["UsuarioApellido"] = optionalString(
      body["apellido"] ?? body["UsuarioApellido"],
      "apellido",
      150
    );
  }
  if (body["email"] !== undefined) {
    const email = requiredEmail(body["email"]);
    const dup = await Usuario.findOne({
      where: { UsuarioEmail: email, UsuarioID: { [Op.ne]: id } },
    });
    if (dup) throw conflict("Ya existe un usuario con ese email");
    data["UsuarioEmail"] = email;
  }

  // Rol y estado activo son exclusivos del admin.
  if (user?.rol === "admin") {
    if (body["rol"] !== undefined) data["Rol"] = parseRol(body["rol"]);
    const activo = optionalBoolean(body["activo"], "activo");
    if (activo !== undefined) data["Activo"] = activo;
  }

  await sequelize.transaction(async (t) => {
    await usuario.update(data, { transaction: t });
    // Si pasó a cliente y no tenía perfil, se lo creamos.
    if (data["Rol"] === "cliente") {
      const perfil = await Cliente.findOne({
        where: { UsuarioID: id },
        transaction: t,
      });
      if (!perfil) {
        await Cliente.create(
          { UsuarioID: id, ClienteTelefono: "", ClienteDireccion: "" } as never,
          { transaction: t }
        );
      }
    }
  });

  return publicUsuario(await getUsuarioEntity(id));
}

export async function cambiarPassword(
  id: number,
  body: Record<string, unknown>,
  user: AuthUser | undefined
): Promise<void> {
  assertSelfOrAdmin(user, id);
  const usuario = await getUsuarioEntity(id);
  const nueva = parsePassword(body["password"] ?? body["nueva"]);

  // El propio usuario debe confirmar su contraseña actual; el admin no.
  if (user?.rol !== "admin") {
    const actual = requiredString(body["actual"], "actual", 128);
    if (!verifyPassword(actual, usuario.UsuarioContraseniaHash)) {
      throw badRequest("La contraseña actual no es correcta");
    }
  }
  await usuario.update({ UsuarioContraseniaHash: hashPassword(nueva) });
}

/** Baja lógica (recomendada) o física si no tiene historial. */
export async function deleteUsuario(id: number): Promise<{ eliminado: boolean }> {
  const usuario = await getUsuarioEntity(id);
  const perfil = await Cliente.findOne({ where: { UsuarioID: id } });

  if (perfil) {
    const pedidos = await Pedido.count({ where: { ClienteID: perfil.ClienteID } });
    if (pedidos > 0) {
      await usuario.update({ Activo: false });
      return { eliminado: false };
    }
  }

  await sequelize.transaction(async (t) => {
    if (perfil) await perfil.destroy({ transaction: t });
    await usuario.destroy({ transaction: t });
  });
  return { eliminado: true };
}
