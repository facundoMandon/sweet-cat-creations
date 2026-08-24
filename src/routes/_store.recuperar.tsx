import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MailCheck, Send } from "lucide-react";
import { authService } from "@/lib/services/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { brand, seoMeta } from "@/config";

export const Route = createFileRoute("/_store/recuperar")({
  head: () => ({ meta: seoMeta("recuperar") }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const [email, setEmail] = React.useState("");
  const [mensaje, setMensaje] = React.useState("");
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const msg = await authService.forgotPassword(email.trim());
      setMensaje(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar el email");
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
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-sm text-muted-foreground">
            Poné tu correo y te enviamos un enlace para crear una nueva.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {mensaje ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <MailCheck className="size-10 text-primary" />
                <p className="text-sm font-semibold">{mensaje}</p>
                <p className="text-xs text-muted-foreground">
                  Revisá también la carpeta de spam. El enlace vence en 1 hora.
                </p>
                <Button asChild variant="secondary" className="mt-2">
                  <Link to="/login" search={{}}>
                    Volver a ingresar
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <Field label="Correo" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={brand.contact.email}
                  />
                </Field>

                {error ? (
                  <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" size="lg" disabled={cargando}>
                  <Send />
                  {cargando ? "Enviando..." : "Enviarme el enlace"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" search={{}} className="font-bold hover:text-primary">
            Volver al inicio de sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
