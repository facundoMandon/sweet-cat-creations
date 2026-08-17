import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDays, Package, MessageSquare } from "lucide-react";
import { orderService } from "@/lib/services/orders";
import { useAuth } from "@/context/auth-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CatLoader, EmptyState } from "@/components/cat-loader";
import { ProtectedRoute } from "@/components/protected-route";
import { seoMeta } from "@/config";

export const Route = createFileRoute("/_store/pedidos")({
  head: () => ({ meta: seoMeta("pedidos") }),
  component: () => (
    <ProtectedRoute>
      <MisPedidos />
    </ProtectedRoute>
  ),
});

const estadoVariant: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "danger" | "muted"
> = {
  Pendiente: "warning",
  "En preparación": "default",
  Listo: "secondary",
  Entregado: "success",
  Cancelado: "danger",
};

function MisPedidos() {
  const { usuario } = useAuth();
  const clienteId = usuario?.clienteId ?? 0;

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ["pedidos", "cliente", clienteId],
    queryFn: () => orderService.listByCliente(clienteId),
    enabled: !!clienteId,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-extrabold md:text-4xl">
        Mis pedidos
      </h1>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <CatLoader label="Buscando tus pedidos..." />
        </div>
      ) : !pedidos?.length ? (
        <EmptyState
          title="Todavía no hiciste pedidos"
          description="Cuando compres algo dulce, lo vas a ver acá."
        >
          <Link to="/catalogo" search={{}}>
            <Button>Ir al catálogo</Button>
          </Link>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {pedidos.map((p, i) => (
            <motion.li
              key={p.PedidoID}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold">
                        Pedido #{p.PedidoID}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="size-4" />
                        Entrega: {formatDate(p.PedidoFechaEntrega)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        estadoVariant[
                          p.estado?.PedidoEstadoDescripcion ?? ""
                        ] ?? "muted"
                      }
                    >
                      {p.estado?.PedidoEstadoDescripcion ?? "Sin estado"}
                    </Badge>
                  </div>

                  <ul className="mt-4 flex flex-col gap-3 border-t-2 border-dashed border-border pt-4">
                    {(p.renglones ?? []).map((r) => (
                      <li key={r.ProdPedidoID} className="flex gap-3">
                        <img
                          src={r.producto?.ProdImg || "/mascot-cat.png"}
                          alt=""
                          className="size-14 rounded-xl border-2 border-border object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-sm font-bold">
                            {r.Cantidad}× {r.producto?.ProdNombre}
                          </p>
                          {r.TextoPersonalizado ? (
                            <p className="flex items-start gap-1.5 text-xs italic text-muted-foreground">
                              <MessageSquare className="mt-0.5 size-3 shrink-0" />
                              {r.TextoPersonalizado}
                            </p>
                          ) : null}
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(r.ProdPrecioUnitario * r.Cantidad)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-border pt-4">
                    <span className="flex items-center gap-1.5 font-display text-sm font-bold">
                      <Package className="size-4" /> Total
                    </span>
                    <span className="font-display text-lg font-extrabold text-success-foreground">
                      {formatCurrency(p.PedidoMontoTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
