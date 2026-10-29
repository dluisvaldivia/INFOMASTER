import { Hero } from '../components/home/Hero'
import { ClientLogos } from '../components/home/ClientLogos'
import { Testimonials } from '../components/home/Testimonials'
import { UpcomingCourses } from '../components/courses/UpcomingCourses'

export function Home() {
  return (
    <>
      <Hero />
      <UpcomingCourses limit={4} />
      <ClientLogos />
      <Testimonials />
    </>
  )
}
