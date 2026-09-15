import { LinkButton } from '../ui/Button'
import { ArrowRightIcon } from '../ui/Icon'
import { HeroMosaic } from './HeroMosaic'

export function Hero() {
  return (
    <section className="relative">
      {/* Móvil: banda de fotos arriba, texto debajo.
          Desktop: mosaico a sangre con el texto superpuesto a la derecha. */}
      <div className="relative aspect-[2/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full">
        <HeroMosaic />
        {/* Velo de legibilidad: el titular no compite con las caras */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-l from-cream from-30% via-cream/85 via-55% to-transparent lg:block"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:grid lg:min-h-[38rem] lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="hidden lg:block" />
        <div className="lg:pl-10">
          <p className="mb-4 font-heading text-xs font-semibold tracking-[0.18em] text-brand-red-deep uppercase">
            Formación bonificada y subvencionada
          </p>
          <h1 className="font-heading text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            No te pares<span className="text-brand-red">!</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted text-pretty">
            Cursos diseñados para que sigas creciendo en tu puesto de trabajo.
            Nosotros gestionamos tu crédito de formación; tú solo te ocupas de
            aprender.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton to="/contacto" variant="primary" size="lg">
              Solicita información
              <ArrowRightIcon className="size-4" />
            </LinkButton>
            <LinkButton to="/formacion" variant="accent" size="lg">
              Consulta tus créditos
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}
