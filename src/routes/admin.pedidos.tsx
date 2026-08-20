import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, MessageSquare, Navigation } from "lucide-react";
import { orderService, pedidoEstadoService } from "@/lib/services/orders";
import type { Pedido } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  syncPedidoRecordatorios,
  deletePedidoRecordatorios,
} from "@/lib/calendar.functions";
import { useToast } from "@/components/ui/toast";
import { mapsDirectionsUrl, mapsEmbedUrl, tieneCoordenadas } from "@/lib/maps";

/** Ubicación de entrega del pedido, con fallback a la del perfil. */
function ubicacionDePedido(p: Pedido) {
  return {
    direccion: p.PedidoDireccion || p.cliente?.ClienteDireccion || "",
    lat: p.PedidoLat ?? p.cliente?.ClienteLat ?? null,
    lng: p.PedidoLng ?? p.cliente?.ClienteLng ?? null,
    placeId: p.PedidoPlaceID ?? p.cliente?.ClientePlaceID ?? null,
    referencias: p.PedidoReferencias ?? null,
  };
}

export const Route = createFileRoute("/admin/pedidos")({
  component: AdminPedidos,
});

function AdminPedidos() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [detalle, setDetalle] = React.useState<Pedido | null>(null);
  const syncCalendar = useServerFn(syncPedidoRecordatorios);
  const borrarCalendar = useServerFn(deletePedidoRecordatorios);

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ["pedidos"],
    queryFn: orderService.list,
  });
  const { data: estados } = useQuery({
    queryKey: ["pedidoEstados"],
    queryFn: pedidoEstadoService.list,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["pedidos"] });

  const cambiarEstado = async (pedido: Pedido, estadoId: number) => {
    await orderService.updateEstado(pedido.PedidoID, estadoId);
    const desc = (estados ?? [])
      .find((e) => e.PedidoEstadoID === estadoId)
      ?.PedidoEstadoDescripcion.toLowerCase() ?? "";
    const cancelado = desc.includes("cancel");
    // Mantiene sincronizados los recordatorios de Google Calendar
    await syncCalendar({
      data: {
        pedidoId: pedido.PedidoID,
        clienteNombre: pedido.cliente?.ClienteNombre ?? "Cliente",
        fechaEntrega: pedido.PedidoFechaEntrega,
        direccion: ubicacionDePedido(pedido).direccion || null,
        lat: ubicacionDePedido(pedido).lat ?? null,
        lng: ubicacionDePedido(pedido).lng ?? null,
        cancelado,
      },
    }).catch(() => undefined);
    qc.invalidateQueries({ queryKey: ["calendarEventos"] });
    toast(
      cancelado
        ? `Pedido #${pedido.PedidoID} cancelado - recordatorios eliminados`
        : `Pedido #${pedido.PedidoID} actualizado`,
    );
    refresh();
  };

  const columns: Column<Pedido>[] = [
    {
      key: "id",
      header: "Pedido",
      render: (p) => (
        <button
          onClick={() => setDetalle(p)}
          className="font-display font-bold text-primary hover:underline"
        >
          #{p.PedidoID}
        </button>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (p) => (
        <span className="font-semibold">
          {[p.cliente?.ClienteNombre, p.cliente?.ClienteApellido]
            .filter(Boolean)
            .join(" ") || "—"}
        </span>
      ),
    },
    {
      key: "telefono",
      header: "Teléfono",
      render: (p) => (
        <span className="text-sm text-muted-foreground">
          {p.cliente?.ClienteTelefono || "—"}
        </span>
      ),
    },

    {
      key: "entrega",
      header: "Entrega",
      render: (p) => {
        const u = ubicacionDePedido(p);
        return (
          <div className="flex flex-col items-start gap-1">
            <span>{formatDate(p.PedidoFechaEntrega)}</span>
            {u.direccion ? (
              <a
                href={mapsDirectionsUrl(u)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Navigation className="size-3" /> Cómo llegar
              </a>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "items",
      header: "Productos",
      render: (p) => (
        <Badge variant="muted">{(p.renglones ?? []).length} ítems</Badge>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (p) => (
        <span className="font-display font-bold">
          {formatCurrency(p.PedidoMontoTotal)}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (p) => (
        <Select
          value={p.PedidoEstadoID}
          onChange={(e) => cambiarEstado(p, Number(e.target.value))}
          aria-label={`Estado del pedido ${p.PedidoID}`}
          className="w-44"
        >
          {(estados ?? []).map((e) => (
            <option key={e.PedidoEstadoID} value={e.PedidoEstadoID}>
              {e.PedidoEstadoDescripcion}
            </option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Pedidos"
        description="Seguimiento de pedidos y cambio de estado."
        rows={pedidos ?? []}
        columns={columns}
        loading={isLoading}
        getRowId={(p) => p.PedidoID}
        searchFn={(p, q) =>
          String(p.PedidoID).includes(q) ||
          (p.cliente?.ClienteNombre ?? "").toLowerCase().includes(q)
        }
        onDelete={async (p) => {
          await orderService.remove(p.PedidoID);
          await borrarCalendar({ data: { pedidoId: p.PedidoID } }).catch(
            () => undefined,
          );
          qc.invalidateQueries({ queryKey: ["calendarEventos"] });
          toast("Pedido eliminado");
          refresh();
        }}
      />

      <Modal
        open={!!detalle}
        onClose={() => setDetalle(null)}
        title={`Pedido #${detalle?.PedidoID ?? ""}`}
      >
        {detalle ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-muted p-4 text-sm">
              <p className="font-display font-bold">
                {detalle.cliente?.ClienteNombre}
              </p>
              <p className="flex items-start gap-1.5 text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                {ubicacionDePedido(detalle).direccion || "Sin dirección"}
              </p>
              {ubicacionDePedido(detalle).referencias ? (
                <p className="text-muted-foreground">
                  Referencias: {ubicacionDePedido(detalle).referencias}
                </p>
              ) : null}
              <p className="text-muted-foreground">
                Entrega: {formatDate(detalle.PedidoFechaEntrega)}
              </p>
            </div>

            {(() => {
              const u = ubicacionDePedido(detalle);
              const embed = mapsEmbedUrl(u);
              if (!u.direccion && !tieneCoordenadas(u)) return null;
              return (
                <div className="flex flex-col gap-2">
                  {embed ? (
                    <iframe
                      title={`Ubicación del pedido ${detalle.PedidoID}`}
                      src={embed}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-48 w-full rounded-2xl border-2 border-border"
                    />
                  ) : null}
                  <a href={mapsDirectionsUrl(u)} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" type="button">
                      <Navigation className="size-4" /> Cómo llegar con Google Maps
                    </Button>
                  </a>
                </div>
              );
            })()}
            <ul className="flex flex-col gap-3">
              {(detalle.renglones ?? []).map((r) => (
                <li key={r.ProdPedidoID} className="flex gap-3">
                  <img
                    src={cloudinaryUrl(r.producto?.ProdImgPublicId, r.producto?.ProdImg, "thumb", "/mascot-cat.png")}
                    alt=""
                    className="size-12 rounded-xl border-2 border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold">
                      {r.Cantidad}× {r.producto?.ProdNombre}
                    </p>
                    {r.TextoPersonalizado ? (
                      <p className="flex items-start gap-1.5 text-xs italic text-muted-foreground">
                        <MessageSquare className="mt-0.5 size-3 shrink-0" />
                        {r.TextoPersonalizado}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(r.ProdPrecioUnitario * r.Cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t-2 border-dashed border-border pt-3">
              <span className="font-display font-bold">Total</span>
              <span className="font-display text-lg font-extrabold text-success-foreground">
                {formatCurrency(detalle.PedidoMontoTotal)}
              </span>
            </div>
            <Button variant="ghost" onClick={() => setDetalle(null)}>
              Cerrar
            </Button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
