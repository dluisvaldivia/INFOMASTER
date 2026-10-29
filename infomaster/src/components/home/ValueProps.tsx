import { Link } from 'react-router'
import { VALOR_PRINCIPAL, VALUE_PROPS, type ValueProp } from '../../data/valueProps'
import { LinkButton } from '../ui/Button'
import { ArrowRightIcon, ExternalIcon } from '../ui/Icon'
import { Square } from '../ui/Square'

/**
 * Por qué Infomaster: el argumento del coste cero en grande y, debajo, el
 * resto como filas de tabla. Asimetría a propósito: no son seis cosas iguales.
 */
export function ValueProps() {
  return (
    <section aria-labelledby="valor-title" className="pt-20 lg:pt-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-8 border-t border-ink pt-8 lg:grid-cols-12 lg:gap-8 lg:pt-10">
          <h2
            id="valor-title"
            className="text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.95] font-bold tracking-[-0.035em] [font-stretch:125%] lg:col-span-7"
          >
            Formación a coste{' '}
            {/* Amarillo = resaltado: el sistema lo reserva para esto. */}
            <mark className="bg-brand-yellow px-[0.06em] text-ink">cero</mark>
          </h2>

          <div className="lg:col-span-5 lg:pt-3">
            <p className="max-w-[52ch] text-lg leading-relaxed text-ink text-pretty">
              {VALOR_PRINCIPAL.texto}
            </p>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-muted text-pretty">
              {VALOR_PRINCIPAL.cierre}
            </p>
            <LinkButton to="/formacion#calculadora" variant="primary" size="lg" className="mt-8">
              Calcula tu crédito
              <ArrowRightIcon className="size-4" />
            </LinkButton>
          </div>
        </div>

        <ul className="mt-16 divide-y divide-line border-y border-line lg:mt-20">
          {VALUE_PROPS.map((prop, index) => (
            <ValueRow key={prop.id} prop={prop} angle={index % 2 === 0 ? 19 : -27} />
          ))}
        </ul>
      </div>
    </section>
  )
}

function ValueRow({ prop, angle }: { prop: ValueProp; angle: 19 | -27 }) {
  return (
    <li id={prop.id} className="grid scroll-mt-24 gap-3 py-7 lg:grid-cols-12 lg:gap-8 lg:py-9">
      <div className="flex items-start gap-4 lg:col-span-5">
        <Square tone={prop.nota ? 'yellow' : 'red'} angle={angle} className="mt-2.5 size-2.5" />
        <div>
          <h3 className="text-xl leading-tight font-bold tracking-[-0.015em] sm:text-2xl">
            {prop.titulo}
          </h3>
          {prop.nota && (
            <span className="mt-2 inline-block bg-brand-yellow px-2 py-0.5 font-heading text-xs font-semibold text-ink">
              {prop.nota}
            </span>
          )}
        </div>
      </div>

      <div className="pl-6.5 lg:col-span-7 lg:pl-0">
        <p className="max-w-[60ch] leading-relaxed text-ink-muted text-pretty">{prop.texto}</p>
        {prop.enlace && <RowLink {...prop.enlace} />}
      </div>
    </li>
  )
}

const LINK =
  'mt-3 inline-flex min-h-11 items-center gap-1.5 font-heading text-sm font-semibold ' +
  'text-brand-red-deep underline underline-offset-4 hover:text-brand-red-dark'

function RowLink({ texto, href, externo }: NonNullable<ValueProp['enlace']>) {
  if (externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
        {texto}
        <ExternalIcon className="size-3.5" />
        <span className="sr-only">(se abre en una pestaña nueva)</span>
      </a>
    )
  }
  return (
    <Link to={href} className={LINK}>
      {texto}
      <ArrowRightIcon className="size-3.5" />
    </Link>
  )
}
