import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, ExternalLink, CalendarDays } from "lucide-react";
import { listRecordatorios } from "@/lib/calendar.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CatLoader } from "@/components/cat-loader";

export const Route = createFileRoute("/admin/calendario")({
  component: AdminCalendario,
});

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function AdminCalendario() {
  const fetchEventos = useServerFn(listRecordatorios);
  const { data, isLoading } = useQuery({
    queryKey: ["calendarEventos"],
    queryFn: () => fetchEventos(),
  });

  const [cursor, setCursor] = React.useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const eventos = data?.eventos ?? [];
  const porDia = React.useMemo(() => {
    const map = new Map<string, typeof eventos>();
    eventos.forEach((e) => {
      const list = map.get(e.fecha) ?? [];
      list.push(e);
      map.set(e.fecha, list);
    });
    return map;
  }, [eventos]);

  // Grilla del mes empezando en lunes
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const celdas: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(firstDay);
    d.setDate(1 - offset + i);
    return d;
  });
  const hoy = ymd(new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">
            Calendario de pedidos
          </h1>
          <p className="text-sm text-muted-foreground">
            Recordatorios de envío sincronizados con Google Calendar
            {data?.calendarId ? ` (${data.calendarId})` : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Mes anterior"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-44 text-center font-display font-bold capitalize">
            {MESES[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Mes siguiente"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {data && !data.ok ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          No pudimos leer el calendario: {"error" in data ? data.error : ""}
        </p>
      ) : null}

      {isLoading ? (
        <CatLoader />
      ) : (
        <Card>
          <CardContent className="p-2 md:p-4">
            <div className="grid grid-cols-7 gap-px">
              {DIAS.map((d) => (
                <div
                  key={d}
                  className="pb-2 text-center font-display text-xs font-bold uppercase text-muted-foreground"
                >
                  {d}
                </div>
              ))}
              {celdas.map((d) => {
                const key = ymd(d);
                const delMes = d.getMonth() === cursor.getMonth();
                const items = porDia.get(key) ?? [];
                return (
                  <div
                    key={key}
                    className={`min-h-24 rounded-xl border-2 p-1.5 ${
                      delMes ? "border-border bg-card" : "border-transparent bg-muted/40"
                    }`}
                  >
                    <span
                      className={`inline-grid size-6 place-items-center rounded-full text-xs font-bold ${
                        key === hoy
                          ? "bg-primary text-primary-foreground"
                          : delMes
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {items.map((e) => (
                        <a
                          key={e.id}
                          href={e.url || e.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={e.titulo}
                          className={`truncate rounded-lg px-1.5 py-1 text-[11px] font-semibold ${
                            e.diasAntes === 1
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {e.diasAntes ? `${e.diasAntes}d · ` : ""}
                          {e.titulo.replace("Recordatorio de Envío: ", "")}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <h2 className="flex items-center gap-2 font-display font-bold">
            <CalendarDays className="size-4" /> Próximos recordatorios
          </h2>
          {eventos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay recordatorios programados.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {eventos.slice(0, 20).map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2 text-sm"
                >
                  <span className="font-semibold">{e.titulo}</span>
                  <span className="flex items-center gap-3 text-muted-foreground">
                    {e.fecha}
                    {e.url ? (
                      <a
                        href={e.url}
                        className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                      >
                        Ver pedido <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
