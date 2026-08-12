import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  ClipboardList,
  Users,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import { orderService } from "@/lib/services/orders";
import { productService } from "@/lib/services/products";
import { clientService } from "@/lib/services/clients";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CatLoader } from "@/components/cat-loader";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: pedidos, isLoading } = useQuery({
    queryKey: ["pedidos"],
    queryFn: orderService.list,
  });
  const { data: productos } = useQuery({
    queryKey: ["productos"],
    queryFn: productService.list,
  });
  const { data: clientes } = useQuery({
    queryKey: ["clientes"],
    queryFn: clientService.list,
  });

  const facturado = (pedidos ?? []).reduce(
    (s, p) => s + p.PedidoMontoTotal,
    0,
  );
  const pendientes = (pedidos ?? []).filter((p) => p.PedidoEstadoID === 1);

  // --- Nuevo: pedidos del mes actual (por fecha de entrega) ---
const hoy = new Date();
const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

const pedidosDelMes = (pedidos ?? []).filter((p) => {
  const fechaEntrega = new Date(p.PedidoFechaEntrega);
  return fechaEntrega >= inicioMes && fechaEntrega <= finMes;
});

const nombreMes = hoy.toLocaleDateString("es-ES", { month: "long" });
const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  const stats = [
    {
      label: "Ingresos",
      value: formatCurrency(facturado),
      icon: DollarSign,
      tone: "bg-success/20 text-success-foreground",
    },
    {
      label: "Pedidos de " + nombreMesCapitalizado, //Pedidos del mes actual
      value: String(pedidosDelMes.length),
      icon: ClipboardList,
      tone: "bg-primary/15 text-primary",
    },
    {
      label: "Productos",
      value: String(productos?.length ?? 0),
      icon: Package,
      tone: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Clientes",
      value: String(clientes?.length ?? 0),
      icon: Users,
      tone: "bg-chart-4/25 text-[#8a5a00]",
    },
  ];

  const ultimos = [...(pedidos ?? [])]
    .sort((a, b) => b.PedidoID - a.PedidoID)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <CatLoader label="Calculando métricas..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen de la operación de Black Cats.
          </p>
        </div>
        <Link
          to="/admin/calendario"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 font-display text-sm font-bold text-primary-foreground"
        >
          <CalendarDays className="size-4" /> Calendario de pedidos
        </Link>
      </header>


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
                  <Icon className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {label}
                  </p>
                  <p className="font-display text-xl font-extrabold">{value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Últimos pedidos</h2>
              <Link
                to="/admin/pedidos"
                className="inline-flex items-center gap-1 font-display text-sm font-bold text-primary hover:underline"
              >
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="flex flex-col divide-y divide-border">
              {ultimos.map((p) => (
                <li
                  key={p.PedidoID}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-display text-sm font-bold">
                      #{p.PedidoID} · {p.cliente?.ClienteNombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Entrega {formatDate(p.PedidoFechaEntrega)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold">
                      {formatCurrency(p.PedidoMontoTotal)}
                    </p>
                    <Badge variant="muted">
                      {p.estado?.PedidoEstadoDescripcion}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display text-lg font-bold">
              Pendientes de preparar
            </h2>
            {pendientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay pedidos pendientes. ¡Todo al día!
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pendientes.map((p) => (
                  <li
                    key={p.PedidoID}
                    className="flex items-center justify-between rounded-2xl bg-chart-4/15 px-4 py-2.5"
                  >
                    <span className="font-display text-sm font-bold">
                      #{p.PedidoID} · {p.cliente?.ClienteNombre}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(p.PedidoMontoTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
