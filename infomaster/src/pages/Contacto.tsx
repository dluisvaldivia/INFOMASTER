import { ComingSoon, PageHeader } from '../components/ui/PageHeader'
import { CONTACT } from '../data/nav'
import { MailIcon, PhoneIcon, PinIcon } from '../components/ui/Icon'

export function Contacto() {
  return (
    <PageHeader
      title="Hablemos"
      intro="Cuéntanos qué necesitas y te decimos qué curso encaja y cuánto crédito puedes aprovechar. Sin compromiso."
    >
      <ul className="mt-14 grid border-y border-ink sm:grid-cols-3">
        <li className="border-t border-line py-6 first:border-t-0 sm:border-t-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
          <PinIcon className="mb-4 size-5 text-brand-red-deep" />
          <p className="font-heading text-base font-semibold">{CONTACT.company}</p>
          <p className="mt-1 text-sm text-ink-muted">{CONTACT.address}</p>
        </li>
        <li className="border-t border-line py-6 first:border-t-0 sm:border-t-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
          <PhoneIcon className="mb-4 size-5 text-brand-red-deep" />
          <a
            href={CONTACT.phoneHref}
            className="font-heading text-base font-semibold transition-colors hover:text-brand-red-deep"
          >
            {CONTACT.phone}
          </a>
        </li>
        <li className="border-t border-line py-6 first:border-t-0 sm:border-t-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
          <MailIcon className="mb-4 size-5 text-brand-red-deep" />
          <a
            href={CONTACT.emailHref}
            className="font-heading text-base font-semibold break-all transition-colors hover:text-brand-red-deep"
          >
            {CONTACT.email}
          </a>
        </li>
      </ul>

      <ComingSoon
        items={[
          'Formulario de solicitud de información',
          'Mapa con la ubicación del centro',
          'Horario de atención',
        ]}
      />
    </PageHeader>
  )
}
