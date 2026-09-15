import { LinkButton } from '../components/ui/Button'
import { ArrowRightIcon } from '../components/ui/Icon'

export function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-28 text-center lg:px-8">
      <p className="mb-4 font-heading text-xs font-semibold tracking-[0.18em] text-brand-red-deep uppercase">
        Error 404
      </p>
      <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        Esta página no existe
      </h1>
      <p className="mx-auto mt-6 max-w-md text-lg text-ink-muted">
        Puede que el enlace esté mal escrito o que hayamos movido el contenido.
      </p>
      <div className="mt-9 flex justify-center">
        <LinkButton to="/" size="lg">
          Volver al inicio
          <ArrowRightIcon className="size-4" />
        </LinkButton>
      </div>
    </section>
  )
}
