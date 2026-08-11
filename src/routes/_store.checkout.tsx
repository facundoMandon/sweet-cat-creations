import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { orderService } from "@/lib/services/orders";
import { clientService } from "@/lib/services/clients";
import { formatCurrency } from "@/lib/format";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/cat-loader";

export const Route = createFileRoute("/_store/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Black Cats" },
      {
        name: "description",
        content:
          "Confirmá tus datos de entrega y finalizá tu pedido de dulces personalizados.",
      },
      { property: "og:title", content: "Checkout | Black Cats" },
      {
        property: "og:description",
        content: "Confirmá tus datos y finalizá tu pedido en Black Cats.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { usuario, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [nombre, setNombre] = React.useState(usuario?.nombre ?? "");
  const [telefono, setTelefono] = React.useState("");
  const [direccion, setDireccion] = React.useState("");
  const [fecha, setFecha] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);
  const [pedidoId, setPedidoId] = React.useState<number | null>(null);
  const [waLink, setWaLink] = React.useState<string>("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (usuario?.nombre) setNombre((n) => n || usuario.nombre);
  }, [usuario]);

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || !fecha) {
      setError("Completá todos los campos para continuar.");
      return;
    }
    setEnviando(true);
    try {
      let clienteId = usuario?.clienteId;
      if (!clienteId) {
        const cliente = await clientService.create({
          ClienteNombre: nombre,
          ClienteTelefono: telefono,
          ClienteDireccion: direccion,
        });
        clienteId = cliente.ClienteID;
      } else {
        await clientService.update(clienteId, {
          ClienteNombre: nombre,
          ClienteTelefono: telefono,
          ClienteDireccion: direccion,
        });
      }
      const pedido = await orderService.checkout({
        ClienteID: clienteId,
        PedidoFechaEntrega: fecha,
        items,
      });
      const mensaje = buildOrderMessage({
        pedidoId: pedido.PedidoID,
        cliente: nombre.trim(),
        direccion: direccion.trim(),
        fechaEntrega: fecha,
        items,
        total,
      });
      const link = whatsappUrl(mensaje);
      setPedidoId(pedido.PedidoID);
      setWaLink(link);
      clear();
      toast("¡Pedido confirmado! Abriendo WhatsApp...");
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear el pedido");
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-4"
        >
          <span className="grid size-20 place-items-center rounded-full bg-success/20 text-success-foreground">
            <CheckCircle2 className="size-10" />
          </span>
          <h1 className="font-display text-3xl font-extrabold">
            ¡Pedido #{pedidoId} confirmado!
          </h1>
          <p className="text-muted-foreground">
            Te enviamos el detalle por WhatsApp para coordinar la entrega.
            ¡Gracias por elegir Black Cats!{" "}
            <PartyPopper className="inline size-4" />
          </p>
          {waLink ? (
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg">Enviar pedido por WhatsApp</Button>
            </a>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/pedidos">
                <Button>Ver mis pedidos</Button>
              </Link>
            ) : null}
            <Link to="/catalogo" search={{}}>
              <Button variant="secondary">Seguir comprando</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="No hay nada para pagar"
          description="Agregá algún dulce antes de ir al checkout."
        >
          <Link to="/catalogo" search={{}}>
            <Button>Ir al catálogo</Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-extrabold md:text-4xl">
        Finalizar compra
      </h1>

      <form onSubmit={confirmar} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-lg font-bold">Datos de entrega</h2>
            <Field label="Nombre y apellido" htmlFor="nombre">
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Sofía Pérez"
              />
            </Field>
            <Field label="Teléfono" htmlFor="tel">
              <Input
                id="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="11 5555 5555"
              />
            </Field>
            <Field label="Dirección" htmlFor="dir">
              <Input
                id="dir"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Av. Siempreviva 742"
              />
            </Field>
            <Field
              label="Fecha de entrega"
              htmlFor="fecha"
              hint="Preparamos cada pedido con al menos 48hs de anticipación."
            >
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </Field>
            {error ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-lg font-bold">Tu pedido</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {items.map((it) => (
                <li key={it.lineId} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {it.cantidad}× {it.producto.ProdNombre}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(it.producto.ProdPrecio * it.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t-2 border-dashed border-border pt-4">
              <span className="font-display font-bold">Total</span>
              <span className="font-display text-xl font-extrabold text-success-foreground">
                {formatCurrency(total)}
              </span>
            </div>
            <Button type="submit" size="lg" disabled={enviando}>
              {enviando ? "Confirmando..." : "Confirmar pedido"}
            </Button>
            <button
              type="button"
              onClick={() => navigate({ to: "/carrito" })}
              className="font-display text-sm font-bold text-muted-foreground hover:text-primary"
            >
              Volver al carrito
            </button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
