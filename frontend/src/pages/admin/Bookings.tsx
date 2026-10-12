import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Badge, EmptyState, PageHeader, Tabs } from '../../components/ui'
import { BOOKING_STATUSES, type BookingStatus } from '../../types'
import { currency, formatRange } from '../../lib/dates'

const TABS = ['All', ...BOOKING_STATUSES] as const
type Tab = (typeof TABS)[number]

export default function Bookings() {
  const { bookings, equipmentById } = useStore()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = (TABS.includes(params.get('status') as Tab) ? params.get('status') : 'All') as Tab
  const q = params.get('q') ?? ''

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v && v !== 'All') next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  const counts = Object.fromEntries(TABS.map((t) => [t, t === 'All' ? bookings.length : bookings.filter((b) => b.status === t).length])) as Record<Tab, number>

  const rows = bookings
    .filter((b) => tab === 'All' || b.status === (tab as BookingStatus))
    .filter((b) => {
      if (!q) return true
      const hay = `${b.id} ${b.organisation} ${b.contactName} ${b.email} ${equipmentById(b.equipmentId)?.name}`.toLowerCase()
      return hay.includes(q.toLowerCase())
    })
    .sort((a, b) => (a.status === 'Pending' ? -1 : 0) - (b.status === 'Pending' ? -1 : 0) || a.startDate.localeCompare(b.startDate))

  return (
    <>
      <PageHeader title="Booking management" subtitle="Review requests and manage every booking." />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs options={TABS} value={tab} onChange={(v) => set('status', v)} counts={counts} />
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" className="input pl-9" placeholder="Search ID, organisation…" aria-label="Search bookings" value={q} onChange={(e) => set('q', e.target.value)} />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">ID</th>
              <th className="th">Organisation</th>
              <th className="th">Equipment</th>
              <th className="th">Dates</th>
              <th className="th text-right">Total</th>
              <th className="th">Payment</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((b) => (
              <tr key={b.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/admin/bookings/${b.id}`)}>
                <td className="td font-semibold">
                  <Link to={`/admin/bookings/${b.id}`} className="text-navy-700 hover:underline" onClick={(e) => e.stopPropagation()}>
                    #{b.id}
                  </Link>
                </td>
                <td className="td">{b.organisation}</td>
                <td className="td">
                  {b.quantity} × {equipmentById(b.equipmentId)?.name}
                </td>
                <td className="td">{formatRange(b.startDate, b.endDate)}</td>
                <td className="td text-right">{currency(b.hireCost)}</td>
                <td className="td">
                  <Badge>{b.paymentStatus}</Badge>
                </td>
                <td className="td">
                  <Badge>{b.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState>No bookings here.</EmptyState>}
      </div>
    </>
  )
}
