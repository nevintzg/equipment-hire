import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/AppStore'
import AvailabilityCalendar from '../../components/AvailabilityCalendar'
import { Badge, PageHeader } from '../../components/ui'
import { unitsFreeOn } from '../../lib/availability'
import { formatDate, formatRange, today } from '../../lib/dates'

export default function AdminCalendar() {
  const { equipment, bookings } = useStore()
  const [eqId, setEqId] = useState(equipment[0]?.id ?? '')
  const [day, setDay] = useState(today())
  const eq = equipment.find((e) => e.id === eqId)

  const onDay = bookings
    .filter((b) => b.equipmentId === eqId && b.startDate <= day && day <= b.endDate && b.status !== 'Declined' && b.status !== 'Cancelled')
    .sort((a, b) => a.status.localeCompare(b.status))

  return (
    <>
      <PageHeader title="Availability calendar" subtitle="Units free per day. Approved and confirmed bookings hold stock; pending requests don't yet." />
      <div className="mb-5 max-w-sm">
        <label htmlFor="eq" className="field-label">
          Equipment
        </label>
        <select id="eq" className="input" value={eqId} onChange={(e) => setEqId(e.target.value)}>
          {equipment.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.quantity}){e.active ? '' : ' — inactive'}
            </option>
          ))}
        </select>
      </div>

      {eq && (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="card p-5">
            <AvailabilityCalendar key={eq.id} equipment={eq} bookings={bookings} detailed onDayClick={setDay} activeDay={day} />
          </div>
          <section className="card h-fit p-5">
            <h2 className="font-semibold">{formatDate(day)}</h2>
            <p className="text-sm text-slate-500">
              {unitsFreeOn(eq, bookings, day)} of {eq.quantity} free
            </p>
            <ul className="mt-4 space-y-3">
              {onDay.map((b) => (
                <li key={b.id}>
                  <Link to={`/admin/bookings/${b.id}`} className="block rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">#{b.id}</span>
                      <Badge>{b.status}</Badge>
                    </div>
                    <p className="mt-1 text-slate-700">{b.organisation}</p>
                    <p className="text-slate-500">
                      {b.quantity} units · {formatRange(b.startDate, b.endDate)}
                    </p>
                  </Link>
                </li>
              ))}
              {onDay.length === 0 && <li className="text-sm text-slate-500">No bookings on this day.</li>}
            </ul>
          </section>
        </div>
      )}
    </>
  )
}
