import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productService, type ProductoInput } from "@/lib/services/products";
import {
  subcategoryService,
  prodEstadoService,
  eventoService,
} from "@/lib/services/catalog";
import type { Producto } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cloudinaryUrl } from "@/lib/cloudinary";

export const Route = createFileRoute("/admin/productos")({
  component: AdminProductos,
});

function AdminProductos() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: productos, isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: productService.list,
  });
  const { data: subcats } = useQuery({
    queryKey: ["subcategorias"],
    queryFn: subcategoryService.list,
  });
  const { data: estados } = useQuery({
    queryKey: ["prodEstados"],
    queryFn: prodEstadoService.list,
  });
  const { data: eventos } = useQuery({
    queryKey: ["eventos"],
    queryFn: eventoService.list,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["productos"] });

  const columns: Column<Producto>[] = [
    {
      key: "prod",
      header: "Producto",
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.ProdImg || "/mascot-cat.png"}
            alt=""
            className="size-10 rounded-xl border-2 border-border object-cover"
          />
          <div>
            <p className="font-display font-bold">{p.ProdNombre}</p>
            <p className="text-xs text-muted-foreground">
              {p.subcategoria?.SubCatDescripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "precio",
      header: "Precio",
      render: (p) => (
        <span className="font-semibold">{formatCurrency(p.ProdPrecio)}</span>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (p) =>
        p.EsCombo ? <Badge>Combo</Badge> : <Badge variant="muted">Simple</Badge>,
    },
    {
      key: "eventos",
      header: "Eventos",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {(p.eventos ?? []).map((e) => (
            <Badge key={e.EventoID} variant="secondary">
              {e.EventoNombre}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (p) => (
        <Badge variant={p.ProdEstadoID === 3 ? "danger" : "success"}>
          {p.estado?.ProdEstadoDescripcion}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="Productos"
      description="Gestioná el catálogo, combos y eventos asociados."
      createLabel="Producto"
      rows={productos ?? []}
      columns={columns}
      loading={isLoading}
      getRowId={(p) => p.ProdID}
      searchFn={(p, q) => p.ProdNombre.toLowerCase().includes(q)}
      onDelete={async (p) => {
        await productService.remove(p.ProdID);
        toast("Producto eliminado");
        refresh();
      }}
      renderForm={({ row, close }) => (
        <ProductoForm
          producto={row}
          subcats={subcats ?? []}
          estados={estados ?? []}
          eventos={eventos ?? []}
          productos={productos ?? []}
          onSaved={() => {
            refresh();
            close();
          }}
        />
      )}
    />
  );
}

function ProductoForm({
  producto,
  subcats,
  estados,
  eventos,
  productos,
  onSaved,
}: {
  producto: Producto | null;
  subcats: { SubCatID: number; SubCatDescripcion: string }[];
  estados: { ProdEstadoID: number; ProdEstadoDescripcion: string }[];
  eventos: { EventoID: number; EventoNombre: string }[];
  productos: Producto[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = React.useState<ProductoInput>({
    ProdNombre: producto?.ProdNombre ?? "",
    ProdDescripcion: producto?.ProdDescripcion ?? "",
    SubCatID: producto?.SubCatID ?? subcats[0]?.SubCatID ?? 1,
    ProdEstadoID: producto?.ProdEstadoID ?? estados[0]?.ProdEstadoID ?? 1,
    ProdImg: producto?.ProdImg ?? null,
    ProdImgPublicId: producto?.ProdImgPublicId ?? null,
    EsCombo: producto?.EsCombo ?? false,
    ProdPrecio: producto?.ProdPrecio ?? 0,
    eventoIds: (producto?.eventos ?? []).map((e) => e.EventoID),
    itemIds: (producto?.itemsCombo ?? []).map((p) => p.ProdID),
  });
  const [guardando, setGuardando] = React.useState(false);

  const set = <K extends keyof ProductoInput>(k: K, v: ProductoInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggle = (key: "eventoIds" | "itemIds", id: number) =>
    setForm((f) => {
      const list = f[key] ?? [];
      return {
        ...f,
        [key]: list.includes(id)
          ? list.filter((x) => x !== id)
          : [...list, id],
      };
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (producto) await productService.update(producto.ProdID, form);
      else await productService.create(form);
      toast(producto ? "Producto actualizado" : "Producto creado");
      onSaved();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Nombre">
        <Input
          value={form.ProdNombre}
          onChange={(e) => set("ProdNombre", e.target.value)}
          required
        />
      </Field>
      <Field label="Descripción">
        <Textarea
          value={form.ProdDescripcion ?? ""}
          onChange={(e) => set("ProdDescripcion", e.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Precio">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.ProdPrecio}
            onChange={(e) => set("ProdPrecio", Number(e.target.value))}
          />
        </Field>
        <Field label="Imagen">
          <ImageUploader
            imageUrl={form.ProdImg}
            publicId={form.ProdImgPublicId}
            onChange={(url, publicId) => {
              set("ProdImg", url);
              set("ProdImgPublicId", publicId);
            }}
          />
        </Field>
        <Field label="Subcategoría">
          <Select
            value={form.SubCatID}
            onChange={(e) => set("SubCatID", Number(e.target.value))}
          >
            {subcats.map((s) => (
              <option key={s.SubCatID} value={s.SubCatID}>
                {s.SubCatDescripcion}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Estado">
          <Select
            value={form.ProdEstadoID}
            onChange={(e) => set("ProdEstadoID", Number(e.target.value))}
          >
            {estados.map((s) => (
              <option key={s.ProdEstadoID} value={s.ProdEstadoID}>
                {s.ProdEstadoDescripcion}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Eventos asociados">
        <div className="flex flex-wrap gap-2">
          {eventos.map((ev) => {
            const active = (form.eventoIds ?? []).includes(ev.EventoID);
            return (
              <button
                key={ev.EventoID}
                type="button"
                onClick={() => toggle("eventoIds", ev.EventoID)}
                className={`rounded-full border-2 px-3 py-1 font-display text-xs font-bold ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                {ev.EventoNombre}
              </button>
            );
          })}
        </div>
      </Field>

      <label className="flex cursor-pointer items-center gap-2 font-display text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.EsCombo}
          onChange={(e) => set("EsCombo", e.target.checked)}
          className="size-4 accent-[var(--primary)]"
        />
        Es un combo
      </label>

      {form.EsCombo ? (
        <Field
          label="Productos incluidos"
          hint="Elegí los productos que componen este combo."
        >
          <div className="max-h-44 overflow-y-auto rounded-2xl border-2 border-input p-3">
            {productos
              .filter((p) => !p.EsCombo && p.ProdID !== producto?.ProdID)
              .map((p) => (
                <label
                  key={p.ProdID}
                  className="flex cursor-pointer items-center gap-2 py-1 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={(form.itemIds ?? []).includes(p.ProdID)}
                    onChange={() => toggle("itemIds", p.ProdID)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  {p.ProdNombre}
                </label>
              ))}
          </div>
        </Field>
      ) : null}

      <Button type="submit" disabled={guardando} className="mt-2">
        {guardando ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
