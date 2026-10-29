import { LinkButton } from '../components/ui/Button'
import { ArrowRightIcon } from '../components/ui/Icon'

export function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <p
        aria-hidden="true"
        className="font-heading text-[clamp(5rem,18vw,6rem)] leading-none font-bold tracking-[-0.04em] text-line tabular-nums [font-stretch:125%]"
      >
        404
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
        Esta página no existe
      </h1>
      <p className="mt-6 max-w-md text-lg text-ink-muted">
        Puede que el enlace esté mal escrito o que hayamos movido el contenido.
      </p>
      <div className="mt-9 flex">
        <LinkButton to="/" size="lg">
          Volver al inicio
          <ArrowRightIcon className="size-4" />
        </LinkButton>
      </div>
    </section>
  )
}
