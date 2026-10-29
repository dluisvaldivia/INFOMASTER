import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { CAMPUS_URL, NAV_ITEMS } from '../../data/nav'
import { Logo } from '../ui/Logo'
import { Square } from '../ui/Square'
import { CloseIcon, ExternalIcon, HomeIcon, MenuIcon } from '../ui/Icon'

const LINK_BASE =
  'inline-flex items-center gap-2 py-1 font-heading text-[15px] font-medium ' +
  'transition-colors duration-200 hover:text-brand-red-deep'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [LINK_BASE, isActive ? 'text-ink' : 'text-ink-muted'].join(' ')
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // cerrar al navegar
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Escape + foco atrapado mientras el drawer está abierto
  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    panel?.querySelector<HTMLElement>('a, button')?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const focusables = panel.querySelectorAll<HTMLElement>('a[href], button')
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-cream">
      <nav
        aria-label="Principal"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8"
      >
        <NavLink to="/" aria-label="Infomaster Formación — Inicio" className="shrink-0">
          <Logo className="h-11 w-auto" />
        </NavLink>

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={navLinkClass} end={item.to === '/'}>
                {({ isActive }) => (
                  <>
                    {/* La página actual se marca con el cuadrado de la marca. */}
                    <Square
                      angle={18}
                      className={['size-2 transition-opacity', isActive ? '' : 'opacity-0'].join(' ')}
                    />
                    {item.label}
                    {item.to === '/' && <HomeIcon className="size-3.5" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={CAMPUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 items-center gap-2 bg-brand-red px-5 font-heading text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-red-deep sm:inline-flex"
          >
            Campus virtual
            <ExternalIcon className="size-3.5" />
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="inline-flex size-11 cursor-pointer items-center justify-center text-ink transition-colors duration-200 hover:bg-cream-deep lg:hidden"
          >
            {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-20 z-30 cursor-default bg-ink/20 lg:hidden"
          />
          <div
            id="menu-movil"
            ref={panelRef}
            className="absolute inset-x-0 z-40 border-b border-ink bg-cream px-5 pt-2 pb-6 lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      [
                        'flex items-center justify-between border-b border-line py-4 font-heading text-lg font-medium',
                        isActive ? 'text-brand-red-deep' : 'text-ink',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive && <Square angle={18} className="size-2.5" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
            <a
              href={CAMPUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-brand-red px-5 font-heading text-base font-semibold text-white transition-colors hover:bg-brand-red-deep"
            >
              Campus virtual
              <ExternalIcon className="size-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                toggleRef.current?.focus()
              }}
              className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 py-2 text-sm text-ink-muted"
            >
              <CloseIcon className="size-4" />
              Cerrar
            </button>
          </div>
        </>
      )}
    </header>
  )
}
