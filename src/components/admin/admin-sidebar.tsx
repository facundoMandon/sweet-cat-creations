import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Bell,
  Tags,
  Sparkles,
  LogOut,
  Menu,
  Store,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/catalogo", label: "Categorías", icon: Tags },
  { to: "/admin/eventos", label: "Eventos", icon: Sparkles },
  { to: "/admin/notificaciones", label: "Notificaciones", icon: Bell },
] as const;

/** Sidebar del panel de administración con navegación activa. */
export function AdminSidebar() {
  const [open, setOpen] = React.useState(false);
  const { usuario, logout } = useAuth();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map(({ to, label, icon: Icon, ...rest }) => {
        const active =
          "exact" in rest && rest.exact ? pathname === to : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 font-display text-sm font-bold transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <img src="/mascot-cat.png" alt="" className="size-8 object-contain" />
          <span className="font-display font-extrabold">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b-2 border-border bg-card p-4 lg:hidden"
        >
          {nav}
        </motion.div>
      ) : null}

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r-2 border-border bg-card p-5 lg:flex">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/mascot-cat.png" alt="" className="size-10 object-contain" />
          <div>
            <p className="font-display text-lg font-extrabold leading-none">
              Black Cats
            </p>
            <p className="text-xs text-muted-foreground">Panel admin</p>
          </div>
        </Link>

        {nav}

        <div className="mt-auto flex flex-col gap-2 border-t-2 border-dashed border-border pt-4">
          <p className="px-2 font-display text-sm font-bold">
            {usuario?.nombre}
          </p>
          <Link to="/">
            <Button variant="outline" className="w-full">
              <Store /> Ver tienda
            </Button>
          </Link>
          <Button variant="ghost" onClick={logout}>
            <LogOut /> Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  );
}
