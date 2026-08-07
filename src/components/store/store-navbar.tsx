'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/cart-context'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/pedidos', label: 'Mis pedidos' },
]

export function StoreNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { count } = useCart()
  const { isAuthenticated, isAdmin, usuario, logout } = useAuth()
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/mascot-cat.png"
            alt=""
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="font-display text-xl font-extrabold tracking-tight">
            Black Cats
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors',
                pathname === l.href
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/carrito" className="relative">
            <Button variant="outline" size="icon" aria-label="Ver carrito">
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
                <Link href="/admin">
                  <Button variant="secondary" size="sm">
                    <LayoutDashboard />
                    Admin
                  </Button>
                </Link>
              ) : null}
              <span className="hidden max-w-28 truncate font-display text-sm font-semibold lg:inline">
                Hola, {usuario?.nombre.split(' ')[0]}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Cerrar sesión"
                onClick={() => {
                  logout()
                  router.push('/')
                }}
              >
                <LogOut />
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
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
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'rounded-2xl px-4 py-2.5 font-display font-semibold',
                  pathname === l.href
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-foreground/80',
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t-2 border-border/60 pt-3">
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}>
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
                      logout()
                      setMenuOpen(false)
                      router.push('/')
                    }}
                  >
                    <LogOut />
                    Cerrar sesión ({usuario?.nombre.split(' ')[0]})
                  </Button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)}>
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
  )
}
