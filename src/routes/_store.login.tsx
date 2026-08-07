import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface LoginSearch {
  next?: string | undefined;
}

export const Route = createFileRoute("/_store/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    next: typeof search["next"] === "string" ? search["next"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Iniciar sesión | Black Cats" },
      {
        name: "description",
        content:
          "Ingresá a tu cuenta de Black Cats para ver tus pedidos y comprar más rápido.",
      },
      { property: "og:title", content: "Iniciar sesión | Black Cats" },
      {
        property: "og:description",
        content: "Ingresá a tu cuenta de Black Cats.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [modo, setModo] = React.useState<"login" | "registro">("login");
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const usuario =
        modo === "login"
          ? await login(email, password)
          : await register({ nombre, email, password });
      toast(`¡Hola, ${usuario.nombre}!`);
      if (usuario.rol === "admin") navigate({ to: "/admin" });
      else if (next === "/pedidos") navigate({ to: "/pedidos" });
      else navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos ingresar");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="mb-6 text-center">
          <img
            src="/mascot-cat.png"
            alt=""
            className="mx-auto size-20 object-contain animate-float-slow"
          />
          <h1 className="mt-3 font-display text-3xl font-extrabold">
            {modo === "login" ? "Bienvenido de nuevo" : "Creá tu cuenta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {modo === "login"
              ? "Ingresá para ver tus pedidos"
              : "Guardá tus datos y comprá más rápido"}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
              {(["login", "registro"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModo(m);
                    setError("");
                  }}
                  className={`rounded-full py-2 font-display text-sm font-bold transition-colors ${
                    modo === m
                      ? "bg-card text-primary shadow-kawaii"
                      : "text-muted-foreground"
                  }`}
                >
                  {m === "login" ? "Ingresar" : "Registrarme"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
              {modo === "registro" ? (
                <Field label="Nombre" htmlFor="nombre">
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Sofía Pérez"
                  />
                </Field>
              ) : null}
              <Field label="Correo" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hola@blackcats.com"
                />
              </Field>
              <Field label="Contraseña" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              {error ? (
                <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" size="lg" disabled={cargando}>
                {modo === "login" ? <LogIn /> : <UserPlus />}
                {cargando
                  ? "Un segundo..."
                  : modo === "login"
                    ? "Ingresar"
                    : "Crear cuenta"}
              </Button>
            </form>

            <div className="mt-5 rounded-2xl bg-secondary/40 p-4 text-xs">
              <p className="mb-1 font-display font-bold">Cuentas demo</p>
              <p>admin@blackcats.com / admin123</p>
              <p>cliente@blackcats.com / cliente123</p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/catalogo" search={{}} className="font-bold hover:text-primary">
            Seguir explorando el catálogo
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
