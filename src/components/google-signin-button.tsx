import * as React from "react";

/**
 * Botón oficial de Google Identity Services.
 * Carga el script una sola vez y renderiza el botón dentro del contenedor,
 * lo que funciona también dentro del iframe del preview.
 *
 * El Client ID es público y viaja en `VITE_GOOGLE_CLIENT_ID`.
 */

const SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (res: { credential?: string }) => void;
      }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
}

function gsi(): GoogleIdentity | undefined {
  return (window as unknown as { google?: GoogleIdentity }).google;
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (gsi()?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script")));
      return;
    }
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Sign-In"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function GoogleSignInButton({
  onCredential,
  onError,
  disabled,
}: {
  onCredential: (credential: string) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [listo, setListo] = React.useState(false);
  const callbackRef = React.useRef(onCredential);
  callbackRef.current = onCredential;

  React.useEffect(() => {
    if (!CLIENT_ID) return;
    let activo = true;
    void loadScript()
      .then(() => {
        const google = gsi();
        if (!activo || !ref.current || !google) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => {
            if (res.credential) void callbackRef.current(res.credential);
            else onError?.("Google no devolvió credenciales");
          },
        });
        google.accounts.id.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "es",
          width: 320,
        });
        setListo(true);
      })
      .catch(() => onError?.("No se pudo cargar el inicio de sesión con Google"));
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={ref}
        className={disabled ? "pointer-events-none opacity-60" : undefined}
      />
      {!listo ? (
        <p className="text-xs text-muted-foreground">Cargando Google...</p>
      ) : null}
    </div>
  );
}
