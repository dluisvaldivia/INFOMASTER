import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { SectionHeading } from '../ui/SectionHeading'
import { Square } from '../ui/Square'
import { ForCompanies } from './ForCompanies'
import { ForWorkers } from './ForWorkers'

type Audience = 'empresa' | 'trabajador'

const TABS: { value: Audience; label: string }[] = [
  { value: 'empresa', label: 'Soy empresa' },
  { value: 'trabajador', label: 'Soy trabajador' },
]

/**
 * El mismo servicio con dos puertas: la empresa que quiere formar a su
 * plantilla y el trabajador que quiere un curso. Pestañas ARIA con flechas.
 */
export function ServicesSection({ defaultAudience = 'empresa' }: { defaultAudience?: Audience }) {
  const [active, setActive] = useState<Audience>(defaultAudience)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: TABS.length - 1,
    }
    if (!(event.key in keys)) return
    event.preventDefault()
    const next = (keys[event.key] + TABS.length) % TABS.length
    setActive(TABS[next].value)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="servicios" aria-labelledby="servicios-title" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading id="servicios-title" title="Formación para empresas y para trabajadores">
          Es el mismo servicio con dos puntos de partida: tu empresa quiere formar a su equipo, o
          tú quieres un curso y necesitas que tu empresa lo apruebe.
        </SectionHeading>

        <div role="tablist" aria-label="¿Quién eres?" className="flex">
          {TABS.map((tab, i) => {
            const selected = active === tab.value
            return (
              <button
                key={tab.value}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${tab.value}`}
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.value)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={[
                  'flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-3 border border-ink px-5 font-heading font-semibold transition-colors duration-200 sm:flex-none sm:px-8 sm:text-lg',
                  selected ? 'bg-ink text-cream' : 'text-ink hover:bg-cream-deep',
                  i > 0 ? '-ml-px' : '',
                ].join(' ')}
              >
                <Square
                  tone={selected ? 'yellow' : 'ink'}
                  angle={selected ? 19 : 0}
                  className="size-2.5 transition-transform duration-300"
                />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${active}`}
          className="mt-12 lg:mt-16"
        >
          {active === 'empresa' ? <ForCompanies /> : <ForWorkers />}
        </div>
      </div>
    </section>
  )
}
