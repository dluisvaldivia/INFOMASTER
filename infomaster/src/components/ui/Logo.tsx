import { LogoSquares } from './Square'

/**
 * Aproximación SVG del logo mientras no llega el archivo definitivo:
 * wordmark "INFOMASTER / formación" + los cuatro cuadrados rotados.
 *
 * Cuando llegue el logo real, dejarlo en public/brand/logo.png y cambiar
 * LOGO_SRC por su ruta — el resto del componente ya lo contempla.
 */
const LOGO_SRC: string | undefined = undefined

type Props = {
  className?: string
  /** `light` para fondos oscuros (footer en tinta). */
  tone?: 'dark' | 'light'
}

export function Logo({ className, tone = 'dark' }: Props) {
  const text = tone === 'light' ? '#FAF7EF' : '#1A1614'

  if (LOGO_SRC) {
    return (
      <img
        src={LOGO_SRC}
        alt="Infomaster Formación"
        className={className}
        width={200}
        height={72}
      />
    )
  }

  // Coordenadas del logo original: wordmark a la izquierda y los cuatro
  // cuadrados a la derecha, que ocupan toda la altura. textLength fija el
  // ancho del texto para que nunca invada los cuadrados.
  return (
    <svg
      viewBox="0 0 396 208"
      role="img"
      aria-label="Infomaster Formación"
      className={className}
    >
      <text
        x="3"
        y="81"
        fontFamily="Archivo, sans-serif"
        fontSize="44"
        fontWeight="700"
        textLength="266"
        lengthAdjust="spacingAndGlyphs"
        fill={text}
      >
        INFOMASTER
      </text>
      <text
        x="32"
        y="141"
        fontFamily="Archivo, sans-serif"
        fontSize="44"
        fontWeight="600"
        textLength="209"
        lengthAdjust="spacingAndGlyphs"
        fill={text}
      >
        formación
      </text>
      <g transform="translate(212 0)">
        <LogoSquares />
      </g>
    </svg>
  )
}
