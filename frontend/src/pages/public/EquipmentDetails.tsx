import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import AvailabilityCalendar from '../../components/AvailabilityCalendar'
import { Badge, ConditionText, DetailRow, EquipmentImage } from '../../components/ui'
import { unitsFreeForRange, unitsFreeOn } from '../../lib/availability'
import { currency, formatRange, hireDays, today } from '../../lib/dates'
import NotFound from './NotFound'

export default function EquipmentDetails() {
  const { id } = useParams()
  const { equipmentById, bookings } = useStore()
  const navigate = useNavigate()
  const eq = equipmentById(id ?? '')
  const [image, setImage] = useState(0)
  const [range, setRange] = useState<{ start?: string; end?: string }>({})

  if (!eq || !eq.active) return <NotFound />

  const freeToday = unitsFreeOn(eq, bookings, today())

  // First click picks the hire date, second click the return date; a click before the start restarts.
  const pickDay = (d: string) =>
    setRange((r) => (!r.start || r.end || d < r.start ? { start: d } : { start: r.start, end: d }))

  const freeInRange = range.start ? unitsFreeForRange(eq, bookings, range.start, range.end ?? range.start) : null

  const request = () => {
    const p = new URLSearchParams({ equipment: eq.id })
    if (range.start) p.set('start', range.start)
    if (range.start) p.set('end', range.end ?? range.start)
    navigate(`/request?${p}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/equipment" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to catalogue
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="card overflow-hidden">
            {eq.images.length ? (
              <img src={eq.images[image]} alt={eq.name} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <EquipmentImage eq={eq} className="aspect-[4/3] w-full" />
            )}
          </div>
          {eq.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {eq.images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setImage(i)}
                  className={`h-16 w-20 overflow-hidden rounded-lg ring-2 ${i === image ? 'ring-navy-600' : 'ring-transparent'}`}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-semibold tracking-wide text-navy-600 uppercase">{eq.category}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{eq.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{`${freeToday} available today`}</Badge>
              <Badge>{eq.condition}</Badge>
            </div>
            <p className="mt-4 text-slate-700">{eq.description}</p>
            <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
              <DetailRow label="Quantity">{eq.quantity} in stock</DetailRow>
              <DetailRow label="Condition">
                <ConditionText condition={eq.condition} />
              </DetailRow>
              <DetailRow label="Status">{freeToday > 0 ? 'Available' : 'Fully booked today'}</DetailRow>
              <DetailRow label="Hire rate">{currency(eq.dailyRate)} per item per day</DetailRow>
            </dl>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarCheck className="h-5 w-5 text-navy-600" /> Availability
            </h2>
            <p className="mt-1 mb-4 text-sm text-slate-600">
              Pick your hire date, then your return date, to check how many are free.
            </p>
            <AvailabilityCalendar equipment={eq} bookings={bookings} selection={range} onDayClick={pickDay} />

            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm" aria-live="polite">
              {range.start && freeInRange !== null ? (
                <>
                  <p className="font-medium text-slate-900">
                    {formatRange(range.start, range.end ?? range.start)} · {hireDays(range.start, range.end ?? range.start)}{' '}
                    day(s)
                  </p>
                  <p className={freeInRange > 0 ? 'text-emerald-700' : 'text-red-700'}>
                    {freeInRange > 0
                      ? `${freeInRange} of ${eq.quantity} available for all of these dates.`
                      : 'Fully booked on at least one of these dates. Try other dates.'}
                  </p>
                  {!range.end && <p className="mt-1 text-slate-500">Now pick your return date (or request a single day).</p>}
                </>
              ) : (
                <p className="text-slate-600">No dates selected yet.</p>
              )}
            </div>

            <button onClick={request} disabled={freeInRange === 0} className="btn-primary mt-5 w-full py-3 text-base">
              Request to hire
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
