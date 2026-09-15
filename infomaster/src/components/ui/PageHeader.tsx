import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: string
  intro: string
  children?: ReactNode
}

export function PageHeader({ eyebrow, title, intro, children }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-28">
      <p className="mb-4 font-heading text-xs font-semibold tracking-[0.18em] text-brand-red-deep uppercase">
        {eyebrow}
      </p>
      <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-muted text-pretty">{intro}</p>
      {children}
    </section>
  )
}

/** Bloque provisional para las secciones cuyo contenido aún no está definido. */
export function ComingSoon({ items }: { items: string[] }) {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-line bg-white/60 p-8">
      <p className="mb-5 font-heading text-sm font-semibold">
        Contenido en preparación
      </p>
      <ul className="space-y-3 text-sm text-ink-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 block size-1.5 shrink-0 rounded-full bg-brand-yellow-deep"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
