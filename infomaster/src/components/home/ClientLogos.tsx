import { CLIENTS } from '../../data/clients'
import { LogoPlaceholder } from '../ui/LogoPlaceholder'
import { SectionHeading } from '../ui/SectionHeading'

export function ClientLogos() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <SectionHeading title="Nuestros clientes">
        Empresas de toda Andalucía que forman a sus equipos con nosotros.
      </SectionHeading>

      {/* Rejilla de bordes compartidos: una tabla de logos, no seis tarjetas. */}
      <ul className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-3 lg:grid-cols-6">
        {CLIENTS.map((entry) => (
          <li key={entry.name} className="border-r border-b border-line">
            <LogoPlaceholder entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  )
}
