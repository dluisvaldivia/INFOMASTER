import { HEADSHOTS, headshotSrc } from '../../data/headshots'

/**
 * Mosaico de caras del hero. Estático por ahora.
 *
 * Cada celda es un MosaicTile que recibe su índice de foto por prop, así que
 * el crossfade futuro (fade in/out intercambiando fotos) se resuelve moviendo
 * ese índice desde un estado en el padre — sin tocar el layout.
 */
type TileProps = {
  photoIndex: number | null
  priority?: boolean
  className?: string
}

function MosaicTile({ photoIndex, priority = false, className }: TileProps) {
  if (photoIndex === null) {
    // Celda vacía: transparente, no un bloque gris. Deja pasar el crema del
    // fondo para que no se recorte un rectángulo visible junto al titular.
    return <div className={className} aria-hidden="true" />
  }

  const wrapper = ['relative overflow-hidden bg-cream-deep', className]
    .filter(Boolean)
    .join(' ')

  const photo = HEADSHOTS[photoIndex]

  return (
    <div className={wrapper}>
      <img
        src={headshotSrc(photo.slug, 800)}
        srcSet={`${headshotSrc(photo.slug, 400)} 400w, ${headshotSrc(photo.slug, 800)} 800w`}
        sizes="(max-width: 1023px) 50vw, 20vw"
        alt={photo.alt}
        width={800}
        height={800}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="size-full object-cover"
      />
    </div>
  )
}

/**
 * `null` = celda vacía. En desktop son 5×2: las dos columnas de la derecha se
 * dejan casi vacías porque ahí va el titular. En móvil solo se pintan las 6
 * primeras (2×3) y el texto va debajo, no encima.
 */
const LAYOUT: (number | null)[] = [0, 1, 2, 3, null, 4, 5, 6, null, null]
const MOBILE_COUNT = 6

export function HeroMosaic() {
  return (
    <div className="grid h-full grid-cols-2 grid-rows-3 lg:grid-cols-5 lg:grid-rows-2">
      {LAYOUT.map((photoIndex, index) => (
        <MosaicTile
          key={index}
          photoIndex={photoIndex}
          priority={index < 2}
          className={index >= MOBILE_COUNT ? 'hidden lg:block' : undefined}
        />
      ))}
    </div>
  )
}
