import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Cookie, Croissant, Star, Truck, HeartHandshake } from "lucide-react";
import { productService } from "@/lib/services/products";
import { categoryService } from "@/lib/services/catalog";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { CatLoader } from "@/components/cat-loader";
import { Card, CardContent } from "@/components/ui/card";
import { brand, content, seoMeta } from "@/config";

export const Route = createFileRoute("/_store/")({
  head: () => ({ meta: seoMeta("home", true) }),
  component: HomePage,
});

const testimonios = [
  {
    nombre: "Cami R.",
    texto:
      "Pedí una tableta con dedicatoria para mi novio y llegó impecable. ¡El mejor emprendimiento de Rosario!",
  },
  {
    nombre: "Nacho P.",
    texto:
      "El combo de cumpleaños fue el centro de la mesa. Se nota la dedicación.",
  },
  {
    nombre: "Flor M.",
    texto:
      "Atención hermosa y entrega puntual. Ya es mi lugar fijo para regalos dulces.",
  },
];

function HomePage() {
  const { data: productos, isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: productService.list,
  });
  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: categoryService.list,
  });

  const destacados = (productos ?? [])
    .filter((p) => p.ProdEstadoID === 1)
    .slice(0, 8);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="flex flex-col gap-5"
          >
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 font-display text-sm font-bold text-primary">
              {content.home.badge}
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-balance md:text-6xl">
              {content.home.headline}{" "}
              <span className="text-primary">{content.home.headlineAccent}</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              {content.home.subheadline}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalogo" search={{}}>
                <Button size="lg">{content.home.ctaPrimary}</Button>
              </Link>
              <Link to="/catalogo" search={{ combo: true }}>
                <Button size="lg" variant="secondary">
                  {content.home.ctaSecondary}
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.img
            src={brand.assets.hero}
            alt={content.home.heroAlt}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.1 }}
            className="mx-auto aspect-square w-full max-w-md object-contain drop-shadow-xl"
          />
        </div>
      </section>

      {/* ¿Qué preferís hoy? */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-center font-display text-2xl font-bold md:text-3xl">
          {content.home.categoriesTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/catalogo" search={{ cat: 1 }}>
            <motion.div
              whileHover={{ y: -6, rotate: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-40 flex-col items-center justify-center gap-2 rounded-4xl border-2 border-border bg-secondary text-secondary-foreground shadow-kawaii"
            >
              <Cookie className="size-10" />
              <span className="font-display text-3xl font-extrabold">DULCE</span>
              <span className="text-sm opacity-80">Chocolates y postres</span>
            </motion.div>
          </Link>
          <Link to="/catalogo" search={{ cat: 2 }}>
            <motion.div
              whileHover={{ y: -6, rotate: 1 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-40 flex-col items-center justify-center gap-2 rounded-4xl border-2 border-border bg-primary text-primary-foreground shadow-kawaii"
            >
              <Croissant className="size-10" />
              <span className="font-display text-3xl font-extrabold">SALADO</span>
              <span className="text-sm opacity-90">Para picar y compartir</span>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Categorías */}
      {categorias?.length ? (
        <section className="mx-auto w-full max-w-6xl px-4 pb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categorias.map((c) => (
              <Link key={c.CatID} to="/catalogo" search={{ cat: c.CatID }}>
                <span className="inline-block rounded-full border-2 border-border bg-card px-4 py-2 font-display text-sm font-bold transition-colors hover:border-primary hover:text-primary">
                  {c.CatDescripcion}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Más vendidos */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Los más pedidos
          </h2>
          <Link
            to="/catalogo"
            search={{}}
            className="font-display text-sm font-bold text-primary hover:underline"
          >
            Ver todo
          </Link>
        </div>
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <CatLoader label="Horneando el catálogo..." />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {destacados.map((p, i) => (
              <ProductCard key={p.ProdID} producto={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Beneficios */}
      <section className="bg-dots">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3">
          {[
            { icon: HeartHandshake, t: "100% personalizable", d: "Dedicatorias y colores a tu gusto." },
            { icon: Truck, d: "Coordiná día y horario de entrega.", t: "Entrega programada" },
            { icon: Star, t: "Ingredientes premium", d: "Materiales seleccionados y receta artesanal." },
          ].map(({ icon: Icon, t, d }) => (
            <Card key={t} className="bg-card/90">
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-success/20 text-success-foreground">
                  <Icon className="size-6" />
                </span>
                <p className="font-display font-bold">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-center font-display text-2xl font-bold md:text-3xl">
          Lo que dicen nuestros clientes
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonios.map((t, i) => (
            <motion.div
              key={t.nombre}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full bg-secondary/40">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed">"{t.texto}"</p>
                  <p className="font-display text-sm font-bold">{t.nombre}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
