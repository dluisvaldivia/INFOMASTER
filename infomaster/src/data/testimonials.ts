export type Testimonial = {
  name: string
  role: string
  quote: string
  /** Foto opcional; sin ella se pinta un avatar con iniciales. */
  photo?: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'María José Palma',
    role: 'Administradora · Curso de Administración',
    quote:
      'El curso que hice con Infomaster me ayudó a mejorar en mi trabajo y conseguí una promoción.',
  },
  {
    name: 'Javier Ruiz',
    role: 'Encargado de almacén · Curso de Logística',
    quote:
      'Pude compaginarlo con mi jornada completa. El temario va al grano y se nota que lo dan profesionales del sector.',
  },
  {
    name: 'Lucía Fernández',
    role: 'Recepcionista · Curso de Atención al Cliente',
    quote:
      'Me tramitaron la bonificación sin que yo tuviera que hacer papeleo. Repetiré con ellos el año que viene.',
  },
]
