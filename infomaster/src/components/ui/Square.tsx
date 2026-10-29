import type { CSSProperties } from 'react'

/**
 * El cuadrado de la marca como único ornamento del sistema: viñetas, marcador
 * de navegación activa, comillas de testimonio. Los ángulos son los del logo.
 */
type Tone = 'red' | 'yellow' | 'ink'
type Angle = 0 | 18 | -10 | 24

const TONES: Record<Tone, string> = {
  red: 'bg-brand-red',
  yellow: 'bg-brand-yellow',
  ink: 'bg-ink',
}

const ANGLES: Record<Angle, string> = {
  0: '',
  18: 'rotate-[18deg]',
  [-10]: '-rotate-[10deg]',
  24: 'rotate-[24deg]',
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
 * El trío del logo a cualquier escala, con la misma geometría y rotaciones.
 * `animated` hace el único gesto de movimiento del sitio: los cuadrados
 * entran girando hasta su ángulo («No te pares»). Se anula con reduced-motion.
 */
export function SquareTrio({
  className,
  animated = false,
}: {
  className?: string
  animated?: boolean
}) {
  const motion = animated ? 'origin-center [transform-box:fill-box] animate-square-in' : ''
  return (
    <svg viewBox="0 0 50 66" aria-hidden="true" focusable="false" className={className}>
      <rect
        x="13" y="1" width="27" height="27" fill="#D93D2D"
        transform="rotate(18 26.5 14.5)"
        className={motion}
        style={animated ? ({ '--undo': '-18deg' } as CSSProperties) : undefined}
      />
      <rect
        x="18" y="29" width="29" height="29" fill="#F8D10F"
        transform="rotate(-10 32.5 43.5)"
        className={motion}
        style={animated ? ({ '--undo': '10deg', animationDelay: '120ms' } as CSSProperties) : undefined}
      />
      <rect
        x="0" y="47" width="18" height="18" fill="#D93D2D"
        transform="rotate(24 9 56)"
        className={motion}
        style={animated ? ({ '--undo': '-24deg', animationDelay: '240ms' } as CSSProperties) : undefined}
      />
    </svg>
  )
}
