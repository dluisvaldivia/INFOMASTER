import { Link } from 'react-router'
import { ACCREDITATIONS, CERTIFICATIONS } from '../../data/clients'
import { CAMPUS_URL, CONTACT, NAV_ITEMS } from '../../data/nav'
import { LogoPlaceholder } from '../ui/LogoPlaceholder'
import { Logo } from '../ui/Logo'
import { MailIcon, PhoneIcon, PinIcon } from '../ui/Icon'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white/60">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-14">
          <p className="mb-6 text-center font-heading text-xs tracking-[0.16em] text-ink-muted uppercase">
            Centro acreditado
          </p>
          <div className="mx-auto grid max-w-3xl grid-cols-2 items-center gap-5 sm:grid-cols-3">
            {ACCREDITATIONS.map((entry) => (
              <LogoPlaceholder key={entry.name} entry={entry} />
            ))}
          </div>
        </div>

        <div className="grid gap-12 border-t border-line pt-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo className="mb-5 h-12 w-auto" />
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              Formación bonificada y subvencionada para empresas y trabajadores.
              Gestionamos tu crédito de formación de principio a fin.
            </p>
          </div>

          <div>
            <h2 className="mb-5 font-heading text-sm font-bold tracking-[0.14em] uppercase">
              Contacto
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <PinIcon className="mt-0.5 size-4 shrink-0 text-brand-yellow-deep" />
                <span className="font-semibold">{CONTACT.company}</span>
              </li>
              <li className="flex items-start gap-3">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-brand-yellow-deep" />
                <a
                  href={CONTACT.phoneHref}
                  className="text-ink-muted transition-colors hover:text-brand-red-deep"
                >
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-brand-yellow-deep" />
                <a
                  href={CONTACT.emailHref}
                  className="break-all text-ink-muted transition-colors hover:text-brand-red-deep"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-heading text-sm font-bold tracking-[0.14em] uppercase">
              Navegación
            </h2>
            <ul className="space-y-3 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-ink-muted transition-colors hover:text-brand-red-deep"
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
                  className="text-ink-muted transition-colors hover:text-brand-red-deep"
                >
                  Campus virtual
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-line pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-ink-muted">
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
