import { LinkButton } from '../ui/Button'
import { ArrowRightIcon } from '../ui/Icon'
import { LogoMark } from '../ui/Square'
import { HeroMosaic } from './HeroMosaic'

export function Hero() {
  return (
    <section>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-12 pb-16 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-20 lg:pb-24">
        <div className="lg:col-span-7 lg:pr-8">
          <h1 className="flex items-end gap-[0.12em] text-[clamp(3.25rem,10vw,6rem)] leading-[0.92] font-bold tracking-[-0.035em] [font-stretch:125%]">
            <span>
              No te
              <br />
              pares<span className="sr-only">!</span>
            </span>
            {/* Los cuadrados del logo hacen de exclamación. */}
            <LogoMark animated className="mb-[0.08em] h-[0.95em] w-auto shrink-0" />
          </h1>

          <p className="mt-8 max-w-[34ch] text-xl leading-snug text-ink text-pretty sm:text-2xl">
            Cursos diseñados para que sigas creciendo en tu puesto de trabajo.
          </p>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-muted text-pretty">
            Nosotros gestionamos tu crédito de formación; tú solo te ocupas de aprender.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton to="/contacto" variant="primary" size="lg">
              Solicita información
              <ArrowRightIcon className="size-4" />
            </LinkButton>
            <LinkButton to="/formacion#calculadora" variant="outline" size="lg">
              Consulta tus créditos
            </LinkButton>
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroMosaic />
        </div>
      </div>
    </section>
  )
}
