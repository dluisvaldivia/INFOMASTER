import { ComingSoon, PageHeader } from '../components/ui/PageHeader'
import { CONTACT } from '../data/nav'
import { MailIcon, PhoneIcon, PinIcon } from '../components/ui/Icon'

export function Contacto() {
  return (
    <PageHeader
      eyebrow="Contacto"
      title="Hablemos"
      intro="Cuéntanos qué necesitas y te decimos qué curso encaja y cuánto crédito puedes aprovechar. Sin compromiso."
    >
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        <li className="rounded-2xl bg-white/70 p-6 ring-1 ring-line">
          <PinIcon className="mb-3 size-5 text-brand-yellow-deep" />
          <p className="font-heading text-sm font-semibold">{CONTACT.company}</p>
          <p className="mt-1 text-sm text-ink-muted">{CONTACT.address}</p>
        </li>
        <li className="rounded-2xl bg-white/70 p-6 ring-1 ring-line">
          <PhoneIcon className="mb-3 size-5 text-brand-yellow-deep" />
          <a
            href={CONTACT.phoneHref}
            className="font-heading text-sm font-semibold transition-colors hover:text-brand-red-deep"
          >
            {CONTACT.phone}
          </a>
        </li>
        <li className="rounded-2xl bg-white/70 p-6 ring-1 ring-line">
          <MailIcon className="mb-3 size-5 text-brand-yellow-deep" />
          <a
            href={CONTACT.emailHref}
            className="font-heading text-sm font-semibold break-all transition-colors hover:text-brand-red-deep"
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
