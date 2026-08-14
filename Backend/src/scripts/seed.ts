/**
 * Seed idempotente: crea el admin, un cliente demo y algunos productos
 * para que el catálogo no quede vacío. Se puede correr las veces que sea.
 *
 *   npm run seed
 */
import "dotenv/config";
import { sequelize } from "../config/database.js";
import {
  Categoria,
  Cliente,
  Producto,
  SubCategoria,
  Usuario,
} from "../models/index.js";
import { ensureEstados, prodEstadoId } from "../utils/estados.js";
import { hashPassword } from "../utils/password.js";

const ADMIN = {
  email: "admin@blackcats.com",
  password: "admin123",
  nombre: "Administración",
  apellido: "Black Cats",
};

const CLIENTE = {
  email: "cliente@blackcats.com",
  password: "cliente123",
  nombre: "Cliente",
  apellido: "Demo",
  telefono: "3412288582",
  direccion: "Av. Siempre Viva 742, Rosario",
};

const PRODUCTOS = [
  {
    nombre: "Alfajores de maicena x6",
    descripcion: "Clásicos alfajores rellenos de dulce de leche y coco.",
    precio: 4800,
    categoria: "Postres",
    subcategoria: "Alfajores",
    combo: false,
  },
  {
    nombre: "Cheesecake de frutos rojos",
    descripcion: "Base de galleta, relleno cremoso y salsa de frutos rojos.",
    precio: 15900,
    categoria: "Postres",
    subcategoria: "Tortas",
    combo: false,
  },
  {
    nombre: "Bombones artesanales x12",
    descripcion: "Chocolate semiamargo con rellenos surtidos.",
    precio: 9500,
    categoria: "Chocolates",
    subcategoria: "Bombones",
    combo: false,
  },
  {
    nombre: "Cookies con chips x10",
    descripcion: "Galletas crocantes por fuera y tiernas por dentro.",
    precio: 6200,
    categoria: "Galletas",
    subcategoria: "Cookies",
    combo: false,
  },
  {
    nombre: "Combo Merienda Gatuna",
    descripcion: "Cookies, alfajores y bombones en una caja decorada.",
    precio: 18500,
    categoria: "Combos",
    subcategoria: "Cajas",
    combo: true,
  },
];

async function upsertUsuario(
  datos: { email: string; password: string; nombre: string; apellido: string },
  rol: "admin" | "cliente"
): Promise<Usuario> {
  const existente = await Usuario.findOne({
    where: { UsuarioEmail: datos.email },
  });
  if (existente) {
    // Reponemos la contraseña por si quedó de una base anterior.
    await existente.update({
      UsuarioContraseniaHash: hashPassword(datos.password),
      Rol: rol,
      Activo: true,
    });
    console.log(`· usuario ${datos.email} actualizado`);
    return existente;
  }
  const creado = await Usuario.create({
    UsuarioNombre: datos.nombre,
    UsuarioApellido: datos.apellido,
    UsuarioEmail: datos.email,
    UsuarioContraseniaHash: hashPassword(datos.password),
    Rol: rol,
  } as never);
  console.log(`· usuario ${datos.email} creado`);
  return creado;
}

async function seedCatalogo(): Promise<void> {
  const activoId = await prodEstadoId("Activo");

  for (const p of PRODUCTOS) {
    const [categoria] = await Categoria.findOrCreate({
      where: { CatDescripcion: p.categoria },
      defaults: { CatDescripcion: p.categoria } as never,
    });
    const [subcategoria] = await SubCategoria.findOrCreate({
      where: { SubCatDescripcion: p.subcategoria, CatID: categoria.CatID },
      defaults: {
        SubCatDescripcion: p.subcategoria,
        CatID: categoria.CatID,
      } as never,
    });

    const existente = await Producto.findOne({
      where: { ProdNombre: p.nombre },
    });
    if (existente) {
      console.log(`· producto "${p.nombre}" ya existe`);
      continue;
    }
    await Producto.create({
      ProdNombre: p.nombre,
      ProdDescripcion: p.descripcion,
      SubCatID: subcategoria.SubCatID,
      ProdEstadoID: activoId,
      ProdImg: null,
      EsCombo: p.combo,
      ProdPrecio: p.precio,
    } as never);
    console.log(`· producto "${p.nombre}" creado`);
  }
}

/** Ejecuta el seed completo. Reutilizable desde el script y desde la API. */
export async function runSeed(): Promise<{ admin: string; cliente: string }> {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  await ensureEstados();

  await upsertUsuario(ADMIN, "admin");

  const usuarioCliente = await upsertUsuario(CLIENTE, "cliente");
  const [perfil, creado] = await Cliente.findOrCreate({
    where: { UsuarioID: usuarioCliente.UsuarioID },
    defaults: {
      UsuarioID: usuarioCliente.UsuarioID,
      ClienteTelefono: CLIENTE.telefono,
      ClienteDireccion: CLIENTE.direccion,
    } as never,
  });
  if (!creado) {
    await perfil.update({
      ClienteTelefono: CLIENTE.telefono,
      ClienteDireccion: CLIENTE.direccion,
    });
  }

  await seedCatalogo();

  console.log("Seed completado");
  return { admin: ADMIN.email, cliente: CLIENTE.email };
}

// Ejecución directa: `npm run seed`
const ejecutadoDirecto = process.argv[1]?.includes("seed");
if (ejecutadoDirecto) {
  runSeed()
    .then(() => sequelize.close())
    .catch(async (err) => {
      console.error("Error en el seed:", err);
      await sequelize.close().catch(() => undefined);
      process.exit(1);
    });
}
