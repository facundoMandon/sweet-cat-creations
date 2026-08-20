import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  categoryService,
  subcategoryService,
  prodEstadoService,
} from "@/lib/services/catalog";
import type { Categoria, SubCategoria, ProdEstado } from "@/lib/types";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export const Route = createFileRoute("/admin/catalogo")({
  component: AdminCatalogo,
});

type Tab = "categorias" | "subcategorias" | "estados";

function AdminCatalogo() {
  const [tab, setTab] = React.useState<Tab>("categorias");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-fit gap-1 rounded-full bg-muted p-1">
        {(
          [
            ["categorias", "Categorías"],
            ["subcategorias", "Subcategorías"],
            ["estados", "Estados de producto"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-2 font-display text-sm font-bold transition-colors ${
              tab === value
                ? "bg-card text-primary shadow-kawaii"
                : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "categorias" ? <CategoriasTable /> : null}
      {tab === "subcategorias" ? <SubcategoriasTable /> : null}
      {tab === "estados" ? <EstadosTable /> : null}
    </div>
  );
}

function CategoriasTable() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["categorias"],
    queryFn: categoryService.list,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["categorias"] });

  const columns: Column<Categoria>[] = [
    { key: "id", header: "ID", render: (c) => `#${c.CatID}` },
    {
      key: "desc",
      header: "Descripción",
      render: (c) => (
        <span className="font-display font-bold">{c.CatDescripcion}</span>
      ),
    },
  ];

  return (
    <DataTable
      title="Categorías"
      description="Agrupaciones principales del catálogo."
      createLabel="Categoría"
      rows={data ?? []}
      columns={columns}
      loading={isLoading}
      getRowId={(c) => c.CatID}
      searchFn={(c, q) => c.CatDescripcion.toLowerCase().includes(q)}
      onDelete={async (c) => {
        await categoryService.remove(c.CatID);
        toast("Categoría eliminada");
        refresh();
      }}
      renderForm={({ row, close }) => (
        <SimpleForm
          initial={row?.CatDescripcion ?? ""}
          label="Descripción"
          onSubmit={async (value) => {
            if (row)
              await categoryService.update(row.CatID, { CatDescripcion: value });
            else await categoryService.create({ CatDescripcion: value });
            toast("Categoría guardada");
            refresh();
            close();
          }}
        />
      )}
    />
  );
}

function SubcategoriasTable() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filtroCat, setFiltroCat] = React.useState<string>("todas");
  const { data, isLoading } = useQuery({
    queryKey: ["subcategorias"],
    queryFn: subcategoryService.list,
  });
  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: categoryService.list,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["subcategorias"] });

  const rows = React.useMemo(() => {
    const all = data ?? [];
    if (filtroCat === "todas") return all;
    return all.filter((s) => String(s.CatID) === filtroCat);
  }, [data, filtroCat]);

  const columns: Column<SubCategoria>[] = [
    { key: "id", header: "ID", render: (s) => `#${s.SubCatID}` },
    {
      key: "desc",
      header: "Descripción",
      render: (s) => (
        <span className="font-display font-bold">{s.SubCatDescripcion}</span>
      ),
    },
    {
      key: "cat",
      header: "Categoría",
      render: (s) => s.categoria?.CatDescripcion ?? `#${s.CatID}`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full max-w-xs">
        <Field label="Filtrar por categoría">
          <Select
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {(categorias ?? []).map((c) => (
              <option key={c.CatID} value={String(c.CatID)}>
                {c.CatDescripcion}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <DataTable
        title="Subcategorías"
        description="Detalle dentro de cada categoría."
        createLabel="Subcategoría"
        rows={rows}
        columns={columns}
        loading={isLoading}
        getRowId={(s) => s.SubCatID}
        searchFn={(s, q) => s.SubCatDescripcion.toLowerCase().includes(q)}
        onDelete={async (s) => {
          await subcategoryService.remove(s.SubCatID);
          toast("Subcategoría eliminada");
          refresh();
        }}
        renderForm={({ row, close }) => (
          <SubcategoriaForm
            row={row}
            categorias={categorias ?? []}
            onSaved={() => {
              refresh();
              close();
            }}
          />
        )}
      />
    </div>
  );
}


function SubcategoriaForm({
  row,
  categorias,
  onSaved,
}: {
  row: SubCategoria | null;
  categorias: Categoria[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [desc, setDesc] = React.useState(row?.SubCatDescripcion ?? "");
  const [catId, setCatId] = React.useState(
    row?.CatID ?? categorias[0]?.CatID ?? 1,
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const input = { SubCatDescripcion: desc, CatID: catId };
        if (row) await subcategoryService.update(row.SubCatID, input);
        else await subcategoryService.create(input);
        toast("Subcategoría guardada");
        onSaved();
      }}
      className="flex flex-col gap-4"
    >
      <Field label="Descripción">
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} required />
      </Field>
      <Field label="Categoría">
        <Select value={catId} onChange={(e) => setCatId(Number(e.target.value))}>
          {categorias.map((c) => (
            <option key={c.CatID} value={c.CatID}>
              {c.CatDescripcion}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit">Guardar</Button>
    </form>
  );
}

function EstadosTable() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["prodEstados"],
    queryFn: prodEstadoService.list,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["prodEstados"] });

  const columns: Column<ProdEstado>[] = [
    { key: "id", header: "ID", render: (s) => `#${s.ProdEstadoID}` },
    {
      key: "desc",
      header: "Descripción",
      render: (s) => (
        <span className="font-display font-bold">
          {s.ProdEstadoDescripcion}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      title="Estados de producto"
      description="Disponible, agotado, y los que necesites."
      createLabel="Estado"
      rows={data ?? []}
      columns={columns}
      loading={isLoading}
      getRowId={(s) => s.ProdEstadoID}
      searchFn={(s, q) => s.ProdEstadoDescripcion.toLowerCase().includes(q)}
      onDelete={async (s) => {
        await prodEstadoService.remove(s.ProdEstadoID);
        toast("Estado eliminado");
        refresh();
      }}
      renderForm={({ row, close }) => (
        <SimpleForm
          initial={row?.ProdEstadoDescripcion ?? ""}
          label="Descripción"
          onSubmit={async (value) => {
            if (row)
              await prodEstadoService.update(row.ProdEstadoID, {
                ProdEstadoDescripcion: value,
              });
            else
              await prodEstadoService.create({ ProdEstadoDescripcion: value });
            toast("Estado guardado");
            refresh();
            close();
          }}
        />
      )}
    />
  );
}

export function SimpleForm({
  initial,
  label,
  onSubmit,
}: {
  initial: string;
  label: string;
  onSubmit: (value: string) => Promise<void>;
}) {
  const [value, setValue] = React.useState(initial);
  const [guardando, setGuardando] = React.useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
          await onSubmit(value);
        } finally {
          setGuardando(false);
        }
      }}
      className="flex flex-col gap-4"
    >
      <Field label={label}>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </Field>
      <Button type="submit" disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
