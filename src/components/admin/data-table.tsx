import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { CatLoader, EmptyState } from "@/components/cat-loader";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

/**
 * Tabla genérica de administración con búsqueda, alta, edición y borrado.
 * El formulario se inyecta como render prop para poder reutilizarla en
 * cualquier entidad del backend.
 */
export function DataTable<T>({
  title,
  description,
  rows,
  columns,
  loading,
  getRowId,
  searchFn,
  onCreate,
  onEdit,
  onDelete,
  renderForm,
  createLabel = "Nuevo",
}: {
  title: string;
  description?: string;
  rows: T[];
  columns: Column<T>[];
  loading?: boolean;
  getRowId: (row: T) => number | string;
  searchFn?: (row: T, query: string) => boolean;
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void | Promise<void>;
  renderForm?: (args: {
    row: T | null;
    close: () => void;
  }) => React.ReactNode;
  createLabel?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<T | null>(null);
  const [deleting, setDeleting] = React.useState<T | null>(null);

  const filtered = query && searchFn ? rows.filter((r) => searchFn(r, query.toLowerCase())) : rows;

  const abrirNuevo = () => {
    setEditing(null);
    if (onCreate) onCreate();
    if (renderForm) setFormOpen(true);
  };

  const abrirEdicion = (row: T) => {
    setEditing(row);
    if (onEdit) onEdit(row);
    if (renderForm) setFormOpen(true);
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {renderForm || onCreate ? (
          <Button onClick={abrirNuevo}>
            <Plus /> {createLabel}
          </Button>
        ) : null}
      </header>

      {searchFn ? (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="pl-9"
            aria-label={`Buscar en ${title}`}
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-4xl border-2 border-border bg-card shadow-kawaii">
        {loading ? (
          <div className="grid place-items-center py-16">
            <CatLoader label="Cargando datos..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10">
            <EmptyState
              title="Sin registros"
              description="Todavía no hay datos para mostrar acá."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/70">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={`px-4 py-3 text-left font-display font-bold ${c.className ?? ""}`}
                    >
                      {c.header}
                    </th>
                  ))}
                  {onDelete || renderForm ? (
                    <th className="px-4 py-3 text-right font-display font-bold">
                      Acciones
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((row) => (
                    <motion.tr
                      key={getRowId(row)}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-border/70 hover:bg-accent/60"
                    >
                      {columns.map((c) => (
                        <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>
                          {c.render(row)}
                        </td>
                      ))}
                      {onDelete || renderForm ? (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            {renderForm ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Editar"
                                onClick={() => abrirEdicion(row)}
                              >
                                <Pencil />
                              </Button>
                            ) : null}
                            {onDelete ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Eliminar"
                                onClick={() => setDeleting(row)}
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {renderForm ? (
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editing ? `Editar ${title.toLowerCase()}` : `Nuevo ${createLabel.toLowerCase()}`}
        >
          {renderForm({ row: editing, close: () => setFormOpen(false) })}
        </Modal>
      ) : null}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="¿Eliminar registro?"
      >
        <p className="text-sm text-muted-foreground">
          Esta acción no se puede deshacer.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (deleting && onDelete) await onDelete(deleting);
              setDeleting(null);
            }}
          >
            <Trash2 /> Eliminar
          </Button>
        </div>
      </Modal>
    </section>
  );
}
