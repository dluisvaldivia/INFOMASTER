import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { CAMPUS_URL, NAV_ITEMS } from '../../data/nav'
import { Logo } from '../ui/Logo'
import { CloseIcon, ExternalIcon, HomeIcon, MenuIcon } from '../ui/Icon'

const LINK_BASE =
  'relative font-heading text-[13px] font-medium uppercase tracking-[0.08em] ' +
  'transition-colors duration-200 hover:text-brand-red-deep'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    LINK_BASE,
    'py-1',
    isActive
      ? 'text-brand-red-deep after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-brand-red'
      : 'text-ink-muted',
  ].join(' ')
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
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <nav
        aria-label="Principal"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8"
      >
        <NavLink to="/" aria-label="Infomaster Formación — Inicio" className="shrink-0">
          <Logo className="h-11 w-auto" />
        </NavLink>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={navLinkClass} end={item.to === '/'}>
                <span className="inline-flex items-center gap-1.5">
                  {item.label}
                  {item.to === '/' && <HomeIcon className="size-3.5" />}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={CAMPUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 font-heading text-[12px] font-semibold tracking-[0.08em] text-white uppercase shadow-[0_6px_18px_-8px_rgba(217,61,45,0.9)] transition-colors duration-200 hover:bg-brand-red-deep sm:inline-flex"
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
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-cream-deep lg:hidden"
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
            className="absolute inset-x-0 z-40 border-b border-line bg-cream px-5 pt-2 pb-6 shadow-lg lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      [
                        'block border-b border-line/70 py-4 font-heading text-sm font-medium tracking-[0.06em] uppercase',
                        isActive ? 'text-brand-red-deep' : 'text-ink',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <a
              href={CAMPUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-5 py-3.5 font-heading text-sm font-semibold tracking-[0.08em] text-white uppercase"
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
