/**
 * Aproximación SVG del logo mientras no llega el archivo definitivo:
 * wordmark "INFOMASTER / formación" + los tres cuadrados rotados.
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

  return (
    <svg
      viewBox="0 0 252 76"
      role="img"
      aria-label="Infomaster Formación"
      className={className}
    >
      <text
        x="0"
        y="34"
        fontFamily="Archivo, sans-serif"
        fontSize="27"
        fontWeight="700"
        letterSpacing="-0.4"
        fill={text}
      >
        INFOMASTER
      </text>
      <text
        x="0"
        y="63"
        fontFamily="Archivo, sans-serif"
        fontSize="25"
        fontWeight="500"
        letterSpacing="0.6"
        fill={text}
      >
        formación
      </text>
      {/* Los cuadrados arrancan a la derecha del wordmark: por debajo de
          x=180 se solapan con la "R" de INFOMASTER. */}
      <g>
        <rect
          x="196"
          y="1"
          width="27"
          height="27"
                    fill="#D93D2D"
          transform="rotate(18 209 14)"
        />
        <rect
          x="201"
          y="29"
          width="29"
          height="29"
                    fill="#F8D10F"
          transform="rotate(-10 215 43)"
        />
        <rect
          x="183"
          y="47"
          width="18"
          height="18"
                    fill="#D93D2D"
          transform="rotate(24 192 56)"
        />
      </g>
    </svg>
  )
}
