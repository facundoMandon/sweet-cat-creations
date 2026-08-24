import { Categoria } from "./Categoria.js";
import { SubCategoria } from "./SubCategoria.js";
import { ProdEstado } from "./ProdEstado.js";
import { Evento } from "./Evento.js";
import { Producto } from "./Producto.js";
import { ProductoCombo } from "./ProductoCombo.js";
import { ProdEvento } from "./ProdEvento.js";
import { Usuario } from "./Usuario.js";
import { Cliente } from "./Cliente.js";
import { PedidoEstado } from "./PedidoEstado.js";
import { Pedido } from "./Pedido.js";
import { ProductoPedido } from "./ProductoPedido.js";
import { Notificacion } from "./Notificacion.js";
import { PasswordReset } from "./PasswordReset.js";

// =========================
// Usuario - Cliente (1:1)
// =========================

Usuario.hasOne(Cliente, {
  foreignKey: "UsuarioID",
  as: "cliente",
  onDelete: "CASCADE",
});

Cliente.belongsTo(Usuario, {
  foreignKey: "UsuarioID",
  as: "usuario",
});


// =========================
// Categoria - SubCategoria
// =========================

Categoria.hasMany(SubCategoria, {
  foreignKey: "CatID",
  as: "subcategorias",
});

SubCategoria.belongsTo(Categoria, {
  foreignKey: "CatID",
  as: "categoria",
});

// =========================
// Categoria - Producto
// =========================
// La subcategoría de un producto se identifica por el par (CatID, SubCatID).
// Sequelize no soporta claves foráneas compuestas en asociaciones, por lo que
// el producto se asocia a la categoría y la subcategoría se resuelve en el
// servicio a partir del par.

Categoria.hasMany(Producto, {
  foreignKey: "CatID",
  as: "productos",
});

Producto.belongsTo(Categoria, {
  foreignKey: "CatID",
  as: "categoria",
});

// =========================
// ProdEstado - Producto
// =========================

ProdEstado.hasMany(Producto, {
  foreignKey: "ProdEstadoID",
  as: "productos",
});

Producto.belongsTo(ProdEstado, {
  foreignKey: "ProdEstadoID",
  as: "estado",
});

// =========================
// Producto - Evento
// =========================

Producto.belongsToMany(Evento, {
  through: ProdEvento,
  foreignKey: "ProdID",
  otherKey: "EventoID",
  as: "eventos",
});

Evento.belongsToMany(Producto, {
  through: ProdEvento,
  foreignKey: "EventoID",
  otherKey: "ProdID",
  as: "productos",
});

// =========================
// Producto - Combo
// =========================

// Producto que funciona como combo
Producto.belongsToMany(Producto, {
  through: ProductoCombo,
  as: "itemsCombo",
  foreignKey: "ComboProdID",
  otherKey: "ItemProdID",
});

// Producto que forma parte de combos
Producto.belongsToMany(Producto, {
  through: ProductoCombo,
  as: "combos",
  foreignKey: "ItemProdID",
  otherKey: "ComboProdID",
});

// =========================
// Cliente - Pedido
// =========================

Cliente.hasMany(Pedido, {
  foreignKey: "ClienteID",
  as: "pedidos",
});

Pedido.belongsTo(Cliente, {
  foreignKey: "ClienteID",
  as: "cliente",
});

// =========================
// PedidoEstado - Pedido
// =========================

PedidoEstado.hasMany(Pedido, {
  foreignKey: "PedidoEstadoID",
  as: "pedidos",
});

Pedido.belongsTo(PedidoEstado, {
  foreignKey: "PedidoEstadoID",
  as: "estado",
});

// =========================
// Pedido - ProductoPedido
// =========================

Pedido.hasMany(ProductoPedido, {
  foreignKey: "PedidoID",
  as: "renglones",
  onDelete: "CASCADE",
});

ProductoPedido.belongsTo(Pedido, {
  foreignKey: "PedidoID",
  as: "pedido",
});

// =========================
// Producto - ProductoPedido
// =========================

Producto.hasMany(ProductoPedido, {
  foreignKey: "ProdID",
  as: "renglonesPedido",
});

ProductoPedido.belongsTo(Producto, {
  foreignKey: "ProdID",
  as: "producto",
});

// =========================
// Pedido - Notificacion
// =========================

Pedido.hasMany(Notificacion, {
  foreignKey: "PedidoID",
  as: "notificaciones",
});

Notificacion.belongsTo(Pedido, {
  foreignKey: "PedidoID",
  as: "pedido",
});

// =========================
// Usuario - PasswordReset
// =========================

Usuario.hasMany(PasswordReset, {
  foreignKey: "UsuarioID",
  as: "passwordResets",
  onDelete: "CASCADE",
});

PasswordReset.belongsTo(Usuario, {
  foreignKey: "UsuarioID",
  as: "usuario",
});

export {
  Categoria,
  SubCategoria,
  ProdEstado,
  Evento,
  Producto,
  ProductoCombo,
  ProdEvento,
  Usuario,
  Cliente,
  PedidoEstado,
  Pedido,
  ProductoPedido,
  Notificacion,
  PasswordReset,
};