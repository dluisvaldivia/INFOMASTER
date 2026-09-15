import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'accent' | 'outline'
type Size = 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-heading font-semibold ' +
  'cursor-pointer transition-[transform,background-color,box-shadow,color] duration-200 ' +
  'min-h-11 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS: Record<Variant, string> = {
  // blanco sobre brand-red = 4,51:1 → AA
  primary:
    'bg-brand-red text-white shadow-[0_6px_20px_-8px_rgba(217,61,45,0.9)] hover:bg-brand-red-deep hover:shadow-[0_10px_28px_-10px_rgba(217,61,45,0.95)]',
  // amarillo con texto ink: blanco sobre amarillo sería ilegible
  accent:
    'bg-brand-yellow text-ink shadow-[0_6px_20px_-8px_rgba(248,209,15,0.9)] hover:bg-brand-yellow-deep hover:shadow-[0_10px_28px_-10px_rgba(248,209,15,0.95)]',
  outline:
    'border-2 border-ink/15 bg-white/70 text-ink hover:border-brand-red hover:text-brand-red-deep',
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
