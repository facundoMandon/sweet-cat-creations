
import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'
interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, message, variant }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3200)
    },
    [],
  )

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={cn(
                'pointer-events-auto flex items-center gap-3 rounded-full border-2 px-5 py-3 font-display text-sm font-semibold shadow-lg',
                t.variant === 'success' &&
                  'border-success/40 bg-card text-success-foreground',
                t.variant === 'error' &&
                  'border-destructive/40 bg-card text-destructive',
                t.variant === 'info' && 'border-primary/40 bg-card text-foreground',
              )}
            >
              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full text-white',
                  t.variant === 'success' && 'bg-success',
                  t.variant === 'error' && 'bg-destructive',
                  t.variant === 'info' && 'bg-primary',
                )}
              >
                {t.variant === 'error' ? (
                  <X className="size-3.5" />
                ) : t.variant === 'info' ? (
                  <Info className="size-3.5" />
                ) : (
                  <Check className="size-3.5" />
                )}
              </span>
              {t.message}
              <button
                onClick={() => remove(t.id)}
                aria-label="Cerrar notificación"
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
