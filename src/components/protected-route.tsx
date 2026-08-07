import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import type { Rol } from "@/lib/types";
import { CatLoader } from "@/components/cat-loader";

/** Ruta protegida: exige sesión y, opcionalmente, un rol específico. */
export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: Rol;
}) {
  const { usuario, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({
        to: "/login",
        search: { next: requireRole === "admin" ? "/admin" : "/" },
        replace: true,
      });
      return;
    }
    if (requireRole && usuario?.rol !== requireRole) {
      navigate({ to: usuario?.rol === "admin" ? "/admin" : "/", replace: true });
    }
  }, [loading, isAuthenticated, requireRole, usuario, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <CatLoader label="Cargando tu sesión..." />
      </div>
    );
  }

  if (requireRole && usuario?.rol !== requireRole) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <CatLoader label="Redirigiendo..." />
      </div>
    );
  }

  return <>{children}</>;
}
