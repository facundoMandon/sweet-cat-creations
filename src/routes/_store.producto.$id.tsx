import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { productService } from "@/lib/services/products";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Textarea } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { CatLoader, EmptyState } from "@/components/cat-loader";
import { ProductCard } from "@/components/store/product-card";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/components/ui/toast";
import { seoMeta } from "@/config";

export const Route = createFileRoute("/_store/producto/$id")({
  head: () => ({ meta: seoMeta("producto") }),
  component: ProductoDetalle,
});

function ProductoDetalle() {
  const { id } = Route.useParams();
  const prodId = Number(id);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [cantidad, setCantidad] = React.useState(1);
  const [texto, setTexto] = React.useState("");

  const { data: producto, isLoading } = useQuery({
    queryKey: ["producto", prodId],
    queryFn: () => productService.get(prodId),
  });
  const { data: todos } = useQuery({
    queryKey: ["productos"],
    queryFn: productService.list,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <CatLoader label="Buscando el dulce..." />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Producto no encontrado"
          description="Puede que ya no esté disponible."
        >
          <Link to="/catalogo" search={{}}>
            <Button variant="secondary">Volver al catálogo</Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const agotado = producto.ProdEstadoID === 3;
  const relacionados = (todos ?? [])
    .filter(
      (p) => p.ProdID !== producto.ProdID && p.SubCatID === producto.SubCatID,
    )
    .slice(0, 4);

  const agregar = (irAlCarrito = false) => {
    addItem(producto, cantidad, texto);
    toast(`${producto.ProdNombre} agregado al carrito`);
    if (irAlCarrito) navigate({ to: "/carrito" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link
        to="/catalogo"
        search={{}}
        className="mb-6 inline-flex items-center gap-2 font-display text-sm font-bold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Volver al catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-4xl border-2 border-border bg-secondary/30 shadow-kawaii"
        >
          <img
            src={producto.ProdImg || "/mascot-cat.png"}
            alt={producto.ProdNombre}
            className="aspect-square w-full object-cover"
          />
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {producto.EsCombo ? (
              <Badge>
                <Gift className="size-3" /> Combo
              </Badge>
            ) : null}
            {agotado ? <Badge variant="danger">Agotado</Badge> : null}
          </div>
        </motion.div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="font-display text-sm font-bold text-muted-foreground">
              {producto.subcategoria?.SubCatDescripcion}
            </p>
            <h1 className="font-display text-3xl font-extrabold md:text-4xl">
              {producto.ProdNombre}
            </h1>
            <p className="mt-2 font-display text-3xl font-extrabold text-primary">
              {formatCurrency(producto.ProdPrecio)}
            </p>
          </div>

          <p className="leading-relaxed text-muted-foreground">
            {producto.ProdDescripcion}
          </p>

          {producto.eventos?.length ? (
            <div className="flex flex-wrap gap-2">
              {producto.eventos.map((e) => (
                <Badge key={e.EventoID} variant="secondary">
                  <Sparkles className="size-3" />
                  {e.EventoNombre}
                </Badge>
              ))}
            </div>
          ) : null}

          {producto.EsCombo && producto.itemsCombo?.length ? (
            <Card className="bg-success/10">
              <CardContent className="p-5">
                <p className="mb-3 font-display font-bold">
                  Este combo incluye
                </p>
                <ul className="flex flex-col gap-3">
                  {producto.itemsCombo.map((item) => (
                    <li key={item.ProdID} className="flex items-center gap-3">
                      <img
                        src={item.ProdImg || "/mascot-cat.png"}
                        alt=""
                        className="size-12 rounded-xl border-2 border-border object-cover"
                      />
                      <Link
                        to="/producto/$id"
                        params={{ id: String(item.ProdID) }}
                        className="flex-1 font-display text-sm font-semibold hover:text-primary"
                      >
                        {item.ProdNombre}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.ProdPrecio)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Field
            label="Texto personalizado"
            hint="Dedicatoria o pedido especial (máx. 200 caracteres)."
          >
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={200}
              placeholder="Ej: ¡Feliz cumple, Sofi! 🖤"
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border-2 border-input bg-card p-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Quitar uno"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              >
                <Minus />
              </Button>
              <span className="w-10 text-center font-display font-bold">
                {cantidad}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Agregar uno"
                onClick={() => setCantidad((c) => c + 1)}
              >
                <Plus />
              </Button>
            </div>
            <Button
              size="lg"
              disabled={agotado}
              onClick={() => agregar(false)}
              className="flex-1"
            >
              <ShoppingBag />
              {agotado ? "Sin stock" : "Agregar al carrito"}
            </Button>
            <Button
              size="lg"
              variant="success"
              disabled={agotado}
              onClick={() => agregar(true)}
            >
              Comprar ahora
            </Button>
          </div>
        </div>
      </div>

      {relacionados.length ? (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-2xl font-bold">
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relacionados.map((p, i) => (
              <ProductCard key={p.ProdID} producto={p} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
