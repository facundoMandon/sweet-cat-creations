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
        <p className="font-display font-bold">
          {[c.ClienteNombre, c.ClienteApellido].filter(Boolean).join(" ")}
        </p>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (c) => (
        <span className="text-muted-foreground">{c.ClienteEmail ?? "—"}</span>
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
      searchFn={(c, q) =>
        [c.ClienteNombre, c.ClienteApellido, c.ClienteEmail, c.ClienteTelefono]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      }
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
  const esAlta = !cliente;
  const [form, setForm] = React.useState<ClienteInput>({
    ClienteNombre: cliente?.ClienteNombre ?? "",
    ClienteApellido: cliente?.ClienteApellido ?? "",
    ClienteEmail: cliente?.ClienteEmail ?? "",
    password: "",
    ClienteTelefono: cliente?.ClienteTelefono ?? "",
    ClienteDireccion: cliente?.ClienteDireccion ?? "",
  });
  const [error, setError] = React.useState("");
  const [guardando, setGuardando] = React.useState(false);

  const set = (k: keyof ClienteInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validar = (): string | null => {
    if (!form.ClienteNombre.trim()) return "Ingresá el nombre";
    if (!form.ClienteApellido?.trim() || form.ClienteApellido.trim().length > 50)
      return "Ingresá el apellido (máx. 50 caracteres)";
    if (!form.ClienteTelefono.trim()) return "Ingresá el teléfono";
    if (!/^[\d\s+()-]{6,50}$/.test(form.ClienteTelefono.trim()))
      return "El teléfono sólo puede tener números, espacios, + y -";
    if (!form.ClienteDireccion.trim()) return "Ingresá la dirección";
    if (form.ClienteDireccion.trim().length > 250)
      return "La dirección no puede superar los 250 caracteres";
    if (esAlta) {
      if (!form.ClienteEmail?.trim()) return "Ingresá el email";
      if (!(form.password && form.password.length >= 6))
        return "La contraseña debe tener al menos 6 caracteres";
    }
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalido = validar();
    if (invalido) {
      setError(invalido);
      return;
    }
    setError("");
    setGuardando(true);
    try {
      if (cliente) {
        await clientService.update(cliente.ClienteID, {
          ClienteNombre: form.ClienteNombre.trim(),
          ClienteApellido: form.ClienteApellido?.trim() ?? "",
          ClienteTelefono: form.ClienteTelefono.trim(),
          ClienteDireccion: form.ClienteDireccion.trim(),
        });
      } else {
        await clientService.create({
          ClienteNombre: form.ClienteNombre.trim(),
          ClienteApellido: form.ClienteApellido?.trim() ?? "",
          ClienteEmail: form.ClienteEmail?.trim() ?? "",
          password: form.password ?? "",
          ClienteTelefono: form.ClienteTelefono.trim(),
          ClienteDireccion: form.ClienteDireccion.trim(),
        });
      }
      toast(cliente ? "Cliente actualizado" : "Cliente creado");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el cliente");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Nombre">
        <Input value={form.ClienteNombre} onChange={set("ClienteNombre")} />
      </Field>
      <Field label="Apellido">
        <Input
          value={form.ClienteApellido ?? ""}
          maxLength={50}
          onChange={set("ClienteApellido")}
        />
      </Field>
      <Field
        label="Email"
        {...(esAlta ? {} : { hint: "El email de acceso no se puede cambiar desde acá." })}
      >
        <Input
          type="email"
          value={form.ClienteEmail ?? ""}
          onChange={set("ClienteEmail")}
          readOnly={!esAlta}
          disabled={!esAlta}
        />
      </Field>
      {esAlta ? (
        <Field label="Contraseña" hint="Mínimo 6 caracteres.">
          <Input
            type="password"
            value={form.password ?? ""}
            onChange={set("password")}
          />
        </Field>
      ) : null}
      <Field label="Teléfono">
        <Input
          value={form.ClienteTelefono}
          maxLength={50}
          onChange={set("ClienteTelefono")}
        />
      </Field>
      <Field label="Dirección">
        <Input
          value={form.ClienteDireccion}
          maxLength={250}
          onChange={set("ClienteDireccion")}
        />
      </Field>
      {error ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={guardando}>
        {guardando ? "Guardando..." : cliente ? "Guardar cambios" : "Crear cliente"}
      </Button>
    </form>
  );
}
