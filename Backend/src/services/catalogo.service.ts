import { Op } from "sequelize";
import {
  Categoria,
  SubCategoria,
  Evento,
  ProdEstado,
  PedidoEstado,
  Producto,
  Pedido,
} from "../models/index.js";
import { conflict, notFound } from "../utils/AppError.js";
import { toJSON } from "../utils/serialize.js";
import { requiredId, requiredString } from "../utils/validation.js";

/* ------------------------------- Categorías ------------------------------ */

export async function listCategorias() {
  return toJSON(
    await Categoria.findAll({
      order: [["CatDescripcion", "ASC"]],
      include: [{ model: SubCategoria, as: "subcategorias" }],
    })
  );
}

export async function getCategoria(id: number) {
  const row = await Categoria.findByPk(id, {
    include: [{ model: SubCategoria, as: "subcategorias" }],
  });
  if (!row) throw notFound("Categoría no encontrada");
  return toJSON(row);
}

export async function createCategoria(body: Record<string, unknown>) {
  const CatDescripcion = requiredString(body["CatDescripcion"], "CatDescripcion", 100);
  const existe = await Categoria.findOne({ where: { CatDescripcion } });
  if (existe) throw conflict("Ya existe una categoría con esa descripción");
  return toJSON(await Categoria.create({ CatDescripcion } as never));
}

export async function updateCategoria(id: number, body: Record<string, unknown>) {
  const row = await Categoria.findByPk(id);
  if (!row) throw notFound("Categoría no encontrada");
  const CatDescripcion = requiredString(body["CatDescripcion"], "CatDescripcion", 100);
  const dup = await Categoria.findOne({
    where: { CatDescripcion, CatID: { [Op.ne]: id } },
  });
  if (dup) throw conflict("Ya existe una categoría con esa descripción");
  await row.update({ CatDescripcion });
  return toJSON(row);
}

export async function deleteCategoria(id: number) {
  const row = await Categoria.findByPk(id);
  if (!row) throw notFound("Categoría no encontrada");
  const hijos = await SubCategoria.count({ where: { CatID: id } });
  if (hijos > 0) {
    throw conflict("No se puede eliminar: la categoría tiene subcategorías asociadas");
  }
  await row.destroy();
}

/* ----------------------------- Subcategorías ----------------------------- */
/**
 * La identidad de una subcategoría es el par (CatID, SubCatID). El número
 * reinicia en 1 dentro de cada categoría.
 */

/** Próximo número libre dentro de la categoría. Requiere transacción. */
async function nextSubCatID(CatID: number, transaction: Transaction): Promise<number> {
  const max = (await SubCategoria.max("SubCatID", {
    where: { CatID },
    transaction,
  })) as number | null;
  return (max ?? 0) + 1;
}

export async function listSubCategorias(query: Record<string, unknown>) {
  const where = query["catId"] ? { CatID: requiredId(query["catId"], "catId") } : {};
  return toJSON(
    await SubCategoria.findAll({
      where,
      order: [
        ["CatID", "ASC"],
        ["SubCatID", "ASC"],
      ],
      include: [{ model: Categoria, as: "categoria" }],
    })
  );
}

export async function getSubCategoria(catId: number, subCatId: number) {
  const row = await SubCategoria.findOne({
    where: { CatID: catId, SubCatID: subCatId },
    include: [{ model: Categoria, as: "categoria" }],
  });
  if (!row) throw notFound("Subcategoría no encontrada");
  return toJSON(row);
}

export async function createSubCategoria(body: Record<string, unknown>) {
  const SubCatDescripcion = requiredString(
    body["SubCatDescripcion"],
    "SubCatDescripcion",
    100
  );
  const CatID = requiredId(body["CatID"], "CatID");

  return sequelize.transaction(async (transaction) => {
    // Bloqueamos la categoría para serializar la asignación del número.
    const categoria = await Categoria.findByPk(CatID, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!categoria) throw notFound("La categoría no existe");

    const dup = await SubCategoria.findOne({
      where: { CatID, SubCatDescripcion },
      transaction,
    });
    if (dup) throw conflict("Ya existe una subcategoría con esa descripción en la categoría");

    const SubCatID = await nextSubCatID(CatID, transaction);
    const creada = await SubCategoria.create(
      { CatID, SubCatID, SubCatDescripcion } as never,
      { transaction }
    );
    return toJSON(creada);
  });
}

export async function updateSubCategoria(
  catId: number,
  subCatId: number,
  body: Record<string, unknown>
) {
  const SubCatDescripcion = requiredString(
    body["SubCatDescripcion"],
    "SubCatDescripcion",
    100
  );
  const nuevoCatID = body["CatID"] === undefined ? catId : requiredId(body["CatID"], "CatID");

  return sequelize.transaction(async (transaction) => {
    const row = await SubCategoria.findOne({
      where: { CatID: catId, SubCatID: subCatId },
      transaction,
    });
    if (!row) throw notFound("Subcategoría no encontrada");

    const categoria = await Categoria.findByPk(nuevoCatID, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!categoria) throw notFound("La categoría no existe");

    const dup = await SubCategoria.findOne({
      where: {
        CatID: nuevoCatID,
        SubCatDescripcion,
        [Op.not]: { CatID: catId, SubCatID: subCatId },
      },
      transaction,
    });
    if (dup) throw conflict("Ya existe una subcategoría con esa descripción en la categoría");

    // Mismo padre: sólo cambia la descripción.
    if (nuevoCatID === catId) {
      await row.update({ SubCatDescripcion }, { transaction });
      return toJSON(row);
    }

    // Cambio de categoría: se le asigna un número nuevo en la categoría destino
    // y se reapuntan los productos.
    const nuevoSubCatID = await nextSubCatID(nuevoCatID, transaction);
    const creada = await SubCategoria.create(
      { CatID: nuevoCatID, SubCatID: nuevoSubCatID, SubCatDescripcion } as never,
      { transaction }
    );
    await Producto.update(
      { CatID: nuevoCatID, SubCatID: nuevoSubCatID },
      { where: { CatID: catId, SubCatID: subCatId }, transaction }
    );
    await row.destroy({ transaction });
    return toJSON(creada);
  });
}

export async function deleteSubCategoria(catId: number, subCatId: number) {
  const row = await SubCategoria.findOne({
    where: { CatID: catId, SubCatID: subCatId },
  });
  if (!row) throw notFound("Subcategoría no encontrada");
  const productos = await Producto.count({
    where: { CatID: catId, SubCatID: subCatId },
  });
  if (productos > 0) {
    throw conflict("No se puede eliminar: hay productos asociados a esta subcategoría");
  }
  await row.destroy();
}

/* -------------------------------- Eventos -------------------------------- */

export async function listEventos() {
  return toJSON(await Evento.findAll({ order: [["EventoNombre", "ASC"]] }));
}

export async function getEvento(id: number) {
  const row = await Evento.findByPk(id);
  if (!row) throw notFound("Evento no encontrado");
  return toJSON(row);
}

export async function createEvento(body: Record<string, unknown>) {
  const EventoNombre = requiredString(body["EventoNombre"], "EventoNombre", 100);
  const existe = await Evento.findOne({ where: { EventoNombre } });
  if (existe) throw conflict("Ya existe un evento con ese nombre");
  return toJSON(await Evento.create({ EventoNombre } as never));
}

export async function updateEvento(id: number, body: Record<string, unknown>) {
  const row = await Evento.findByPk(id);
  if (!row) throw notFound("Evento no encontrado");
  await row.update({
    EventoNombre: requiredString(body["EventoNombre"], "EventoNombre", 100),
  });
  return toJSON(row);
}

export async function deleteEvento(id: number) {
  const row = await Evento.findByPk(id);
  if (!row) throw notFound("Evento no encontrado");
  await row.destroy();
}

/* --------------------- Estados (referencia, sólo lectura) ---------------- */

export async function listProdEstados() {
  return toJSON(await ProdEstado.findAll({ order: [["ProdEstadoID", "ASC"]] }));
}

export async function listPedidoEstados() {
  return toJSON(await PedidoEstado.findAll({ order: [["PedidoEstadoID", "ASC"]] }));
}

export async function deletePedidoEstado(id: number) {
  const row = await PedidoEstado.findByPk(id);
  if (!row) throw notFound("Estado de pedido no encontrado");
  const usados = await Pedido.count({ where: { PedidoEstadoID: id } });
  if (usados > 0) {
    throw conflict("No se puede eliminar: hay pedidos con este estado");
  }
  throw conflict("Los estados de pedido son fijos y no pueden eliminarse");
}
