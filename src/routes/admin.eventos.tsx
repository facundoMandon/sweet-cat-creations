import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventoService } from "@/lib/services/catalog";
import { productService } from "@/lib/services/products";
import type { Evento } from "@/lib/types";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { SimpleForm } from "./admin.catalogo";
import { useToast } from "@/components/ui/toast";

export const Route = createFileRoute("/admin/eventos")({
  component: AdminEventos,
});

function AdminEventos() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["eventos"],
    queryFn: eventoService.list,
  });
  const { data: productos } = useQuery({
    queryKey: ["productos"],
    queryFn: productService.list,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["eventos"] });

  const columns: Column<Evento>[] = [
    { key: "id", header: "ID", render: (e) => `#${e.EventoID}` },
    {
      key: "nombre",
      header: "Evento",
      render: (e) => (
        <span className="font-display font-bold">{e.EventoNombre}</span>
      ),
    },
    {
      key: "prods",
      header: "Productos asociados",
      render: (e) => (
        <Badge variant="muted">
          {
            (productos ?? []).filter((p) =>
              (p.eventos ?? []).some((x) => x.EventoID === e.EventoID),
            ).length
          }
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="Eventos"
      description="Ocasiones especiales para etiquetar productos."
      createLabel="Evento"
      rows={data ?? []}
      columns={columns}
      loading={isLoading}
      getRowId={(e) => e.EventoID}
      searchFn={(e, q) => e.EventoNombre.toLowerCase().includes(q)}
      onDelete={async (e) => {
        await eventoService.remove(e.EventoID);
        toast("Evento eliminado");
        refresh();
      }}
      renderForm={({ row, close }) => (
        <SimpleForm
          initial={row?.EventoNombre ?? ""}
          label="Nombre del evento"
          onSubmit={async (value) => {
            if (row) await eventoService.update(row.EventoID, { EventoNombre: value });
            else await eventoService.create({ EventoNombre: value });
            toast("Evento guardado");
            refresh();
            close();
          }}
        />
      )}
    />
  );
}
