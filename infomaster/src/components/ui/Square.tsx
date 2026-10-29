import type { CSSProperties } from 'react'

/**
 * El cuadrado de la marca como único ornamento del sistema: viñetas, marcador
 * de navegación activa, comillas de testimonio. Los ángulos son los del logo.
 */
type Tone = 'red' | 'yellow' | 'ink'
type Angle = 0 | 19 | 37 | -27

const TONES: Record<Tone, string> = {
  red: 'bg-brand-red',
  yellow: 'bg-brand-yellow',
  ink: 'bg-ink',
}

const ANGLES: Record<Angle, string> = {
  0: '',
  19: 'rotate-[19deg]',
  37: 'rotate-[37deg]',
  [-27]: '-rotate-[27deg]',
}

type Props = {
  tone?: Tone
  angle?: Angle
  className?: string
}

export function Square({ tone = 'red', angle = 0, className = 'size-2' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={['inline-block shrink-0', TONES[tone], ANGLES[angle], className].join(' ')}
    />
  )
}

/**
 * Los cuatro cuadrados del logo, medidos sobre el original (viewBox 182×208).
 * Orden de pintado = orden del array: el amarillo girado queda detrás del rojo
 * grande, y el rojo pequeño delante del amarillo recto.
 */
const LOGO_SQUARES = [
  { cx: 129, cy: 111, size: 61, angle: -27, fill: '#D9B400' }, // amarillo detrás (brand-yellow-deep)
  { cx: 127, cy: 56, size: 74, angle: 37, fill: '#D93D2D' }, // rojo grande
  { cx: 82, cy: 155, size: 70, angle: 0, fill: '#F8D10F' }, // amarillo delante
  { cx: 30, cy: 178, size: 44, angle: 19, fill: '#D93D2D' }, // rojo pequeño
] as const

const LOGO_MARK_VIEWBOX = { width: 182, height: 208 }

export function LogoSquares({ animated = false }: { animated?: boolean }) {
  const motion = animated ? 'origin-center [transform-box:fill-box] animate-square-in' : undefined
  // El giro fijo va en el <g>: con transform-box:fill-box, transform-origin
  // también desplaza el atributo transform del propio <rect> y lo saca de sitio.
  return LOGO_SQUARES.map(({ cx, cy, size, angle, fill }, index) => (
    <g key={index} transform={angle ? `rotate(${angle} ${cx} ${cy})` : undefined}>
      <rect
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        fill={fill}
        className={motion}
        style={
          animated
            ? ({ '--undo': `${-angle}deg`, animationDelay: `${index * 120}ms` } as CSSProperties)
            : undefined
        }
      />
    </g>
  ))
}

/**
 * Los cuadrados del logo a cualquier escala, con la misma geometría.
 * `animated` hace el único gesto de movimiento del sitio: los cuadrados
 * entran girando hasta su ángulo («No te pares»). Se anula con reduced-motion.
 */
export function LogoMark({
  className,
  animated = false,
}: {
  className?: string
  animated?: boolean
}) {
  const { width, height } = LOGO_MARK_VIEWBOX
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false" className={className}>
      <LogoSquares animated={animated} />
    </svg>
  )
}
