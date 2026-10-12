import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, DollarSign, Package, Plus, Scale, type LucideIcon } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Badge, EmptyState, PageHeader } from '../../components/ui'
import { currency, formatRange, today } from '../../lib/dates'

export default function Dashboard() {
  const { bookings, equipment, equipmentById, admin } = useStore()
  const t = today()
  const pending = bookings.filter((b) => b.status === 'Pending').sort((a, b) => a.startDate.localeCompare(b.startDate))
  const upcoming = bookings
    .filter((b) => (b.status === 'Confirmed' || b.status === 'Approved') && b.endDate >= t)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  const outstanding = bookings.filter((b) => b.status === 'Approved' && b.paymentStatus === 'Unpaid')
  const outstandingTotal = outstanding.reduce((s, b) => s + b.deposit, 0)
  const activeItems = equipment.filter((e) => e.active)
  const units = activeItems.reduce((s, e) => s + e.quantity, 0)

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${admin?.name}.`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={ClipboardList} label="Pending requests" value={pending.length} to="/admin/bookings?status=Pending" tone="amber" />
        <Stat icon={CalendarDays} label="Upcoming bookings" value={upcoming.length} to="/admin/reports?tab=upcoming" tone="sky" />
        <Stat icon={Package} label="Equipment items" value={units} note={`${activeItems.length} product lines`} to="/admin/equipment" tone="navy" />
        <Stat icon={DollarSign} label="Outstanding deposits" value={currency(outstandingTotal)} to="/admin/payments" tone="emerald" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_18rem]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold">Pending requests</h2>
            <Link to="/admin/bookings?status=Pending" className="text-sm font-medium text-navy-600 hover:underline">
              View all
            </Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState>No requests waiting. Nice work.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">ID</th>
                    <th className="th">Organisation</th>
                    <th className="th">Equipment</th>
                    <th className="th">Dates</th>
                    <th className="th text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pending.slice(0, 6).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="td font-semibold">#{b.id}</td>
                      <td className="td">{b.organisation}</td>
                      <td className="td">
                        {b.quantity} × {equipmentById(b.equipmentId)?.name}
                      </td>
                      <td className="td">{formatRange(b.startDate, b.endDate)}</td>
                      <td className="td text-right">
                        <Link to={`/admin/bookings/${b.id}`} className="btn-primary btn-sm">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Quick actions</h2>
            <div className="mt-3 grid gap-2">
              <Link to="/admin/equipment/new" className="btn-secondary justify-start">
                <Plus className="h-4 w-4" /> Add equipment
              </Link>
              <Link to="/admin/calendar" className="btn-secondary justify-start">
                <CalendarDays className="h-4 w-4" /> Check availability
              </Link>
              <Link to="/admin/rules" className="btn-secondary justify-start">
                <Scale className="h-4 w-4" /> Edit booking rules
              </Link>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Next out the door</h2>
            <ul className="mt-3 space-y-3">
              {upcoming.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <Link to={`/admin/bookings/${b.id}`} className="flex items-start justify-between gap-2 text-sm hover:underline">
                    <span>
                      <span className="font-medium">{formatRange(b.startDate, b.endDate)}</span>
                      <span className="block text-slate-500">
                        {b.quantity} × {equipmentById(b.equipmentId)?.name}
                      </span>
                    </span>
                    <Badge>{b.status}</Badge>
                  </Link>
                </li>
              ))}
              {upcoming.length === 0 && <li className="text-sm text-slate-500">Nothing booked.</li>}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}

const tones = {
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  navy: 'bg-navy-50 text-navy-700',
  emerald: 'bg-emerald-50 text-emerald-700',
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
  to,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  note?: string
  to: string
  tone: keyof typeof tones
}) {
  return (
    <Link to={to} className="card p-5 transition hover:shadow-md">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {note && <p className="text-xs text-slate-500">{note}</p>}
    </Link>
  )
}
