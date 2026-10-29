import { TESTIMONIALS } from '../../data/testimonials'
import { SectionHeading } from '../ui/SectionHeading'
import { Square } from '../ui/Square'

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
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <SectionHeading title="Lo que dicen nuestros estudiantes">
        Historias reales de personas que dieron el siguiente paso.
      </SectionHeading>

      <ul className="grid md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <li
            key={item.name}
            className="flex flex-col border-t border-line py-8 first:border-t-0 first:pt-0 md:border-t-0 md:border-l md:px-8 md:py-0 md:first:border-l-0 md:first:pl-0"
          >
            {/* El cuadrado girado de la marca hace de comilla. */}
            <Square angle={18} className="mb-6 size-3.5" />
            <blockquote className="flex-1 text-lg leading-relaxed text-ink text-pretty">
              {item.quote}
            </blockquote>

            <div className="mt-8 flex items-center gap-4">
              {item.photo ? (
                <img
                  src={item.photo}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="size-12 object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center bg-brand-yellow font-heading text-sm font-semibold text-ink"
                >
                  {initials(item.name)}
                </span>
              )}
              <div>
                <p className="font-heading text-sm font-semibold">{item.name}</p>
                <p className="text-sm text-ink-muted">{item.role}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
