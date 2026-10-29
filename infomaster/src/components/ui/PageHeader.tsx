import type { ReactNode } from 'react'
import { Square } from './Square'

type Props = {
  title: string
  intro: string
  children?: ReactNode
}

export function PageHeader({ title, intro, children }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 lg:px-8 lg:pt-20 lg:pb-20">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <h1 className="text-[clamp(2.75rem,7vw,5rem)] leading-[0.95] font-bold tracking-[-0.035em] [font-stretch:125%] lg:col-span-8">
          {title}
        </h1>
        <p className="max-w-[52ch] text-lg leading-relaxed text-ink-muted text-pretty lg:col-span-4 lg:self-end">
          {intro}
        </p>
      </div>
      {children}
    </section>
  )
}

/** Bloque provisional para las secciones cuyo contenido aún no está definido. */
export function ComingSoon({ items }: { items: string[] }) {
  return (
    <div className="mt-14 grid gap-6 border-t border-ink pt-6 lg:grid-cols-12 lg:gap-8">
      <p className="font-heading text-base font-semibold lg:col-span-4">Contenido en preparación</p>
      <ul className="divide-y divide-line border-y border-line text-ink-muted lg:col-span-8">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-4 py-3.5">
            <Square tone="yellow" className="size-2" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
