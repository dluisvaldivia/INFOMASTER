import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'accent' | 'outline'
type Size = 'md' | 'lg'

// Rectángulos planos: sin radio ni sombra. El movimiento lo pone la flecha
// (cualquier svg hijo avanza 4px en hover), no el botón.
const BASE =
  'group inline-flex items-center justify-center gap-2 font-heading font-semibold ' +
  'cursor-pointer transition-colors duration-200 min-h-11 ' +
  '[&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 ' +
  'hover:[&>svg:last-child]:translate-x-1 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS: Record<Variant, string> = {
  // blanco sobre brand-red = 4,51:1 → AA
  primary: 'bg-brand-red text-white hover:bg-brand-red-deep',
  // amarillo con texto ink: blanco sobre amarillo sería ilegible
  accent: 'bg-brand-yellow text-ink hover:bg-brand-yellow-deep',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-cream',
}

const SIZES: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

function classes(variant: Variant, size: Size, className?: string) {
  return [BASE, VARIANTS[variant], SIZES[size], className].filter(Boolean).join(' ')
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<'button'>

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  )
}

type LinkButtonProps = CommonProps & { to: string }

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  to,
}: LinkButtonProps) {
  return (
    <Link to={to} className={classes(variant, size, className)}>
      {children}
    </Link>
  )
}

type ExternalButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'className'>

export function ExternalButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  ...props
}: ExternalButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes(variant, size, className)}
      {...props}
    >
      {children}
    </a>
  )
}
