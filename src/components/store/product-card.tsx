import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Gift, Sparkles, CalendarHeart } from "lucide-react";
import type { Producto } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { Badge } from "@/components/ui/badge";

/** Tarjeta de producto kawaii con microinteracciones. */
export function ProductCard({
  producto,
  index = 0,
}: {
  producto: Producto;
  index?: number;
}) {
  const agotado = producto.ProdEstadoID === 2;
  const proximamente = producto.ProdEstadoID === 3;
  const evento = producto.eventos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      className="h-full"
    >
      <Link
        to="/producto/$id"
        params={{ id: String(producto.ProdID) }}
        className="group block h-full"
      >
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-kawaii"
        >
          <div className="relative aspect-square overflow-hidden bg-accent/40">
            <img
              src={producto.ProdImg || "/mascot-cat.png"}
              alt={producto.ProdNombre}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
              {producto.EsCombo ? (
                <Badge variant="default">
                  <Gift className="size-3" />
                  Combo
                </Badge>
              ) : null}
              {evento ? (
                <Badge variant="secondary">
                  <CalendarHeart className="size-3" />
                  {evento.EventoNombre}
                </Badge>
              ) : null}
              {proximamente ? (
                <Badge variant="warning">
                  <Sparkles className="size-3" />
                  Próximamente
                </Badge>
              ) : null}
              {agotado ? <Badge variant="muted">Agotado</Badge> : null}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            {producto.subcategoria ? (
              <span className="font-display text-xs font-semibold text-primary">
                {producto.subcategoria.SubCatDescripcion}
              </span>
            ) : null}
            <h3 className="font-display text-base font-bold leading-tight text-balance">
              {producto.ProdNombre}
            </h3>
            <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
              {producto.ProdDescripcion}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-display text-lg font-extrabold text-success-foreground">
                {formatCurrency(producto.ProdPrecio)}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 font-display text-xs font-bold text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                Ver más
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
