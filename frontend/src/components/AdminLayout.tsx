import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Scale,
  UserCircle,
} from 'lucide-react'
import { useStore } from '../store/AppStore'
import { Logo } from './ui'
import ScrollToTop from './ScrollToTop'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/equipment', label: 'Equipment', icon: Package },
  { to: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/rules', label: 'Booking Rules', icon: Scale },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/account', label: 'Account', icon: UserCircle },
]

export default function AdminLayout() {
  const { admin, logout, bookings } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  const pending = bookings.filter((b) => b.status === 'Pending').length

  const doLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
      isActive ? 'bg-navy-50 text-navy-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <div className="min-h-screen lg:flex">
      <ScrollToTop />
      <aside className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:h-screen lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-4 lg:px-5">
          <Logo admin to="/admin" />
          <button onClick={doLogout} className="btn-secondary btn-sm lg:hidden">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pt-2" aria-label="Admin">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={itemClass}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
              {label === 'Bookings' && pending > 0 && (
                <span className="ml-auto rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-800">{pending}</span>
              )}
            </NavLink>
          ))}
          <button onClick={doLogout} className={`${itemClass({ isActive: false })} hidden lg:mt-4 lg:flex`}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
          </button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
