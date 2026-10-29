import { whatsappHref } from '../../data/nav'
import { ExternalButton, LinkButton } from '../ui/Button'
import { ArrowRightIcon, ChatIcon } from '../ui/Icon'
import { Square } from '../ui/Square'

const SERVICIOS = [
  {
    titulo: 'Un plan de formación anual',
    texto:
      'Revisamos tu crédito y tu plantilla y te proponemos qué cursos lo aprovechan mejor, antes de que caduque a fin de año.',
  },
  {
    titulo: 'Toda la plantilla a la vez',
    texto:
      'Decenas de alumnos y cursos en paralelo: matrículas, seguimiento, asistencia y diplomas, con un solo contacto para todo.',
  },
  {
    titulo: 'Grupos cerrados o a medida',
    texto:
      'Cursos solo para tu equipo, con el temario y el horario que necesitas, presenciales en Málaga u online.',
  },
  {
    titulo: 'La bonificación, tramitada',
    texto:
      'Nos ocupamos de FUNDAE de principio a fin. Tu asesoría solo aplica el descuento en los seguros sociales.',
  },
]

const MENSAJE =
  'Hola, os escribo de parte de una empresa. Nos gustaría organizar formación bonificada para nuestra plantilla.'

type Props = {
  /** h2 cuando el bloque es una sección propia (Formación); h3 dentro del selector. */
  headingLevel?: 'h2' | 'h3'
  headingId?: string
}

export function ForCompanies({ headingLevel = 'h3', headingId }: Props) {
  const Heading = headingLevel
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-5">
        <Heading
          id={headingId}
          className="text-3xl leading-[1.05] font-bold tracking-[-0.02em] sm:text-4xl"
        >
          Gestionamos toda la formación de tu plantilla
        </Heading>
        <p className="mt-5 max-w-[48ch] leading-relaxed text-ink-muted text-pretty">
          Para empresas que quieren formar a mucha gente sin dedicarle horas de gestión. Tú
          decides qué necesita tu equipo; del resto nos ocupamos nosotros.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <LinkButton to="/formacion#calculadora" variant="primary">
            Calcula tu crédito
            <ArrowRightIcon className="size-4" />
          </LinkButton>
          <ExternalButton href={whatsappHref(MENSAJE)} variant="outline">
            Escríbenos por WhatsApp
            <ChatIcon className="size-4" />
          </ExternalButton>
        </div>
      </div>

      <ul className="divide-y divide-line border-y border-line lg:col-span-7">
        {SERVICIOS.map((s) => (
          <li key={s.titulo} className="flex gap-4 py-5">
            <Square tone="red" angle={19} className="mt-2 size-2" />
            <div>
              <p className="font-heading text-lg font-semibold">{s.titulo}</p>
              <p className="mt-1 max-w-[60ch] leading-relaxed text-ink-muted text-pretty">
                {s.texto}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
