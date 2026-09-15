import { ComingSoon, PageHeader } from '../components/ui/PageHeader'

export function Nosotros() {
  return (
    <PageHeader
      eyebrow="Nosotros"
      title="Expertos en Formación MVG"
      intro="Somos un centro de formación andaluz. Acompañamos a empresas y trabajadores en todo el proceso: desde elegir el curso adecuado hasta cerrar la bonificación."
    >
      <ComingSoon
        items={[
          'Historia y trayectoria del centro',
          'Equipo docente',
          'Acreditaciones y homologaciones',
          'Instalaciones y ubicación',
        ]}
      />
    </PageHeader>
  )
}
