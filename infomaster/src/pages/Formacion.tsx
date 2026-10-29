import { ComingSoon, PageHeader } from '../components/ui/PageHeader'

export function Formacion() {
  return (
    <PageHeader
      title="Formación bonificada y subvencionada"
      intro="Tu empresa dispone cada año de un crédito para formar a su plantilla. Nosotros calculamos a cuánto asciende, tramitamos la bonificación ante FUNDAE y nos ocupamos de toda la documentación."
    >
      <ComingSoon
        items={[
          'Qué es el crédito de formación y cómo se calcula',
          'Requisitos para acogerse a la bonificación',
          'Documentación y plazos de tramitación',
          'Calculadora de crédito disponible',
        ]}
      />
    </PageHeader>
  )
}
