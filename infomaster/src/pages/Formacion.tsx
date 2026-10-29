import { ForCompanies } from '../components/services/ForCompanies'
import { ForWorkers } from '../components/services/ForWorkers'
import { CreditCalculator } from '../components/credit/CreditCalculator'
import { ComingSoon, PageHeader } from '../components/ui/PageHeader'
import { SectionHeading } from '../components/ui/SectionHeading'

export function Formacion() {
  return (
    <>
      <PageHeader
        title="Formación bonificada y subvencionada"
        intro="Tu empresa dispone cada año de un crédito para formar a su plantilla. Nosotros calculamos a cuánto asciende, tramitamos la bonificación ante FUNDAE y nos ocupamos de toda la documentación."
      />

      <section
        id="empresas"
        aria-labelledby="empresas-title"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-20 lg:px-8 lg:pb-24"
      >
        <div className="border-t border-ink pt-10">
          <ForCompanies headingLevel="h2" headingId="empresas-title" />
        </div>
      </section>

      <section
        id="trabajadores"
        aria-labelledby="trabajadores-title"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-20 lg:px-8 lg:pb-24"
      >
        <div className="border-t border-ink pt-10">
          <ForWorkers headingLevel="h2" headingId="trabajadores-title" />
        </div>
      </section>

      <section
        id="calculadora"
        aria-labelledby="calculadora-title"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-20 lg:px-8 lg:pb-24"
      >
        <SectionHeading id="calculadora-title" title="Calcula tu crédito de formación">
          Una estimación en un minuto, con las mismas reglas que aplica FUNDAE. Para la cifra
          exacta, te la confirmamos nosotros.
        </SectionHeading>
        <CreditCalculator />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <ComingSoon
          items={[
            'Qué es el crédito de formación y cómo se calcula',
            'Requisitos para acogerse a la bonificación',
            'Documentación y plazos de tramitación',
          ]}
        />
      </section>
    </>
  )
}
