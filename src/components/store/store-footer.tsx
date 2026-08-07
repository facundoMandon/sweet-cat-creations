import Link from 'next/link'
import Image from 'next/image'

export function StoreFooter() {
  return (
    <footer className="mt-20 border-t-2 border-border/60 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/mascot-cat.png"
            alt=""
            width={40}
            height={40}
            className="size-10 object-contain"
          />
          <div>
            <p className="font-display text-lg font-extrabold">Black Cats</p>
            <p className="text-sm text-muted-foreground">
              Repostería y chocolates hechos con amor.
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-display text-sm font-semibold text-foreground/70">
          <Link href="/catalogo" className="hover:text-primary">
            Catálogo
          </Link>
          <Link href="/carrito" className="hover:text-primary">
            Carrito
          </Link>
          <Link href="/pedidos" className="hover:text-primary">
            Mis pedidos
          </Link>
          <Link href="/login" className="hover:text-primary">
            Ingresar
          </Link>
        </nav>
      </div>
      <div className="border-t-2 border-border/60 py-4 text-center text-xs text-muted-foreground">
        {'© '}
        {new Date().getFullYear()} Black Cats · Hecho con cariño
      </div>
    </footer>
  )
}
