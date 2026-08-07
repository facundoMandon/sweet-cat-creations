'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Gift, Sparkles } from 'lucide-react'
import type { Producto } from '@/lib/types'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

export function ProductCard({
  producto,
  index = 0,
}: {
  producto: Producto
  index?: number
}) {
  const agotado = producto.ProdEstadoID === 2
  const proximamente = producto.ProdEstadoID === 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
    >
      <Link href={`/producto/${producto.ProdID}`} className="group block h-full">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-[0_8px_24px_-14px_rgba(8,9,10,0.2)]"
        >
          <div className="relative aspect-square overflow-hidden bg-accent/40">
            <Image
              src={producto.ProdImg || '/placeholder.svg'}
              alt={producto.ProdNombre}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {producto.EsCombo ? (
                <Badge variant="default">
                  <Gift className="size-3" />
                  Combo
                </Badge>
              ) : null}
              {proximamente ? (
                <Badge variant="warning">
                  <Sparkles className="size-3" />
                  Próximamente
                </Badge>
              ) : null}
              {agotado ? <Badge variant="muted">Agotado</Badge> : null}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            {producto.subcategoria ? (
              <span className="font-display text-xs font-semibold text-primary">
                {producto.subcategoria.SubCatDescripcion}
              </span>
            ) : null}
            <h3 className="font-display text-base font-bold leading-tight text-balance">
              {producto.ProdNombre}
            </h3>
            <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
              {producto.ProdDescripcion}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-display text-lg font-extrabold text-primary">
                {formatCurrency(producto.ProdPrecio)}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 font-display text-xs font-bold text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                Ver más
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
