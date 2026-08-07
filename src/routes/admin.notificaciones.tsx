import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { notificationService } from "@/lib/services/clients";
import type { Notificacion } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/notificaciones")({
  component: AdminNotificaciones,
});

const variantes: Record<string, "success" | "warning" | "danger"> = {
  enviado: "success",
  pendiente: "warning",
  fallido: "danger",
};

function AdminNotificaciones() {
  const { data, isLoading } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: notificationService.list,
  });

  const columns: Column<Notificacion>[] = [
    {
      key: "id",
      header: "Notificación",
      render: (n) => (
        <span className="flex items-center gap-2 font-display font-bold">
          <Bell className="size-4 text-primary" /> #{n.NotifID}
        </span>
      ),
    },
    {
      key: "pedido",
      header: "Pedido",
      render: (n) => `#${n.PedidoID}`,
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (n) => formatDateTime(n.NotiFecha),
    },
    {
      key: "estado",
      header: "Estado",
      render: (n) => (
        <Badge variant={variantes[n.NotiEstado] ?? "muted"}>
          {n.NotiEstado}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="Notificaciones"
      description="Avisos generados por los pedidos."
      rows={data ?? []}
      columns={columns}
      loading={isLoading}
      getRowId={(n) => n.NotifID}
      searchFn={(n, q) =>
        n.NotiEstado.includes(q) || String(n.PedidoID).includes(q)
      }
    />
  );
}
