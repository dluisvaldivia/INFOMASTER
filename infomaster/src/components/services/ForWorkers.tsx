import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { CONVOCATORIAS } from '../../data/convocatorias'
import { CONTACT, whatsappHref } from '../../data/nav'
import { Button } from '../ui/Button'
import { ChatIcon, MailIcon } from '../ui/Icon'

const PASOS = [
  { titulo: 'Elige un curso', texto: 'Del catálogo o el que tengas en mente.' },
  { titulo: 'Dinos dónde trabajas', texto: 'Solo el nombre de tu empresa y un contacto.' },
  {
    titulo: 'Hablamos con tu empresa',
    texto: 'Les explicamos que no les cuesta nada y lo gestionamos todo. Te avisamos.',
  },
]

const CURSOS = [...new Set(CONVOCATORIAS.map((c) => c.curso))].sort((a, b) =>
  a.localeCompare(b, 'es'),
)

type Datos = { nombre: string; curso: string; empresa: string }

function mensajeWhatsApp({ nombre, curso, empresa }: Datos) {
  return [
    `Hola, soy ${nombre}.`,
    `Me gustaría hacer ${curso ? `el curso de ${curso}` : 'un curso'} y que lo gestionéis con mi empresa, ${empresa}.`,
  ].join(' ')
}

/** Email listo para que el trabajador se lo envíe a su responsable o a RRHH. */
function mailtoParaEmpresa({ nombre, curso }: Datos) {
  const asunto = `Solicitud de formación bonificada${curso ? `: ${curso}` : ''}`
  const cuerpo = [
    'Hola:',
    '',
    `Me gustaría realizar ${curso ? `el curso de ${curso}` : 'un curso de formación'}. Se puede bonificar con el crédito de formación que la empresa tiene cada año en FUNDAE, así que no supondría un coste.`,
    '',
    `Infomaster Formación se encarga de toda la gestión. Podéis contactar con ellos en el ${CONTACT.phone} o en ${CONTACT.email}.`,
    '',
    'Gracias,',
    nombre || '',
  ].join('\n')
  return `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
}

type Props = {
  /** h2 cuando el bloque es una sección propia (Formación); h3 dentro del selector. */
  headingLevel?: 'h2' | 'h3'
  headingId?: string
}

export function ForWorkers({ headingLevel = 'h3', headingId }: Props) {
  const Heading = headingLevel
  const id = useId()
  const [datos, setDatos] = useState<Datos>({ nombre: '', curso: '', empresa: '' })

  function set(campo: keyof Datos) {
    return (value: string) => setDatos((d) => ({ ...d, [campo]: value }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.open(whatsappHref(mensajeWhatsApp(datos)), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-5">
        <Heading
          id={headingId}
          className="text-3xl leading-[1.05] font-bold tracking-[-0.02em] sm:text-4xl"
        >
          ¿Quieres un curso? Se lo pedimos a tu empresa
        </Heading>
        <p className="mt-5 max-w-[48ch] leading-relaxed text-ink-muted text-pretty">
          Tu empresa tiene un crédito anual para formación que, si no lo usa, pierde. Para ti
          el curso es gratis; para ella, coste cero. Solo hace falta que alguien se lo
          proponga, y de eso nos encargamos nosotros.
        </p>
        <p className="mt-4 max-w-[48ch] leading-relaxed text-ink-muted text-pretty">
          ¿Formación oficial en horario de trabajo? Pregúntanos por el{' '}
          <Link to="/#pif" className="text-brand-red-deep underline underline-offset-4 hover:text-brand-red-dark">
            Permiso Individual de Formación
          </Link>
          .
        </p>
      </div>

      <div className="lg:col-span-7">
        <ol className="grid border-t border-ink sm:grid-cols-3">
          {PASOS.map((paso, i) => (
            <li
              key={paso.titulo}
              className="border-b border-line py-5 last:border-b-0 sm:border-b-0 sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0"
            >
              <span className="font-heading text-4xl leading-none font-bold tabular-nums [font-stretch:125%] text-brand-red-deep">
                {i + 1}
              </span>
              <p className="mt-3 font-heading font-semibold">{paso.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{paso.texto}</p>
            </li>
          ))}
        </ol>

        <form
          onSubmit={onSubmit}
          className="mt-8 border-t border-line pt-8 sm:mt-10"
          aria-label="Pide tu curso"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tu nombre" value={datos.nombre} onChange={set('nombre')} required autoComplete="given-name" />
            <Field
              label="Empresa donde trabajas"
              value={datos.empresa}
              onChange={set('empresa')}
              required
              autoComplete="organization"
            />
            <div className="sm:col-span-2">
              <Field
                label="Curso que te interesa"
                hint="Opcional"
                value={datos.curso}
                onChange={set('curso')}
                list={`${id}-cursos`}
                autoComplete="off"
              />
              <datalist id={`${id}-cursos`}>
                {CURSOS.map((curso) => (
                  <option key={curso} value={curso} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="submit" variant="primary" size="lg">
              Pídelo por WhatsApp
              <ChatIcon className="size-4" />
            </Button>
            <a
              href={mailtoParaEmpresa(datos)}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-ink px-7 py-3.5 font-heading font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-cream"
            >
              Prefiero pedírselo yo
              <MailIcon className="size-4" />
            </a>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            «Prefiero pedírselo yo» abre un email ya redactado para tu responsable o RRHH.
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  value,
  onChange,
  ...input
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  autoComplete?: string
  list?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm text-ink">
        {label}
        {hint && <span className="text-ink-muted">{hint}</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block min-h-11 w-full border border-ink bg-white px-4 text-base focus:outline-2 focus:outline-offset-0 focus:outline-brand-red-deep"
        {...input}
      />
    </div>
  )
}
