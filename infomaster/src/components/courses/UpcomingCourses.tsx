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

function DateStamp({ day }: { day: Date }) {
  return (
    <div
      aria-hidden="true"
      className="flex w-16 shrink-0 flex-col overflow-hidden rounded-xl bg-white text-center ring-1 ring-line sm:w-20"
    >
      {/* blanco sobre brand-red = 4,51:1 → AA */}
      <span className="bg-brand-red py-1 font-heading text-[0.7rem] font-semibold tracking-wide text-white uppercase">
        {weekdayShort(day)}
      </span>
      <span className="pt-1.5 font-heading text-2xl leading-none font-bold tabular-nums sm:text-3xl">
        {day.getDate()}
      </span>
      <span className="pb-2 text-xs text-ink-muted">{monthShort(day)}</span>
    </div>
  )
}

function CourseRow({ conv }: { conv: Upcoming }) {
  const badge = status(conv)
  const fechas = datesLabel(conv.days)

  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 rounded-2xl p-4 transition-colors duration-200 hover:bg-white sm:gap-x-6 sm:p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
      <DateStamp day={conv.days[0]} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h4 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            {conv.curso}
          </h4>
          {badge && (
            <span className="rounded-full bg-brand-yellow px-2.5 py-0.5 font-heading text-xs font-semibold text-ink">
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
              className="rounded-md bg-cream-deep px-2 py-1 font-heading text-xs font-medium tabular-nums text-ink"
            >
              {weekdayShort(day)} {day.getDate()} {monthShort(day)}
            </span>
          ))}
        </div>
      </div>

      <div className="col-span-2 flex gap-2 lg:col-span-1">
        <a
          href={mailHref(conv)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand-red px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-red-deep lg:flex-none"
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
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white/70 text-ink transition-colors duration-200 hover:border-brand-red hover:text-brand-red-deep"
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
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <div className="mb-10">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Próximos cursos
          </h2>
          <p className="mt-3 max-w-xl text-ink-muted text-pretty">
            Grupos presenciales con fecha cerrada. Pide información y te contamos horario,
            precio y plazas disponibles.
          </p>
        </div>

        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white/60 p-8 text-center">
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
                <h3 className="mb-2 flex items-center gap-4 font-heading text-sm font-semibold text-ink-muted">
                  {group.label}
                  <span aria-hidden="true" className="h-px flex-1 bg-line" />
                </h3>
                <ol className="-mx-4 divide-y divide-line sm:-mx-5">
                  {group.items.map((conv) => (
                    <CourseRow key={conv.id} conv={conv} />
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        {hidden > 0 && (
          <div className="mt-10 flex justify-center">
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
