'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-semibold transition-all outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_6px_0_0_rgba(214,74,52,0.55)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_3px_0_0_rgba(214,74,52,0.55)]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[0_5px_0_0_rgba(240,160,160,0.6)] hover:brightness-[1.03] active:translate-y-[2px] active:shadow-[0_3px_0_0_rgba(240,160,160,0.6)]',
        success:
          'bg-success text-success-foreground shadow-[0_6px_0_0_rgba(74,158,133,0.55)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_3px_0_0_rgba(74,158,133,0.55)]',
        outline:
          'border-2 border-primary/30 bg-card text-foreground hover:border-primary hover:bg-accent',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_5px_0_0_rgba(160,40,44,0.5)] hover:brightness-105 active:translate-y-[2px]',
        link: 'text-primary underline-offset-4 hover:underline shadow-none',
      },
      size: {
        default: 'h-11 px-6 text-sm [&_svg]:size-4',
        sm: 'h-9 px-4 text-sm [&_svg]:size-4',
        lg: 'h-13 px-8 text-base [&_svg]:size-5',
        icon: 'size-11 [&_svg]:size-5',
        'icon-sm': 'size-9 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
