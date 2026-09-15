import { TESTIMONIALS } from '../../data/testimonials'

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function Testimonials() {
  return (
    <section className="bg-white/60 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="mb-3 text-center font-heading text-3xl font-semibold tracking-tight">
          Lo que dicen nuestros estudiantes
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-ink-muted">
          Historias reales de personas que dieron el siguiente paso.
        </p>

        <ul className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <li
              key={item.name}
              className="flex flex-col rounded-2xl bg-cream p-7 ring-1 ring-line transition-shadow duration-200 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="mb-5 font-heading text-4xl leading-none text-brand-yellow-deep"
              >
                &ldquo;
              </span>
              <blockquote className="flex-1 leading-relaxed text-ink-muted text-pretty">
                {item.quote}
              </blockquote>

              <div className="mt-7 flex items-center gap-4 border-t border-line pt-5">
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-red/10 font-heading text-sm font-semibold text-brand-red-deep"
                  >
                    {initials(item.name)}
                  </span>
                )}
                <div>
                  <p className="font-heading text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-ink-muted">{item.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
