import { CAMPUS_URL } from './nav'

/**
 * Lo que Infomaster aporta, en el orden en que se lee en la portada.
 * Cómo editar: cambia el texto de un bloque o reordénalos. `nota` pinta un
 * distintivo amarillo junto al título (úsalo con moderación: uno, como mucho dos).
 */
export type ValueProp = {
  id: string
  titulo: string
  texto: string
  nota?: string
  enlace?: { texto: string; href: string; externo?: boolean }
}

/** El argumento principal: va en grande, encima de la lista. */
export const VALOR_PRINCIPAL = {
  titulo: 'Formación a coste cero',
  texto:
    'Cada empresa tiene un crédito anual para formar a su plantilla. El curso se adelanta y se recupera descontándolo de las cotizaciones a la Seguridad Social. Si no se usa antes de fin de año, se pierde.',
  cierre: 'Nosotros calculamos cuánto te corresponde y lo gestionamos de principio a fin.',
} as const

export const VALUE_PROPS: ValueProp[] = [
  {
    id: 'tutores',
    titulo: 'Tutores profesionales',
    texto:
      'Cada curso lo acompaña un experto en activo en su materia, que resuelve dudas y corrige durante toda la formación. Nadie aprende solo delante de una pantalla.',
  },
  {
    id: 'fundae',
    titulo: 'Cero papeleo con FUNDAE',
    texto:
      'Comunicación de inicio y fin, plazos, control de asistencia y justificación de la bonificación. Lo tramitamos todo; tu empresa solo firma.',
  },
  {
    id: 'pif',
    titulo: 'Permiso Individual de Formación',
    nota: 'Poco conocido',
    texto:
      'Hasta 200 horas laborables al año, retribuidas, para que un trabajador curse formación oficial acreditada sin que su empresa pierda crédito. Casi nadie lo solicita; te explicamos si encaja y lo tramitamos.',
  },
  {
    id: 'campus',
    titulo: 'Campus online 24/7 y diploma',
    texto:
      'Contenidos, tutorías y evaluaciones disponibles a cualquier hora desde nuestro campus. Al terminar, diploma acreditativo con las horas y los contenidos cursados.',
    enlace: {
      texto: 'Entrar al campus',
      href: CAMPUS_URL,
      externo: true,
    },
  },
  {
    id: 'modalidades',
    titulo: 'Presencial, online o mixta',
    texto:
      'Un catálogo amplio y actualizado, grupos con fecha cerrada en nuestro centro de Málaga y cursos a medida para equipos.',
    enlace: { texto: 'Ver próximos cursos', href: '/cursos#proximos-cursos' },
  },
]
