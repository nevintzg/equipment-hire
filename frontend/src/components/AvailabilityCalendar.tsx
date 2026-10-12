import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Booking, Equipment } from '../types'
import { monthGrid, monthLabel, parseISO, today } from '../lib/dates'
import { pendingOn, unitsFreeOn } from '../lib/availability'

interface Props {
  equipment: Equipment
  bookings: Booking[]
  /** Highlighted date range, e.g. the dates the hirer has picked. */
  selection?: { start?: string; end?: string }
  onDayClick?: (date: string) => void
  /** Staff view: show units free on every day and flag pending requests. */
  detailed?: boolean
  activeDay?: string
  initialDate?: string
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AvailabilityCalendar({
  equipment,
  bookings,
  selection,
  onDayClick,
  detailed = false,
  activeDay,
  initialDate,
}: Props) {
  const start = parseISO(initialDate ?? today())
  const [ym, setYm] = useState({ y: start.getFullYear(), m: start.getMonth() })
  const t = today()

  const shift = (n: number) =>
    setYm(({ y, m }) => {
      const d = new Date(y, m + n, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const inSelection = (d: string) => {
    const { start: s, end: e } = selection ?? {}
    if (s && e) return d >= s && d <= e
    return d === s
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} className="rounded-md p-1.5 hover:bg-slate-100" aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-sm font-semibold text-slate-900" aria-live="polite">
          {monthLabel(ym.y, ym.m)}
        </h3>
        <button type="button" onClick={() => shift(1)} className="rounded-md p-1.5 hover:bg-slate-100" aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <table className="w-full table-fixed border-separate border-spacing-1">
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} className="pb-1 text-center text-[11px] font-medium text-slate-500">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(ym.y, ym.m).map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => {
                if (!d) return <td key={j} />
                const past = d < t
                const free = unitsFreeOn(equipment, bookings, d)
                const pending = detailed ? pendingOn(bookings, equipment.id, d) : 0
                const selected = inSelection(d)
                const tone = past
                  ? 'bg-slate-50 text-slate-300'
                  : selected
                    ? 'bg-navy-600 text-white ring-2 ring-navy-600'
                    : free === 0
                      ? 'bg-red-100 text-red-800'
                      : free < equipment.quantity
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-50 text-emerald-900'
                const status = past ? 'past' : free === 0 ? 'fully booked' : `${free} of ${equipment.quantity} available`
                const clickable = onDayClick && (detailed || !past)
                return (
                  <td key={j} className="p-0">
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => onDayClick?.(d)}
                      aria-label={`${parseISO(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}: ${status}${pending ? `, ${pending} pending` : ''}`}
                      aria-pressed={selected || undefined}
                      className={`relative flex w-full flex-col items-center justify-center rounded-md text-sm font-medium transition ${
                        detailed ? 'h-14' : 'h-10'
                      } ${tone} ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-navy-600/40' : 'cursor-default'} ${
                        activeDay === d ? 'ring-2 ring-slate-900' : ''
                      } ${d === t && !selected ? 'underline decoration-2 underline-offset-2' : ''}`}
                    >
                      {parseISO(d).getDate()}
                      {detailed && !past && (
                        <span className="text-[10px] font-normal opacity-80">
                          {free}/{equipment.quantity}
                        </span>
                      )}
                      {pending > 0 && !past && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                      )}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
        <Legend className="bg-emerald-50 ring-1 ring-emerald-200" label="Available" />
        <Legend className="bg-amber-100" label="Partly booked" />
        <Legend className="bg-red-100" label="Fully booked" />
        {selection && <Legend className="bg-navy-600" label="Your dates" />}
        {detailed && (
          <li className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending request
          </li>
        )}
      </ul>
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </li>
  )
}
