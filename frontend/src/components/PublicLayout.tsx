import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from './ui'
import ScrollToTop from './ScrollToTop'

const links = [
  { to: '/equipment', label: 'Equipment' },
  { to: '/status', label: 'Booking Status' },
  { to: '/about', label: 'How it works' },
]

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'text-navy-700 bg-navy-50' : 'text-slate-600 hover:text-slate-900'}`

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navClass}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/admin/login" className="btn-secondary btn-sm ml-3">
              Staff login
            </Link>
          </nav>
          <button className="rounded-md p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-slate-100 px-4 py-3 md:hidden" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/admin/login" className={navClass} onClick={() => setOpen(false)}>
              Staff login
            </NavLink>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>Equipment loan &amp; hire for South Australian community groups.</p>
          <p>© {new Date().getFullYear()} Community Resource Network SA</p>
        </div>
      </footer>
    </div>
  )
}
