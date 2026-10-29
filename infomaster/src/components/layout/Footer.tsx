import { Link } from 'react-router'
import { ACCREDITATIONS, CERTIFICATIONS } from '../../data/clients'
import { CAMPUS_URL, CONTACT, NAV_ITEMS } from '../../data/nav'
import { LogoPlaceholder } from '../ui/LogoPlaceholder'
import { Logo } from '../ui/Logo'
import { MailIcon, PhoneIcon, PinIcon } from '../ui/Icon'
import { SquareTrio } from '../ui/Square'

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-cream">
      {/* El trío del logo a escala de cartel, recortado por el borde. */}
      <SquareTrio className="pointer-events-none absolute -right-16 -bottom-24 h-[26rem] w-auto opacity-90 max-md:hidden" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <h2 className="font-heading text-base font-semibold text-cream lg:col-span-4">
            Centro acreditado
          </h2>
          <div className="grid grid-cols-2 gap-px bg-cream/20 sm:grid-cols-3 lg:col-span-8">
            {ACCREDITATIONS.map((entry) => (
              <LogoPlaceholder key={entry.name} entry={entry} />
            ))}
          </div>
        </div>

        <div className="grid gap-12 border-t border-cream/25 pt-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo tone="light" className="mb-5 h-12 w-auto" />
            <p className="max-w-xs text-sm leading-relaxed text-cream/75">
              Formación bonificada y subvencionada para empresas y trabajadores.
              Gestionamos tu crédito de formación de principio a fin.
            </p>
          </div>

          <div>
            <h2 className="mb-5 font-heading text-base font-semibold text-cream">
              Contacto
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <PinIcon className="mt-0.5 size-4 shrink-0 text-brand-yellow" />
                <span className="font-semibold">{CONTACT.company}</span>
              </li>
              <li className="flex items-start gap-3">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-brand-yellow" />
                <a
                  href={CONTACT.phoneHref}
                  className="text-cream/75 transition-colors hover:text-brand-yellow"
                >
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-brand-yellow" />
                <a
                  href={CONTACT.emailHref}
                  className="break-all text-cream/75 transition-colors hover:text-brand-yellow"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-heading text-base font-semibold text-cream">
              Navegación
            </h2>
            <ul className="space-y-3 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-cream/75 transition-colors hover:text-brand-yellow"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={CAMPUS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/75 transition-colors hover:text-brand-yellow"
                >
                  Campus virtual
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start gap-6 border-t border-cream/25 pt-8 sm:flex-row sm:items-center sm:justify-between md:pr-56">
          <p className="text-xs text-cream/70">
            © {new Date().getFullYear()} Infomaster Formación. Todos los derechos
            reservados.
          </p>
          <div className="w-28">
            {CERTIFICATIONS.map((entry) => (
              <LogoPlaceholder key={entry.name} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
