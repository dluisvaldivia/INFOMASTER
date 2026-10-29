/**
 * Fechas de convocatorias. Todo se calcula a partir de la lista de días,
 * así nadie tiene que redactar a mano "Días 07,14 y 28 nov.".
 */
const DAY_MS = 86_400_000

const WEEKDAY = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
const MONTH_SHORT = new Intl.DateTimeFormat('es-ES', { month: 'short' })
const MONTH_LONG = new Intl.DateTimeFormat('es-ES', { month: 'long' })

const WEEKDAY_PLURAL = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados']

/** "2026-11-07" → fecha local (sin desfase de zona horaria). */
export function parseDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function daysBetween(from: Date, to: Date) {
  // Math.round absorbe el cambio de hora de octubre/marzo
  return Math.round((to.getTime() - from.getTime()) / DAY_MS)
}

export function weekdayShort(date: Date) {
  return WEEKDAY.format(date).replace('.', '')
}

export function monthShort(date: Date) {
  return MONTH_SHORT.format(date).replace('.', '')
}

export function monthYear(date: Date) {
  const month = MONTH_LONG.format(date)
  return `${month[0].toUpperCase()}${month.slice(1)} ${date.getFullYear()}`
}

function isConsecutive(days: Date[]) {
  return days.every((day, i) => i === 0 || daysBetween(days[i - 1], day) === 1)
}

function joinEs(items: string[]) {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`
}

/** Resumen del ritmo: "1 jornada", "3 días seguidos", "3 sábados", "3 jornadas". */
export function rhythm(days: Date[]) {
  if (days.length === 1) return '1 jornada'
  if (isConsecutive(days)) return `${days.length} días seguidos`
  const weekday = days[0].getDay()
  if (days.every((day) => day.getDay() === weekday)) {
    return `${days.length} ${WEEKDAY_PLURAL[weekday]}`
  }
  return `${days.length} jornadas`
}

/** Frase completa: "4 al 6 de noviembre", "7, 14 y 28 de noviembre", "28 de noviembre y 3 de diciembre". */
export function datesLabel(days: Date[]) {
  const first = days[0]
  const last = days[days.length - 1]
  if (days.length > 1 && isConsecutive(days)) {
    const sameMonth = first.getMonth() === last.getMonth()
    const head = sameMonth ? `${first.getDate()}` : `${first.getDate()} de ${MONTH_LONG.format(first)}`
    return `${head} al ${last.getDate()} de ${MONTH_LONG.format(last)}`
  }

  const byMonth: Date[][] = []
  for (const day of days) {
    const group = byMonth.at(-1)
    if (group && group[0].getMonth() === day.getMonth()) group.push(day)
    else byMonth.push([day])
  }
  return joinEs(
    byMonth.map(
      (group) => `${joinEs(group.map((d) => `${d.getDate()}`))} de ${MONTH_LONG.format(group[0])}`,
    ),
  )
}
