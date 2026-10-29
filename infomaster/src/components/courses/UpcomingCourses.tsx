import { CONVOCATORIAS, type Convocatoria } from '../../data/convocatorias'
import { CONTACT } from '../../data/nav'
import {
  datesLabel,
  daysBetween,
  monthShort,
  monthYear,
  parseDay,
  rhythm,
  startOfToday,
  weekdayShort,
} from '../../lib/fechas'
import { LinkButton } from '../ui/Button'
import { SectionHeading } from '../ui/SectionHeading'
import { ArrowRightIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../ui/Icon'

type Upcoming = Convocatoria & {
  id: string
  days: Date[]
  startsIn: number
  inProgress: boolean
}

/** Ordena, descarta lo ya terminado y calcula el estado de cada convocatoria. */
function upcoming(today: Date): Upcoming[] {
  return CONVOCATORIAS.map((conv) => {
    const days = [...conv.dias].sort().map(parseDay)
    return {
      ...conv,
      id: `${conv.curso}-${conv.dias.join('-')}`,
      days,
      startsIn: daysBetween(today, days[0]),
      inProgress: daysBetween(today, days[0]) < 0,
    }
  })
    .filter((conv) => daysBetween(today, conv.days[conv.days.length - 1]) >= 0)
    .sort((a, b) => a.days[0].getTime() - b.days[0].getTime() || a.curso.localeCompare(b.curso))
}

function groupByMonth(list: Upcoming[]) {
  const groups: { label: string; items: Upcoming[] }[] = []
  for (const conv of list) {
    const label = monthYear(conv.days[0])
    const group = groups.at(-1)
    if (group?.label === label) group.items.push(conv)
    else groups.push({ label, items: [conv] })
  }
  return groups
}

function status(conv: Upcoming) {
  if (conv.inProgress) return 'En curso'
  if (conv.startsIn === 0) return 'Empieza hoy'
  if (conv.startsIn === 1) return 'Empieza mañana'
  if (conv.startsIn <= 14) return `Empieza en ${conv.startsIn} días`
  return null
}

/** Correo que ya dice qué curso y qué fechas: nadie tiene que preguntar "¿cuál?". */
function mailHref(conv: Upcoming) {
  const fechas = datesLabel(conv.days)
  const subject = `Información: ${conv.curso} (${fechas})`
  const body =
    `Hola, me interesa el curso de ${conv.curso} en ${conv.sede}, ` +
    `los días ${fechas} de ${conv.days[0].getFullYear()}.\n\n` +
    'Nombre:\nEmpresa (si aplica):\nTeléfono:\nNúmero de personas:\n'
  return `${CONTACT.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Fecha como dato de tabla: número grande tabular, día y mes en versalitas. */
function DateStamp({ day }: { day: Date }) {
  return (
    <div aria-hidden="true" className="w-16 shrink-0 sm:w-20">
      <span className="block font-heading text-5xl leading-[0.85] font-bold tracking-[-0.04em] tabular-nums [font-stretch:125%] sm:text-6xl">
        {day.getDate()}
      </span>
      <span className="mt-2 block font-heading text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
        {weekdayShort(day)}
        <br />
        {monthShort(day)}
      </span>
    </div>
  )
}

function CourseRow({ conv }: { conv: Upcoming }) {
  const badge = status(conv)
  const fechas = datesLabel(conv.days)

  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-5 py-6 transition-colors duration-200 hover:bg-cream-deep sm:gap-x-8 lg:-mx-4 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-4">
      <DateStamp day={conv.days[0]} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h4 className="text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
            {conv.curso}
          </h4>
          {badge && (
            <span className="bg-brand-yellow px-2 py-0.5 font-heading text-xs font-semibold text-ink">
              {badge}
            </span>
          )}
        </div>

        <p className="sr-only">
          {fechas} de {conv.days[0].getFullYear()}.
        </p>

        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
          <li className="flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            <span className="tabular-nums">{conv.horas} horas</span>
            {conv.horario && <span>· {conv.horario}</span>}
          </li>
          <li className="flex items-center gap-1.5">
            <PinIcon className="size-4" />
            {conv.modalidad} · {conv.sede}
          </li>
        </ul>

        <div aria-hidden="true" className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 basis-full text-sm font-medium text-ink sm:basis-auto">{rhythm(conv.days)}</span>
          {conv.days.map((day) => (
            <span
              key={day.getTime()}
              className="border border-line px-2 py-1 font-heading text-xs font-medium tabular-nums text-ink"
            >
              {weekdayShort(day)} {day.getDate()} {monthShort(day)}
            </span>
          ))}
        </div>
      </div>

      <div className="col-span-2 flex gap-2 lg:col-span-1">
        <a
          href={mailHref(conv)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 bg-brand-red px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-red-deep lg:flex-none"
        >
          <MailIcon className="size-4" />
          Pedir información
          <span className="sr-only">
            sobre {conv.curso}, {fechas}
          </span>
        </a>
        <a
          href={CONTACT.phoneHref}
          aria-label={`Llamar para preguntar por ${conv.curso}`}
          title={CONTACT.phone}
          className="inline-flex size-11 shrink-0 items-center justify-center border border-ink text-ink transition-colors duration-200 hover:bg-ink hover:text-cream"
        >
          <PhoneIcon className="size-4" />
        </a>
      </div>
    </li>
  )
}

type Props = {
  /** En la portada se muestran solo las primeras; en /cursos, todas. */
  limit?: number
}

export function UpcomingCourses({ limit }: Props) {
  const all = upcoming(startOfToday())
  const shown = limit ? all.slice(0, limit) : all
  const hidden = all.length - shown.length

  return (
    <section id="proximos-cursos" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading title="Próximos cursos">
          Grupos presenciales con fecha cerrada. Pide información y te contamos horario,
          precio y plazas disponibles.
        </SectionHeading>

        {shown.length === 0 ? (
          <div className="border-y border-line py-10">
            <p className="font-heading font-semibold">Ahora mismo no hay grupos con fecha.</p>
            <p className="mt-2 text-sm text-ink-muted">
              Escríbenos a{' '}
              <a href={CONTACT.emailHref} className="text-brand-red-deep underline underline-offset-4">
                {CONTACT.email}
              </a>{' '}
              y te avisamos del próximo.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupByMonth(shown).map((group) => (
              <div key={group.label}>
                <h3 className="border-b border-line pb-3 font-heading text-sm font-semibold tracking-[0.08em] text-ink-muted uppercase">
                  {group.label}
                </h3>
                <ol className="divide-y divide-line">
                  {group.items.map((conv) => (
                    <CourseRow key={conv.id} conv={conv} />
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        {hidden > 0 && (
          <div className="mt-10 border-t border-line pt-8">
            <LinkButton to="/cursos#proximos-cursos" variant="outline">
              Ver las {all.length} fechas
              <ArrowRightIcon className="size-4" />
            </LinkButton>
          </div>
        )}
      </div>
    </section>
  )
}
