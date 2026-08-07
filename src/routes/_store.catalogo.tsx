import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { productService } from "@/lib/services/products";
import {
  categoryService,
  subcategoryService,
  eventoService,
} from "@/lib/services/catalog";
import { ProductCard } from "@/components/store/product-card";
import { CatLoader, EmptyState } from "@/components/cat-loader";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

interface CatalogoSearch {
  q?: string;
  cat?: number;
  sub?: number;
  evento?: number;
  combo?: boolean;
}

export const Route = createFileRoute("/_store/catalogo")({
  validateSearch: (search: Record<string, unknown>): CatalogoSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    cat: search["cat"] != null ? Number(search["cat"]) : undefined,
    sub: search["sub"] != null ? Number(search["sub"]) : undefined,
    evento: search["evento"] != null ? Number(search["evento"]) : undefined,
    combo: search["combo"] ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catálogo de dulces | Black Cats" },
      {
        name: "description",
        content:
          "Explorá chocolates, postres, combos y opciones saladas. Filtrá por categoría, evento y precio.",
      },
      { property: "og:title", content: "Catálogo de dulces | Black Cats" },
      {
        property: "og:description",
        content:
          "Explorá chocolates, postres, combos y opciones saladas de Black Cats.",
      },
    ],
  }),
  component: CatalogoPage,
});

function CatalogoPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogo" });
  const [filtrosAbiertos, setFiltrosAbiertos] = React.useState(false);
  const [orden, setOrden] = React.useState("relevancia");
  const [texto, setTexto] = React.useState(search.q ?? "");

  React.useEffect(() => setTexto(search.q ?? ""), [search.q]);

  const { data: productos, isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: productService.list,
  });
  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: categoryService.list,
  });
  const { data: subcategorias } = useQuery({
    queryKey: ["subcategorias"],
    queryFn: subcategoryService.list,
  });
  const { data: eventos } = useQuery({
    queryKey: ["eventos"],
    queryFn: eventoService.list,
  });

  const setFiltro = (patch: Partial<CatalogoSearch>) => {
    navigate({ search: (prev) => ({ ...prev, ...patch }) });
  };

  const limpiar = () => navigate({ search: {} });

  const filtrados = React.useMemo(() => {
    let list = [...(productos ?? [])];
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.ProdNombre.toLowerCase().includes(q) ||
          (p.ProdDescripcion ?? "").toLowerCase().includes(q),
      );
    }
    if (search.sub) list = list.filter((p) => p.SubCatID === search.sub);
    else if (search.cat)
      list = list.filter((p) => p.subcategoria?.CatID === search.cat);
    if (search.evento)
      list = list.filter((p) =>
        (p.eventos ?? []).some((e) => e.EventoID === search.evento),
      );
    if (search.combo) list = list.filter((p) => p.EsCombo);
    if (orden === "precio-asc")
      list.sort((a, b) => a.ProdPrecio - b.ProdPrecio);
    if (orden === "precio-desc")
      list.sort((a, b) => b.ProdPrecio - a.ProdPrecio);
    if (orden === "nombre")
      list.sort((a, b) => a.ProdNombre.localeCompare(b.ProdNombre));
    return list;
  }, [productos, search, orden]);

  const subsDeCategoria = (subcategorias ?? []).filter((s) =>
    search.cat ? s.CatID === search.cat : true,
  );

  const hayFiltros =
    !!search.q || !!search.cat || !!search.sub || !!search.evento || !!search.combo;

  const Filtros = (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-display text-sm font-bold">Buscar</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFiltro({ q: texto || undefined });
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Chocolate, macarons..."
            className="pl-9"
            aria-label="Buscar productos"
          />
        </form>
      </div>

      <div>
        <p className="mb-2 font-display text-sm font-bold">Categoría</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltro({ cat: undefined, sub: undefined })}
            className={chip(!search.cat)}
          >
            Todas
          </button>
          {(categorias ?? []).map((c) => (
            <button
              key={c.CatID}
              onClick={() => setFiltro({ cat: c.CatID, sub: undefined })}
              className={chip(search.cat === c.CatID)}
            >
              {c.CatDescripcion}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-display text-sm font-bold">Subcategoría</p>
        <div className="flex flex-wrap gap-2">
          {subsDeCategoria.map((s) => (
            <button
              key={s.SubCatID}
              onClick={() =>
                setFiltro({
                  sub: search.sub === s.SubCatID ? undefined : s.SubCatID,
                })
              }
              className={chip(search.sub === s.SubCatID)}
            >
              {s.SubCatDescripcion}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-display text-sm font-bold">Evento</p>
        <div className="flex flex-wrap gap-2">
          {(eventos ?? []).map((e) => (
            <button
              key={e.EventoID}
              onClick={() =>
                setFiltro({
                  evento: search.evento === e.EventoID ? undefined : e.EventoID,
                })
              }
              className={chip(search.evento === e.EventoID)}
            >
              {e.EventoNombre}
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 font-display text-sm font-semibold">
        <input
          type="checkbox"
          checked={!!search.combo}
          onChange={(e) => setFiltro({ combo: e.target.checked || undefined })}
          className="size-4 accent-[var(--primary)]"
        />
        Solo combos
      </label>

      {hayFiltros ? (
        <Button variant="ghost" onClick={limpiar}>
          <X /> Limpiar filtros
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">
          Catálogo
        </h1>
        <p className="mt-1 text-muted-foreground">
          {filtrados.length} producto{filtrados.length === 1 ? "" : "s"}{" "}
          disponible{filtrados.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mb-4 flex items-center gap-3 lg:hidden">
        <Button
          variant="outline"
          onClick={() => setFiltrosAbiertos((v) => !v)}
          className="flex-1"
        >
          <SlidersHorizontal /> Filtros
        </Button>
        <Select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          aria-label="Ordenar"
          className="flex-1"
        >
          <option value="relevancia">Relevancia</option>
          <option value="precio-asc">Precio: menor</option>
          <option value="precio-desc">Precio: mayor</option>
          <option value="nombre">Nombre</option>
        </Select>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside
          className={`${filtrosAbiertos ? "block" : "hidden"} h-fit rounded-4xl border-2 border-border bg-card p-5 shadow-kawaii lg:sticky lg:top-24 lg:block`}
        >
          {Filtros}
        </aside>

        <div>
          <div className="mb-4 hidden justify-end lg:flex">
            <Select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              aria-label="Ordenar"
              className="w-56"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
            </Select>
          </div>

          {hayFiltros ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {search.q ? <Badge variant="muted">"{search.q}"</Badge> : null}
              {search.combo ? <Badge>Combos</Badge> : null}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid place-items-center py-20">
              <CatLoader label="Buscando dulces..." />
            </div>
          ) : filtrados.length === 0 ? (
            <EmptyState
              title="No encontramos dulces"
              description="Probá cambiando los filtros o buscando otra cosa."
              action={
                <Button variant="secondary" onClick={limpiar}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {filtrados.map((p, i) => (
                <ProductCard key={p.ProdID} producto={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full border-2 px-3 py-1 font-display text-xs font-bold transition-colors ${
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card hover:border-primary hover:text-primary"
  }`;
}
