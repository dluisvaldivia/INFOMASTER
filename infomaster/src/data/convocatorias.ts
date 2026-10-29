/**
 * Próximas convocatorias (cursos con fecha cerrada).
 *
 * Cómo añadir un curso: copia un bloque y cambia los datos.
 * - `dias`: un día por sesión, en formato AAAA-MM-DD. Da igual si son seguidos
 *   (4, 5 y 6) o sueltos (7, 14 y 28): se escriben igual y la web redacta
 *   la fecha sola ("4 al 6 nov." / "3 sábados"). El orden tampoco importa.
 * - Los cursos ya terminados desaparecen solos; no hace falta borrarlos.
 */
export type Modalidad = 'Presencial' | 'Online' | 'Mixta'

export type Convocatoria = {
  curso: string
  dias: string[]
  horas: number
  sede: string
  modalidad: Modalidad
  /** Opcional, texto libre: "9:00 a 14:00". */
  horario?: string
}

export const CONVOCATORIAS: Convocatoria[] = [
  {
    curso: 'Albañilería',
    dias: ['2026-11-04', '2026-11-05', '2026-11-06'],
    horas: 20,
    sede: 'Málaga',
    modalidad: 'Presencial',
  },
  {
    curso: 'Construcción',
    dias: ['2026-11-07', '2026-11-14', '2026-11-28'],
    horas: 20,
    sede: 'Málaga',
    modalidad: 'Presencial',
  },
  {
    curso: 'Taller mecánico',
    dias: ['2026-11-10', '2026-11-17', '2026-11-24'],
    horas: 20,
    sede: 'Málaga',
    modalidad: 'Presencial',
  },
  {
    curso: 'Aparatos elevadores',
    dias: ['2026-11-11', '2026-11-12', '2026-11-14'],
    horas: 20,
    sede: 'Málaga',
    modalidad: 'Presencial',
  },
  {
    curso: 'Trabajos en altura',
    dias: ['2026-11-16'],
    horas: 8,
    sede: 'Málaga',
    modalidad: 'Presencial',
  },
  {
    curso: 'Albañilería',
    dias: ['2026-11-18', '2026-11-19', '2026-11-20'],
    horas: 20,
    sede: 'Málaga',
    modalidad: 'Presencial',
  },
  {
    curso: 'Fontanería',
    dias: ['2026-11-25', '2026-11-26', '2026-11-27'],
    horas: 20,
    sede: 'Málaga',
    modalidad: 'Presencial',
  },
  {
    curso: 'Carpintería metálica',
    dias: ['2026-11-25', '2026-11-26', '2026-11-27'],
    horas: 20,
    sede: 'Málaga',
    modalidad: 'Presencial',
  },
]
