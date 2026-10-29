import type { ReactNode } from 'react'

/**
 * Cabecera de sección editorial: filete de tinta a todo el ancho, titular a la
 * izquierda y entradilla en la columna derecha (apilados en móvil).
 */
type Props = {
  title: string
  children?: ReactNode
  id?: string
}

export function SectionHeading({ title, children, id }: Props) {
  return (
    <div className="mb-10 grid gap-4 border-t border-ink pt-6 lg:mb-14 lg:grid-cols-12 lg:gap-8">
      <h2
        id={id}
        className="text-3xl leading-[1.05] font-bold tracking-[-0.02em] sm:text-4xl lg:col-span-7"
      >
        {title}
      </h2>
      {children && (
        <p className="max-w-[52ch] text-ink-muted text-pretty lg:col-span-5 lg:pt-1">{children}</p>
      )}
    </div>
  )
}
