/**
 * Derivados WebP generados desde src/assets/headshots/ (los originales se
 * conservan ahí sin tocar). Cada entrada tiene versión 400 y 800 px cuadrada.
 */
export type Headshot = {
  slug: string
  alt: string
}

export const HEADSHOTS: Headshot[] = [
  { slug: 'headshot-1', alt: 'Alumno sonriente de un curso de Infomaster' },
  { slug: 'headshot-2', alt: 'Alumna sonriente en su puesto de trabajo' },
  { slug: 'headshot-3', alt: 'Profesional sonriente tras completar su formación' },
  { slug: 'headshot-4', alt: 'Trabajador sonriente en su entorno laboral' },
  { slug: 'headshot-5', alt: 'Alumna sonriente de formación bonificada' },
  { slug: 'headshot-6', alt: 'Profesional sonriente formado con Infomaster' },
  { slug: 'headshot-7', alt: 'Trabajador sonriente de un curso de logística' },
]

export function headshotSrc(slug: string, width: 400 | 800) {
  return `/images/headshots/${slug}-${width}.webp`
}
