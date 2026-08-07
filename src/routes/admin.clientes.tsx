import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientService, type ClienteInput } from "@/lib/services/clients";
import { orderService } from "@/lib/services/orders";
import type { Cliente } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export const Route = createFileRoute("/admin/clientes")({
  component: AdminClientes,
});

function AdminClientes() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: clientService.list,
  });
  const { data: pedidos } = useQuery({
    queryKey: ["pedidos"],
    queryFn: orderService.list,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["clientes"] });

  const resumen = (id: number) => {
    const propios = (pedidos ?? []).filter((p) => p.ClienteID === id);
    return {
      cantidad: propios.length,
      total: propios.reduce((s, p) => s + p.PedidoMontoTotal, 0),
    };
  };

  const columns: Column<Cliente>[] = [
    {
      key: "nombre",
      header: "Cliente",
      render: (c) => (
        <p className="font-display font-bold">{c.ClienteNombre}</p>
      ),
    },
    {
      key: "tel",
      header: "Teléfono",
      render: (c) => c.ClienteTelefono ?? "—",
    },
    {
      key: "dir",
      header: "Dirección",
      render: (c) => (
        <span className="text-muted-foreground">{c.ClienteDireccion ?? "—"}</span>
      ),
    },
    {
      key: "pedidos",
      header: "Pedidos",
      render: (c) => <Badge variant="muted">{resumen(c.ClienteID).cantidad}</Badge>,
    },
    {
      key: "total",
      header: "Total gastado",
      render: (c) => (
        <span className="font-semibold">
          {formatCurrency(resumen(c.ClienteID).total)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      title="Clientes"
      description="Base de clientes y su histórico de compras."
      createLabel="Cliente"
      rows={clientes ?? []}
      columns={columns}
      loading={isLoading}
      getRowId={(c) => c.ClienteID}
      searchFn={(c, q) => c.ClienteNombre.toLowerCase().includes(q)}
      onDelete={async (c) => {
        await clientService.remove(c.ClienteID);
        toast("Cliente eliminado");
        refresh();
      }}
      renderForm={({ row, close }) => (
        <ClienteForm
          cliente={row}
          onSaved={() => {
            refresh();
            close();
          }}
        />
      )}
    />
  );
}

function ClienteForm({
  cliente,
  onSaved,
}: {
  cliente: Cliente | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = React.useState<ClienteInput>({
    ClienteNombre: cliente?.ClienteNombre ?? "",
    ClienteTelefono: cliente?.ClienteTelefono ?? "",
    ClienteDireccion: cliente?.ClienteDireccion ?? "",
  });
  const [guardando, setGuardando] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (cliente) await clientService.update(cliente.ClienteID, form);
      else await clientService.create(form);
      toast(cliente ? "Cliente actualizado" : "Cliente creado");
      onSaved();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Nombre">
        <Input
          value={form.ClienteNombre}
          onChange={(e) =>
            setForm((f) => ({ ...f, ClienteNombre: e.target.value }))
          }
          required
        />
      </Field>
      <Field label="Teléfono">
        <Input
          value={form.ClienteTelefono ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, ClienteTelefono: e.target.value }))
          }
        />
      </Field>
      <Field label="Dirección">
        <Input
          value={form.ClienteDireccion ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, ClienteDireccion: e.target.value }))
          }
        />
      </Field>
      <Button type="submit" disabled={guardando}>
        {guardando ? "Guardando..." : cliente ? "Guardar cambios" : "Crear cliente"}
      </Button>
    </form>
  );
}
