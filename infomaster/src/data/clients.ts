/**
 * Logos de clientes y acreditaciones.
 *
 * `src` está vacío mientras no lleguen los archivos definitivos: sin él se
 * pinta un placeholder con el mismo ratio, así que añadir el logo real no
 * mueve el layout. Sustituir = rellenar `src` con la ruta en /public/logos/.
 */
export type LogoEntry = {
  name: string
  src?: string
  href?: string
  /** El logo es blanco/claro: necesita un tile oscuro para verse. */
  dark?: boolean
}

export const CLIENTS: LogoEntry[] = [
  {
    name: 'Jardines Villalba',
    src: '/images/empresasparticipantes/jardines-villalba-logo.png',
  },
  {
    name: 'Aloha Golf Club',
    src: '/images/empresasparticipantes/Logo-Aloha-50-Aniversario-Blanco.png',
    dark: true,
  },
  { name: 'HGV', src: '/images/empresasparticipantes/HGV-blue_logo.svg' },
  {
    name: 'Empleabilidad ETT',
    src: '/images/empresasparticipantes/logo-empleabilidad-1-min.png',
  },
  { name: 'Cliente 5' },
  { name: 'Cliente 6' },
]

export const ACCREDITATIONS: LogoEntry[] = [
  { name: 'Junta de Andalucía' },
  { name: 'Fundación Estatal para la Formación en el Empleo' },
  { name: 'SEPE — Servicio Público de Empleo Estatal' },
]

export const CERTIFICATIONS: LogoEntry[] = [{ name: 'LOPD Certificado' }]
