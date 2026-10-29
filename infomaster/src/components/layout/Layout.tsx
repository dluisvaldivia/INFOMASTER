import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ChatWidget } from '../chat/ChatWidget'

export function Layout() {
  const { pathname, hash } = useLocation()

  // el router no reposiciona el scroll por sí solo en una SPA; con #ancla
  // (p. ej. /formacion#calculadora) baja hasta la sección
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) target.scrollIntoView({ block: 'start' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-brand-red focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Saltar al contenido
      </a>

      <Navbar />

      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* El chat vive en el layout: presente en todas las rutas. */}
      <ChatWidget />
    </div>
  )
}
