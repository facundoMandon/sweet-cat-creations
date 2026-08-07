'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const baseField =
  'w-full rounded-2xl border-2 border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-60'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseField, 'h-11', className)} {...props} />
))
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseField, 'min-h-24 resize-y', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(baseField, 'h-11 cursor-pointer appearance-none', className)}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'mb-1.5 block font-display text-sm font-semibold text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </label>
  )
}

export function Field({
  label,
  children,
  hint,
  htmlFor,
}: {
  label?: string
  children: React.ReactNode
  hint?: string
  htmlFor?: string
}) {
  return (
    <div className="w-full">
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
