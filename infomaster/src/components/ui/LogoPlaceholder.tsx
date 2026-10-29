import type { LogoEntry } from '../../data/clients'

/**
 * Tile neutro para logos que aún no existen. Mantiene el mismo ratio que un
 * logo real, así que rellenar `src` en los datos no mueve el layout.
 */
type Props = {
  entry: LogoEntry
  className?: string
}

export function LogoPlaceholder({ entry, className }: Props) {
  const { name, src, dark } = entry

  const frame = [
    'flex aspect-[3/2] w-full items-center justify-center p-5',
    dark ? 'bg-ink' : 'bg-white',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (src) {
    return (
      <div className={frame}>
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className={frame}>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span aria-hidden="true" className="block size-2 bg-line" />
        <span className="font-heading text-[11px] leading-tight font-medium text-ink-muted">
          {name}
        </span>
        <span className="text-[9px] tracking-wide text-ink-muted/60 uppercase">
          Logo pendiente
        </span>
      </div>
    </div>
  )
}
