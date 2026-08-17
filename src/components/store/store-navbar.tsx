import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Search,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { brand, content } from "@/config";

const links = content.nav.store;

export function StoreNavbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { count } = useCart();
  const { isAuthenticated, isAdmin, usuario, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate({ to: "/catalogo", search: { q: q || undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <motion.img
            whileHover={{ rotate: [0, -12, 10, 0] }}
            transition={{ duration: 0.5 }}
            src={brand.assets.logo}
            alt=""
            className="size-9 object-contain"
          />
          <span className="font-display text-xl font-extrabold tracking-tight">
            {brand.name}
          </span>
        </Link>

        <form onSubmit={buscar} className="relative hidden flex-1 max-w-xs lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={content.search.placeholder}
            aria-label="Buscar productos"
            className="h-10 pl-9"
          />
        </form>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors",
                pathname === l.to
                  ? "bg-secondary text-secondary-foreground"
                  : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/carrito" className="relative" aria-label="Ver carrito">
            <Button variant="outline" size="icon" type="button">
              <ShoppingBag />
            </Button>
            {count > 0 ? (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {count}
              </motion.span>
            ) : null}
          </Link>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              {isAdmin ? (
                <Link to="/admin">
                  <Button variant="secondary" size="sm">
                    <LayoutDashboard />
                    Admin
                  </Button>
                </Link>
              ) : null}
              <span className="hidden max-w-28 truncate font-display text-sm font-semibold lg:inline">
                Hola, {usuario?.nombre.split(" ")[0]}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Cerrar sesión"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
              >
                <LogOut />
              </Button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="secondary" size="sm">
                <User />
                Ingresar
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menú"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t-2 border-border/60 bg-background px-4 py-3 md:hidden">
          <form onSubmit={buscar} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={content.search.placeholder}
              aria-label="Buscar productos"
              className="pl-9"
            />
          </form>
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-2.5 font-display font-semibold",
                  pathname === l.to
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground/80",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t-2 border-border/60 pt-3">
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        <LayoutDashboard />
                        Panel admin
                      </Button>
                    </Link>
                  ) : null}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut />
                    Cerrar sesión ({usuario?.nombre.split(" ")[0]})
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    <User />
                    Ingresar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
