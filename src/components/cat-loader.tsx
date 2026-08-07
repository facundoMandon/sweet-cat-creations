'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function CatLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        className="relative size-20"
      >
        <Image
          src="/mascot-cat.png"
          alt="Gatito de Black Cats"
          fill
          className="object-contain drop-shadow-md"
        />
      </motion.div>
      {label ? (
        <p className="font-display text-sm font-semibold text-muted-foreground">
          {label}
        </p>
      ) : null}
    </div>
  )
}
