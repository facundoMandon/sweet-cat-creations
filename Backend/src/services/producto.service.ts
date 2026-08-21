import { Op, type FindOptions, type WhereOptions } from "sequelize";
import {
  Producto,
  SubCategoria,
  Categoria,
  ProdEstado,
  Evento,
  ProductoPedido,
  Pedido,
} from "../models/index.js";
import { conflict, notFound } from "../utils/AppError.js";
import {
  parsePagination,
  parseSort,
  paginated,
  type Paginated,
} from "../utils/query.js";
import { toJSON } from "../utils/serialize.js";
import {
  estadosVisiblesCatalogo,
  prodEstadoId,
  pedidoEstadoId,
} from "../utils/estados.js";
import {
  optionalBoolean,
  optionalId,
  optionalString,
  requiredBoolean,
  requiredId,
  requiredIdArray,
  requiredPositiveNumber,
  requiredString,
} from "../utils/validation.js";
import { configureCloudinary, cloudinary } from "../config/cloudinary.js";

const SORTS: Record<string, string | string[]> = {
  nombre: "ProdNombre",
  precio: "ProdPrecio",
  fecha: "createdAt",
  id: "ProdID",
};

const includes = () => [
  { model: Categoria, as: "categoria" },
  { model: ProdEstado, as: "estado" },
  { model: Evento, as: "eventos", through: { attributes: [] } },
  {
    model: Producto,
    as: "itemsCombo",
    through: { attributes: [] },
    include: [{ model: ProdEstado, as: "estado" }],
  },
];

interface ProductoJSON extends Record<string, unknown> {
  CatID: number;
  SubCatID: number;
  categoria?: unknown;
}

/**
 * Adjunta la subcategoría a cada producto resolviendo el par (CatID, SubCatID).
 * Sequelize no soporta claves foráneas compuestas en asociaciones, así que la
 * relación se completa acá con una única consulta extra.
 */
async function attachSubcategorias<T>(data: T): Promise<T> {
  const rows = (Array.isArray(data) ? data : [data]) as ProductoJSON[];
  const pares = rows
    .filter((r) => r && r.CatID != null && r.SubCatID != null)
    .map((r) => ({ CatID: r.CatID, SubCatID: r.SubCatID }));
  if (!pares.length) return data;

  const subcats = await SubCategoria.findAll({
    where: { [Op.or]: pares },
    include: [{ model: Categoria, as: "categoria" }],
  });
  const mapa = new Map<string, unknown>();
  for (const s of toJSON<Array<Record<string, unknown>>>(subcats)) {
    mapa.set(`${s["CatID"]}-${s["SubCatID"]}`, s);
  }
  for (const r of rows) {
    r["subcategoria"] = mapa.get(`${r.CatID}-${r.SubCatID}`) ?? null;
  }
  return data;
}

export interface ProductoQuery extends Record<string, unknown> {
  q?: string;
  estadoId?: string;
  catId?: string;
  subCatId?: string;
  eventoId?: string;
  esCombo?: string;
}

/**
 * Listado de productos con filtros, búsqueda, orden y paginación resueltos
 * íntegramente en PostgreSQL.
 * @param soloCatalogo cuando es true excluye los productos Inactivo.
 */
export async function listProductos(
  query: ProductoQuery,
  soloCatalogo: boolean
): Promise<Paginated<unknown>> {
  const page = parsePagination(query);
  const [column, dir] = parseSort(query, SORTS, "nombre");

  const where: WhereOptions = {};
  const and: WhereOptions[] = [];

  const q = optionalString(query.q, "q", 150);
  if (q) and.push({ ProdNombre: { [Op.iLike]: `%${q}%` } });

  const estadoId = optionalId(query.estadoId, "estadoId");
  if (soloCatalogo) {
    const visibles = await estadosVisiblesCatalogo();
    and.push({
      ProdEstadoID: estadoId && visibles.includes(estadoId) ? estadoId : visibles,
    });
  } else if (estadoId) {
    and.push({ ProdEstadoID: estadoId });
  }

  const catId = optionalId(query.catId, "catId");
  if (catId) and.push({ CatID: catId });

  // El número de subcategoría sólo tiene sentido dentro de una categoría.
  const subCatId = optionalId(query.subCatId, "subCatId");
  if (subCatId) and.push({ SubCatID: subCatId });

  const esCombo = optionalBoolean(query.esCombo, "esCombo");
  if (esCombo !== undefined) and.push({ EsCombo: esCombo });

  if (and.length) Object.assign(where, { [Op.and]: and });

  const include = includes().map((inc) => ({ ...inc }));

  const eventoId = optionalId(query.eventoId, "eventoId");
  if (eventoId) {
    (include[2] as Record<string, unknown>)["required"] = true;
    (include[2] as Record<string, unknown>)["where"] = { EventoID: eventoId };
  }

  const options: FindOptions = {
    where,
    include,
    order: [[column as string, dir]],
    limit: page.limit,
    offset: page.offset,
    subQuery: false,
  };

  const { rows, count } = await Producto.findAndCountAll(options);
  const data = await attachSubcategorias(toJSON<unknown[]>(rows));
  return paginated(data, count, page);
}

export async function getProducto(
  id: number,
  soloCatalogo: boolean
): Promise<unknown> {
  const producto = await Producto.findByPk(id, { include: includes() });
  if (!producto) throw notFound("Producto no encontrado");
  if (soloCatalogo) {
    const visibles = await estadosVisiblesCatalogo();
    if (!visibles.includes(producto.ProdEstadoID)) {
      throw notFound("Producto no encontrado");
    }
  }
  return attachSubcategorias(toJSON<Record<string, unknown>>(producto));
}


interface ProductoInput {
  ProdNombre: string;
  ProdDescripcion: string | null;
  SubCatID: number;
  ProdEstadoID: number;
  ProdImg: string | null;
  ProdImgPublicId: string | null;
  EsCombo: boolean;
  ProdPrecio: number;
  eventoIds: number[] | undefined;
  itemIds: number[] | undefined;
}

async function parseProductoInput(body: Record<string, unknown>): Promise<ProductoInput> {
  const input: ProductoInput = {
    ProdNombre: requiredString(body["ProdNombre"], "ProdNombre", 150),
    ProdDescripcion: optionalString(body["ProdDescripcion"], "ProdDescripcion", 2000),
    SubCatID: requiredId(body["SubCatID"], "SubCatID"),
    ProdEstadoID: requiredId(body["ProdEstadoID"], "ProdEstadoID"),
    ProdImg: optionalString(body["ProdImg"], "ProdImg", 500),
    ProdImgPublicId: optionalString(body["ProdImgPublicId"], "ProdImgPublicId", 200),
    EsCombo: requiredBoolean(body["EsCombo"] ?? false, "EsCombo"),
    ProdPrecio: requiredPositiveNumber(body["ProdPrecio"], "ProdPrecio"),
    eventoIds: body["eventoIds"] === undefined
      ? undefined
      : requiredIdArray(body["eventoIds"], "eventoIds"),
    itemIds: body["itemIds"] === undefined
      ? undefined
      : requiredIdArray(body["itemIds"], "itemIds"),
  };

  if (!(await SubCategoria.findByPk(input.SubCatID))) {
    throw notFound("La subcategoría indicada no existe");
  }
  if (!(await ProdEstado.findByPk(input.ProdEstadoID))) {
    throw notFound("El estado de producto indicado no existe");
  }
  if (input.eventoIds?.length) {
    const count = await Evento.count({ where: { EventoID: input.eventoIds } });
    if (count !== new Set(input.eventoIds).size) {
      throw notFound("Alguno de los eventos indicados no existe");
    }
  }
  if (input.EsCombo && input.itemIds?.length) {
    const count = await Producto.count({ where: { ProdID: input.itemIds } });
    if (count !== new Set(input.itemIds).size) {
      throw notFound("Alguno de los productos del combo no existe");
    }
  }
  return input;
}

async function syncRelaciones(producto: Producto, input: ProductoInput) {
  if (input.eventoIds) {
    await (producto as unknown as {
      setEventos: (ids: number[]) => Promise<unknown>;
    }).setEventos(input.eventoIds);
  }
  if (input.EsCombo) {
    if (input.itemIds) {
      await (producto as unknown as {
        setItemsCombo: (ids: number[]) => Promise<unknown>;
      }).setItemsCombo(input.itemIds.filter((i) => i !== producto.ProdID));
    }
  } else {
    await (producto as unknown as {
      setItemsCombo: (ids: number[]) => Promise<unknown>;
    }).setItemsCombo([]);
  }
}

export async function createProducto(
  body: Record<string, unknown>
): Promise<unknown> {
  const input = await parseProductoInput(body);
  const producto = await Producto.create({
    ProdNombre: input.ProdNombre,
    ProdDescripcion: input.ProdDescripcion,
    SubCatID: input.SubCatID,
    ProdEstadoID: input.ProdEstadoID,
    ProdImg: input.ProdImg,
    ProdImgPublicId: input.ProdImgPublicId,
    EsCombo: input.EsCombo,
    ProdPrecio: input.ProdPrecio,
  } as never);
  await syncRelaciones(producto, input);
  return getProducto(producto.ProdID, false);
}

export async function updateProducto(
  id: number,
  body: Record<string, unknown>
): Promise<unknown> {
  const producto = await Producto.findByPk(id);
  if (!producto) throw notFound("Producto no encontrado");
  const input = await parseProductoInput(body);

  const publicIdAnterior = producto.get("ProdImgPublicId") as string | null;
  const nuevoPublicId = input.ProdImgPublicId;

  await producto.update({
    ProdNombre: input.ProdNombre,
    ProdDescripcion: input.ProdDescripcion,
    SubCatID: input.SubCatID,
    ProdEstadoID: input.ProdEstadoID,
    ProdImg: input.ProdImg,
    ProdImgPublicId: nuevoPublicId,
    EsCombo: input.EsCombo,
    ProdPrecio: input.ProdPrecio,
  });

  if (
    publicIdAnterior &&
    publicIdAnterior !== nuevoPublicId &&
    configureCloudinary()
  ) {
    try {
      await cloudinary.uploader.destroy(publicIdAnterior);
    } catch (err) {
      console.error("Cloudinary: error al eliminar imagen anterior", err);
    }
  }

  await syncRelaciones(producto, input);
  return getProducto(id, false);
}

/** Baja lógica: pasa el producto a Inactivo conservando el historial. */
export async function desactivarProducto(id: number): Promise<unknown> {
  const producto = await Producto.findByPk(id);
  if (!producto) throw notFound("Producto no encontrado");
  await producto.update({ ProdEstadoID: await prodEstadoId("Inactivo") });
  return getProducto(id, false);
}

/**
 * Eliminación física. Sólo se permite si el producto no tiene historial de
 * pedidos; en caso contrario se exige la baja lógica.
 */
export async function deleteProducto(id: number): Promise<void> {
  const producto = await Producto.findByPk(id);
  if (!producto) throw notFound("Producto no encontrado");

  const pendienteId = await pedidoEstadoId("Pendiente");
  const enPendientes = await ProductoPedido.count({
    where: { ProdID: id },
    include: [
      {
        model: Pedido,
        as: "pedido",
        required: true,
        where: { PedidoEstadoID: pendienteId },
      },
    ],
  });
  if (enPendientes > 0) {
    throw conflict(
      "No se puede eliminar: el producto forma parte de pedidos pendientes. Usá la baja lógica (Inactivo)."
    );
  }

  const historial = await ProductoPedido.count({ where: { ProdID: id } });
  if (historial > 0) {
    throw conflict(
      "No se puede eliminar físicamente: el producto tiene historial de pedidos. Usá la baja lógica (Inactivo)."
    );
  }

  const publicId = producto.get("ProdImgPublicId") as string | null;
  if (publicId && configureCloudinary()) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Cloudinary: error al eliminar imagen", err);
    }
  }

  await producto.destroy();
}
