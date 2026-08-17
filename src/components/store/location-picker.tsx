/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Selector de ubicación de entrega con Google Maps.
 *
 * Sólo se renderiza en el navegador (cargado con React.lazy detrás de
 * <ClientOnly/>), porque la API de Maps necesita `window`.
 */
import * as React from "react";
import { Crosshair, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { mapsDefaults, type Ubicacion } from "@/lib/maps";

declare global {
  interface Window {
    google?: any;
    __initGoogleMaps?: () => void;
  }
}

const BROWSER_KEY = import.meta.env[
  "VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"
] as string | undefined;
const TRACKING_ID = import.meta.env[
  "VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"
] as string | undefined;

let mapsPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  if (!BROWSER_KEY) {
    return Promise.reject(new Error("Falta la clave de Google Maps"));
  }
  mapsPromise = new Promise<void>((resolve, reject) => {
    window.__initGoogleMaps = () => resolve();
    const script = document.createElement("script");
    const channel = TRACKING_ID ? `&channel=${TRACKING_ID}` : "";
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}` +
      `&loading=async&libraries=places&callback=__initGoogleMaps${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

interface Sugerencia {
  placeId: string;
  texto: string;
}

export interface LocationPickerProps {
  value: Ubicacion;
  onChange: (u: Ubicacion) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapObj = React.useRef<any>(null);
  const markerObj = React.useRef<any>(null);
  const sessionToken = React.useRef<any>(null);
  const geocoder = React.useRef<any>(null);
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [listo, setListo] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busqueda, setBusqueda] = React.useState(value.direccion ?? "");
  const [sugerencias, setSugerencias] = React.useState<Sugerencia[]>([]);

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = React.useRef(value);
  valueRef.current = value;

  /* -------------------------------------------------- mapa + marcador */
  React.useEffect(() => {
    let cancelado = false;
    loadGoogleMaps()
      .then(async () => {
        if (cancelado || !mapRef.current) return;
        const g = window.google;
        await g.maps.importLibrary("maps");
        const centro =
          valueRef.current.lat != null && valueRef.current.lng != null
            ? { lat: valueRef.current.lat, lng: valueRef.current.lng }
            : mapsDefaults.defaultCenter;
        const map = new g.maps.Map(mapRef.current, {
          center: centro,
          zoom: valueRef.current.lat != null ? 17 : mapsDefaults.defaultZoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const marker = new g.maps.Marker({
          map,
          position: centro,
          draggable: true,
          visible: valueRef.current.lat != null,
        });
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) void aplicarPunto(pos.lat(), pos.lng());
        });
        map.addListener("click", (e: any) => {
          if (e.latLng) void aplicarPunto(e.latLng.lat(), e.latLng.lng());
        });
        mapObj.current = map;
        markerObj.current = marker;
        geocoder.current = new g.maps.Geocoder();
        setListo(true);
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Mueve el marcador y resuelve la dirección del punto (reverse geocoding). */
  const aplicarPunto = React.useCallback(
    async (lat: number, lng: number, direccion?: string, placeId?: string | null) => {
      const marker = markerObj.current;
      const map = mapObj.current;
      if (marker && map) {
        marker.setPosition({ lat, lng });
        marker.setVisible(true);
        map.panTo({ lat, lng });
        if (map.getZoom() < 16) map.setZoom(17);
      }
      let dir = direccion ?? "";
      let pid = placeId ?? null;
      if (!dir && geocoder.current) {
        try {
          const res = await geocoder.current.geocode({ location: { lat, lng } });
          const first = res?.results?.[0];
          dir = first?.formatted_address ?? "";
          pid = first?.place_id ?? null;
        } catch {
          dir = valueRef.current.direccion;
        }
      }
      setBusqueda(dir);
      onChangeRef.current({
        ...valueRef.current,
        direccion: dir,
        lat,
        lng,
        placeId: pid,
      });
    },
    [],
  );

  /* -------------------------------------------------- autocompletado */
  const buscar = (texto: string) => {
    setBusqueda(texto);
    onChangeRef.current({ ...valueRef.current, direccion: texto });
    if (debounce.current) clearTimeout(debounce.current);
    if (texto.trim().length < 4 || !listo) {
      setSugerencias([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        const g = window.google;
        const places = await g.maps.importLibrary("places");
        if (!sessionToken.current) {
          sessionToken.current = new places.AutocompleteSessionToken();
        }
        const { suggestions } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: texto,
            sessionToken: sessionToken.current,
            includedRegionCodes: [mapsDefaults.region.toUpperCase()],
          });
        setSugerencias(
          (suggestions ?? [])
            .slice(0, 5)
            .map((s: any) => ({
              placeId: s.placePrediction?.placeId ?? "",
              texto: s.placePrediction?.text?.toString() ?? "",
            }))
            .filter((s: Sugerencia) => s.placeId && s.texto),
        );
      } catch {
        setSugerencias([]);
      }
    }, 350);
  };

  const elegirSugerencia = async (s: Sugerencia) => {
    setSugerencias([]);
    try {
      const g = window.google;
      const places = await g.maps.importLibrary("places");
      const place = new places.Place({ id: s.placeId });
      await place.fetchFields({ fields: ["location", "formattedAddress"] });
      const loc = place.location;
      sessionToken.current = null;
      if (loc) {
        await aplicarPunto(
          loc.lat(),
          loc.lng(),
          place.formattedAddress ?? s.texto,
          s.placeId,
        );
        return;
      }
    } catch {
      /* cae al geocoder */
    }
    if (geocoder.current) {
      try {
        const res = await geocoder.current.geocode({ placeId: s.placeId });
        const first = res?.results?.[0];
        if (first?.geometry?.location) {
          await aplicarPunto(
            first.geometry.location.lat(),
            first.geometry.location.lng(),
            first.formatted_address ?? s.texto,
            s.placeId,
          );
        }
      } catch {
        setError("No pudimos ubicar esa dirección");
      }
    }
  };

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no permite compartir la ubicación");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => void aplicarPunto(pos.coords.latitude, pos.coords.longitude),
      () => setError("No pudimos obtener tu ubicación actual"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label="Buscá tu dirección" htmlFor="dir-maps">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="dir-maps"
            className="pl-9"
            autoComplete="off"
            value={busqueda}
            maxLength={300}
            placeholder="Av. Siempreviva 742, Rosario"
            onChange={(e) => buscar(e.target.value)}
          />
          {sugerencias.length > 0 ? (
            <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-2xl border-2 border-border bg-card shadow-lg">
              {sugerencias.map((s) => (
                <li key={s.placeId}>
                  <button
                    type="button"
                    onClick={() => void elegirSugerencia(s)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{s.texto}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Field>

      <div
        ref={mapRef}
        className="h-56 w-full overflow-hidden rounded-2xl border-2 border-border bg-muted"
        aria-label="Mapa para elegir la ubicación de entrega"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={usarMiUbicacion}>
          <Crosshair className="size-4" /> Usar mi ubicación actual
        </Button>
        <p className="text-xs text-muted-foreground">
          Tocá el mapa o arrastrá el marcador para ajustar el punto exacto.
        </p>
      </div>

      <Field label="Referencias (opcional)" htmlFor="referencias">
        <Input
          id="referencias"
          value={value.referencias ?? ""}
          maxLength={500}
          placeholder="Timbre 3B, portón negro, entre calles..."
          onChange={(e) =>
            onChange({ ...value, referencias: e.target.value || null })
          }
        />
      </Field>

      {value.lat != null && value.lng != null ? (
        <p className="text-xs font-semibold text-success-foreground">
          Ubicación marcada en el mapa ({value.lat.toFixed(5)}, {value.lng.toFixed(5)})
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-semibold text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
