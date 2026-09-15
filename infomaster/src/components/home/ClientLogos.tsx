import { CLIENTS } from '../../data/clients'
import { LogoPlaceholder } from '../ui/LogoPlaceholder'

export function ClientLogos() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <h2 className="mb-3 text-center font-heading text-3xl font-semibold tracking-tight">
        Nuestros clientes
      </h2>
      <p className="mx-auto mb-12 max-w-xl text-center text-ink-muted">
        Empresas de toda Andalucía que forman a sus equipos con nosotros.
      </p>

      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {CLIENTS.map((entry) => (
          <li key={entry.name}>
            <LogoPlaceholder entry={entry} className="hover:shadow-md" />
          </li>
        ))}
      </ul>
    </section>
  )
}
