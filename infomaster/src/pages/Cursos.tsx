import { UpcomingCourses } from '../components/courses/UpcomingCourses'
import { ComingSoon, PageHeader } from '../components/ui/PageHeader'

export function Cursos() {
  return (
    <>
      <PageHeader
        title="Nuestro catálogo"
        intro="Cursos presenciales, online y en modalidad mixta, diseñados para aplicarse desde el primer día en el puesto de trabajo."
      >
        <ComingSoon
          items={[
            'Catálogo completo por familias profesionales',
            'Fichas de curso con temario, duración y modalidad',
            'Buscador con filtros por área y formato',
          ]}
        />
      </PageHeader>
      <UpcomingCourses />
    </>
  )
}
