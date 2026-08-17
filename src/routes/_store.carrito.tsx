import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, MessageSquare } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/cat-loader";
import { seoMeta } from "@/config";

export const Route = createFileRoute("/_store/carrito")({
  head: () => ({ meta: seoMeta("carrito") }),
  component: CarritoPage,
});

function CarritoPage() {
  const { items, total, updateQty, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Tu carrito está vacío"
          description="Todavía no agregaste ningún dulce. ¡El gatito tiene hambre!"
        >
          <Link to="/catalogo" search={{}}>
            <Button size="lg">Ir al catálogo</Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-extrabold md:text-4xl">
        Tu carrito
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.lineId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <Card>
                  <CardContent className="flex gap-4 p-4">
                    <Link
                      to="/producto/$id"
                      params={{ id: String(item.producto.ProdID) }}
                    >
                      <img
                        src={item.producto.ProdImg || "/mascot-cat.png"}
                        alt={item.producto.ProdNombre}
                        className="size-24 rounded-2xl border-2 border-border object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/producto/$id"
                          params={{ id: String(item.producto.ProdID) }}
                          className="font-display font-bold hover:text-primary"
                        >
                          {item.producto.ProdNombre}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Eliminar del carrito"
                          onClick={() => removeItem(item.lineId)}
                        >
                          <Trash2 />
                        </Button>
                      </div>

                      {item.textoPersonalizado ? (
                        <p className="flex items-start gap-1.5 rounded-xl bg-secondary/50 px-3 py-1.5 text-xs italic">
                          <MessageSquare className="mt-0.5 size-3 shrink-0" />
                          {item.textoPersonalizado}
                        </p>
                      ) : null}

                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 rounded-full border-2 border-input p-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Quitar uno"
                            onClick={() =>
                              updateQty(item.lineId, item.cantidad - 1)
                            }
                          >
                            <Minus />
                          </Button>
                          <span className="w-8 text-center font-display font-bold">
                            {item.cantidad}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Agregar uno"
                            onClick={() =>
                              updateQty(item.lineId, item.cantidad + 1)
                            }
                          >
                            <Plus />
                          </Button>
                        </div>
                        <span className="font-display font-extrabold text-primary">
                          {formatCurrency(
                            item.producto.ProdPrecio * item.cantidad,
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </AnimatePresence>
          <Button variant="ghost" onClick={clear} className="self-start">
            <Trash2 /> Vaciar carrito
          </Button>
        </ul>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-lg font-bold">Resumen</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Productos</span>
              <span className="font-semibold">{items.length}</span>
            </div>
            <div className="flex justify-between border-t-2 border-dashed border-border pt-4">
              <span className="font-display font-bold">Total</span>
              <span className="font-display text-xl font-extrabold text-success-foreground">
                {formatCurrency(total)}
              </span>
            </div>
            <Link to="/checkout">
              <Button className="w-full" size="lg">
                Finalizar compra <ArrowRight />
              </Button>
            </Link>
            <Link
              to="/catalogo"
              search={{}}
              className="text-center font-display text-sm font-bold text-muted-foreground hover:text-primary"
            >
              Seguir comprando
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
