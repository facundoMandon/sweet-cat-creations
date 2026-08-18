import * as React from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Gift } from "lucide-react";
import type { Producto } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/components/ui/toast";

/** Modal animado que captura cantidad y TextoPersonalizado. */
export function AddToCartModal({
  producto,
  open,
  onClose,
}: {
  producto: Producto | null;
  open: boolean;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [cantidad, setCantidad] = React.useState(1);
  const [texto, setTexto] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setCantidad(1);
      setTexto("");
    }
  }, [open, producto?.ProdID]);

  if (!producto) return null;

  const agregar = () => {
    addItem(producto, cantidad, texto);
    toast(`${producto.ProdNombre} agregado al carrito`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Agregar al carrito">
      <div className="flex gap-4">
        <img
          src={cloudinaryUrl(producto.ProdImgPublicId, producto.ProdImg, "card", "/mascot-cat.png")}
          alt={producto.ProdNombre}
          className="size-24 shrink-0 rounded-2xl border-2 border-border object-cover"
        />
        <div className="min-w-0">
          <h3 className="font-display font-bold">{producto.ProdNombre}</h3>
          <p className="font-display text-lg font-extrabold text-primary">
            {formatCurrency(producto.ProdPrecio)}
          </p>
          {producto.EsCombo ? (
            <Badge variant="default" className="mt-1">
              <Gift className="size-3" />
              Combo
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <span className="mb-1.5 block font-display text-sm font-semibold">
            Cantidad
          </span>
          <div className="flex w-fit items-center gap-1 rounded-full border-2 border-input bg-card p-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Quitar uno"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            >
              <Minus />
            </Button>
            <span className="w-10 text-center font-display font-bold">
              {cantidad}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Agregar uno"
              onClick={() => setCantidad((c) => c + 1)}
            >
              <Plus />
            </Button>
          </div>
        </div>

        <Field
          label="Texto personalizado"
          hint="Dedicatoria, colores del chocolate o cualquier detalle especial (opcional)."
        >
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: Feliz cumple Mica, con chocolate blanco 🤍"
            maxLength={200}
          />
        </Field>

        <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
          <span className="font-display text-sm font-semibold">Subtotal</span>
          <span className="font-display text-lg font-extrabold text-success-foreground">
            {formatCurrency(producto.ProdPrecio * cantidad)}
          </span>
        </div>

        <motion.div whileTap={{ scale: 0.97 }}>
          <Button className="w-full" size="lg" onClick={agregar}>
            <ShoppingBag />
            Agregar al carrito
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}
