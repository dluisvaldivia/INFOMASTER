/**
 * Reglas del crédito de formación programada (FUNDAE), simplificadas para dar
 * una cifra orientativa. Fuente: Ley de Presupuestos Generales del Estado
 * (prorrogada) y RD 694/2017. La cifra oficial solo la da FUNDAE.
 */

/** Cuota de formación profesional: 0,60 % empresa + 0,10 % trabajador. */
export const FP_RATE = 0.007

/** Crédito mínimo garantizado (empresas de 1 a 5 personas y de nueva creación). */
export const MIN_CREDIT = 420

/** Empresas de nueva creación: importe por persona incorporada. */
export const NEW_COMPANY_PER_WORKER = 65

export const OFFICIAL_SIMULATOR_URL = 'https://simuladorcredito.fundae.es/'

type Bracket = { max: number; label: string; rate: number }

/** Porcentaje de bonificación sobre la cuota según plantilla media. */
const BRACKETS: Bracket[] = [
  { max: 5, label: '1 a 5', rate: 1 },
  { max: 9, label: '6 a 9', rate: 1 },
  { max: 49, label: '10 a 49', rate: 0.75 },
  { max: 249, label: '50 a 249', rate: 0.6 },
  { max: Infinity, label: '250 o más', rate: 0.5 },
]

/** Incremento por persona en ERTE o Mecanismo RED que recibe formación. */
const ERTE_BRACKETS: { max: number; amount: number }[] = [
  { max: 9, amount: 425 },
  { max: 49, amount: 400 },
  { max: Infinity, amount: 320 },
]

export type CreditInput =
  | {
      kind: 'new'
      newWorkers: number
      erteWorkers: number
    }
  | {
      kind: 'existing'
      headcount: number
      /** Cuota de FP ingresada el año anterior (ya calculada o estimada). */
      fpQuota: number
      erteWorkers: number
    }

export type CreditLine = { label: string; value: number }

export type CreditResult = {
  base: number
  erte: number
  total: number
  lines: CreditLine[]
  notes: string[]
}

function bracketFor(headcount: number) {
  return BRACKETS.find((b) => headcount <= b.max) ?? BRACKETS[BRACKETS.length - 1]
}

function erteAmountFor(headcount: number) {
  return (ERTE_BRACKETS.find((b) => headcount <= b.max) ?? ERTE_BRACKETS[0]).amount
}

export function calculateCredit(input: CreditInput): CreditResult {
  const lines: CreditLine[] = []
  const notes: string[] = []
  let base: number
  let headcount: number

  if (input.kind === 'new') {
    headcount = input.newWorkers
    const raw = input.newWorkers * NEW_COMPANY_PER_WORKER
    base = Math.max(raw, MIN_CREDIT)
    lines.push({ label: `${input.newWorkers} × ${NEW_COMPANY_PER_WORKER} € por persona incorporada`, value: raw })
    notes.push(
      `Empresa de nueva creación: el crédito resulta de multiplicar las personas del primer boletín de cotización por ${NEW_COMPANY_PER_WORKER} €, con un mínimo garantizado de ${MIN_CREDIT} €.`,
    )
  } else {
    headcount = input.headcount
    const bracket = bracketFor(input.headcount)
    const raw = input.fpQuota * bracket.rate
    lines.push({ label: 'Cuota de formación profesional del año anterior', value: input.fpQuota })
    lines.push({
      label: `× ${Math.round(bracket.rate * 100)} % (plantilla de ${bracket.label} personas)`,
      value: raw,
    })
    base = input.headcount <= 5 ? Math.max(raw, MIN_CREDIT) : raw
    if (input.headcount <= 5) {
      notes.push(`Las empresas de 1 a 5 personas tienen garantizado un crédito mínimo de ${MIN_CREDIT} €.`)
    }
    notes.push(
      'El crédito es un porcentaje de lo que la empresa cotizó por formación profesional el año anterior (0,70 % de la base de contingencias profesionales), que depende del tamaño de la plantilla media.',
    )
  }

  if (base > lines[lines.length - 1].value) {
    lines.push({ label: 'Ajuste al mínimo garantizado', value: base })
  }

  const erte = input.erteWorkers > 0 ? input.erteWorkers * erteAmountFor(headcount) : 0
  if (erte > 0) {
    lines.push({
      label: `+ ${input.erteWorkers} × ${erteAmountFor(headcount)} € por persona en ERTE formada`,
      value: erte,
    })
    notes.push(
      'El incremento por ERTE o Mecanismo RED solo se aplica si esas personas reciben formación mientras dura la medida.',
    )
  }

  return { base, erte, total: base + erte, lines, notes }
}

const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function formatEuro(value: number) {
  return EUR.format(Math.round(value))
}
