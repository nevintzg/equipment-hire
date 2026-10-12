import { Link } from 'react-router-dom'
import { useStore } from '../../store/AppStore'
import { currency } from '../../lib/dates'

// eslint-disable-next-line react-refresh/only-export-components
export const STEPS = [
  { title: 'Find equipment', body: 'Browse the catalogue by category and see photos, condition and quantity.' },
  { title: 'Check availability', body: 'The calendar on each item shows which dates are already booked.' },
  { title: 'Submit a request', body: 'Pick your dates and quantity, add your organisation details and send it to CRN SA.' },
  { title: 'Get approval & pay', body: 'Once staff approve it, pay the hire fee and refundable deposit online to confirm.' },
]

export default function HowItWorks() {
  const { rules } = useStore()
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">How equipment hire works</h1>
      <ol className="mt-8 space-y-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-600 font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{s.title}</h2>
              <p className="text-slate-600">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section id="conditions" className="card mt-12 scroll-mt-24 p-6">
        <h2 className="text-lg font-bold">Booking conditions</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Requests must be made at least {rules.minLeadDays} days before the hire date.</li>
          <li>The longest single hire is {rules.maxHireDays} days.</li>
          <li>A refundable deposit of {currency(rules.depositAmount)} is paid with the hire fee.</li>
          <li>
            Cancel more than {rules.noticeDays} days before your hire date: {rules.earlyRefundPercent}% of the hire fee
            refunded.
          </li>
          <li>
            Cancel within {rules.noticeDays} days: {rules.lateRefundPercent}% of the hire fee refunded.
          </li>
          <li>Deposits are refunded in full on cancellation, or when equipment is returned in good condition.</li>
        </ul>
        <p className="mt-4 text-sm text-slate-600">{rules.conditions}</p>
      </section>

      <Link to="/equipment" className="btn-primary mt-8">
        Browse equipment
      </Link>
    </div>
  )
}
