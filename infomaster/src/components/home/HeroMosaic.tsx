import { HEADSHOTS, headshotSrc } from '../../data/headshots'

/**
 * Hoja de contactos 3×3: siete caras y dos bloques planos de marca, separados
 * por un filete de tinta de 1px. Cuadrado como el logo, sin radios.
 *
 * Cada celda recibe su contenido por prop, así que un crossfade futuro
 * (intercambiar fotos) se resuelve moviendo índices desde el padre.
 */
type Cell = number | 'red' | 'yellow'

const LAYOUT: Cell[] = [0, 1, 'red', 2, 3, 4, 'yellow', 5, 6]

function MosaicCell({ cell, priority }: { cell: Cell; priority: boolean }) {
  if (cell === 'red') return <div aria-hidden="true" className="aspect-square bg-brand-red" />
  if (cell === 'yellow') return <div aria-hidden="true" className="aspect-square bg-brand-yellow" />

  const photo = HEADSHOTS[cell]
  return (
    <div className="aspect-square overflow-hidden bg-cream-deep">
      <img
        src={headshotSrc(photo.slug, 400)}
        srcSet={`${headshotSrc(photo.slug, 400)} 400w, ${headshotSrc(photo.slug, 800)} 800w`}
        sizes="(max-width: 1023px) 33vw, 14vw"
        alt={photo.alt}
        width={400}
        height={400}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="size-full object-cover grayscale-[15%]"
      />
    </div>
  )
}

export function HeroMosaic() {
  return (
    <div className="grid grid-cols-3 gap-px border border-ink bg-ink">
      {LAYOUT.map((cell, index) => (
        <MosaicCell key={index} cell={cell} priority={index < 3} />
      ))}
    </div>
  )
}
