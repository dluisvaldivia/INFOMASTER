export type NavItem = {
  label: string
  to: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Formación', to: '/formacion' },
  { label: 'Cursos', to: '/cursos' },
  { label: 'Nosotros', to: '/nosotros' },
  { label: 'Contacto', to: '/contacto' },
]

/** Plataforma externa del campus. Se abre en pestaña nueva, no es una ruta. */
export const CAMPUS_URL =
  'https://infomaster.formacampus.com/SecureLogin/Login.aspx?ReturnUrl=%2fIndexIF.aspx'

export const CONTACT = {
  company: 'Expertos en Formación MVG',
  address: 'Calle Molina Lario 14, 29015 Málaga',
  phone: '+34 951 333 677',
  phoneHref: 'tel:+34951333677',
  email: 'info@infomasterformacion.es',
  emailHref: 'mailto:info@infomasterformacion.es',
  /** Solo dígitos, con prefijo de país. PROVISIONAL: es el fijo; poner el número real de WhatsApp. */
  whatsapp: '34951333677',
} as const

/** Enlace wa.me con el mensaje ya escrito; el usuario solo pulsa «enviar». */
export function whatsappHref(message: string) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`
}
