import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-xs font-bold',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success/20 text-success-foreground',
        warning: 'bg-chart-4/20 text-[#8a5a00]',
        danger: 'bg-destructive/15 text-destructive',
        muted: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
