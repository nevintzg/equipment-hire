import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Check, CreditCard, X } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Badge, DetailRow, EquipmentImage, Field } from '../../components/ui'
import { refundPercent } from '../../lib/availability'
import { currency, formatDate, formatDateTime, formatRange, today } from '../../lib/dates'
import type { Booking } from '../../types'

export default function BookingStatusPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { bookings, myRequests } = useStore()

  if (id) {
    const b = bookings.find((x) => x.id === Number(id))
    const email = params.get('email')?.toLowerCase()
    // Hirers can see a booking if they made it on this device or know the email it was made with.
    const allowed = b && (myRequests.includes(b.id) || b.email.toLowerCase() === email)
    if (b && allowed) return <BookingView booking={b} />
    return <Lookup initialId={id} failed />
  }
  return <Lookup />
}

function Lookup({ initialId = '', failed = false }: { initialId?: string; failed?: boolean }) {
  const { bookings, myRequests, equipmentById } = useStore()
  const navigate = useNavigate()
  const [id, setId] = useState(initialId)
  const [email, setEmail] = useState('')
  const mine = bookings.filter((b) => myRequests.includes(b.id)).reverse()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/status/${id.replace(/\D/g, '')}?email=${encodeURIComponent(email.trim())}`)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Booking status</h1>
      <p className="mt-1 text-slate-600">Look up a hire request with its ID and the email you used.</p>

      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        {failed && (
          <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" /> We couldn't find a request with that ID and email.
          </p>
        )}
        <Field label="Request ID" htmlFor="rid">
          <input id="rid" className="input" placeholder="e.g. 1024" value={id} onChange={(e) => setId(e.target.value)} required />
        </Field>
        <Field label="Email" htmlFor="remail">
          <input id="remail" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full">Find my booking</button>
      </form>

      {mine.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold">Requests made on this device</h2>
          <ul className="card mt-3 divide-y divide-slate-100">
            {mine.map((b) => (
              <li key={b.id}>
                <Link to={`/status/${b.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                  <span>
                    <span className="font-semibold">#{b.id}</span>{' '}
                    <span className="text-slate-600">
                      {b.quantity} × {equipmentById(b.equipmentId)?.name} · {formatRange(b.startDate, b.endDate)}
                    </span>
                  </span>
                  <Badge>{b.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

const STAGES = ['Submitted', 'Approved', 'Paid', 'Confirmed'] as const

function stageIndex(b: Booking): number {
  if (b.status === 'Confirmed') return 3
  if (b.status === 'Approved') return 1
  return 0
}

function BookingView({ booking: b }: { booking: Booking }) {
  const { equipmentById, rules, cancel } = useStore()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const eq = equipmentById(b.equipmentId)
  const t = today()
  const canCancel = ['Pending', 'Approved', 'Confirmed'].includes(b.status) && b.startDate > t
  const pct = refundPercent(rules, b.startDate)
  const ended = b.status === 'Declined' || b.status === 'Cancelled'
  const stage = stageIndex(b)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/status" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Booking status
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Request #{b.id}</h1>
        <Badge>{b.status}</Badge>
      </div>

      {!ended ? (
        <ol className="mt-6 grid grid-cols-4 gap-2">
          {STAGES.map((s, i) => (
            <li key={s} className="text-center">
              <div className={`h-1.5 rounded-full ${i <= stage ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <p className={`mt-2 text-xs font-medium ${i <= stage ? 'text-slate-900' : 'text-slate-400'}`}>{s}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
          This request was {b.status.toLowerCase()}
          {b.statusReason ? `: ${b.statusReason}` : '.'}
          {b.refundAmount !== undefined && ` ${currency(b.refundAmount)} of the hire fee and your deposit have been refunded.`}
        </p>
      )}

      {b.status === 'Pending' && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          CRN SA staff are reviewing your request. We'll email you when it's approved.
        </div>
      )}

      {b.status === 'Approved' && (
        <div className="mt-6 flex flex-col gap-4 rounded-lg border border-sky-200 bg-sky-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-sky-900">Approved — payment needed to confirm</p>
            <p className="text-sm text-sky-800">
              Pay {currency(b.hireCost + b.deposit)} (includes {currency(b.deposit)} refundable deposit).
            </p>
          </div>
          <Link to={`/pay/${b.id}`} className="btn-primary shrink-0">
            <CreditCard className="h-4 w-4" /> Pay now
          </Link>
        </div>
      )}

      {b.status === 'Confirmed' && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <Check className="h-5 w-5 shrink-0" /> Booking confirmed. Collect your equipment from the CRN SA depot on{' '}
          {formatDate(b.startDate)}.
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_16rem]">
        <div className="card p-6">
          {eq && (
            <div className="mb-4 flex items-center gap-4">
              <EquipmentImage eq={eq} className="h-16 w-20 shrink-0 rounded-lg" />
              <div>
                <p className="font-semibold">
                  {b.quantity} × {eq.name}
                </p>
                <p className="text-sm text-slate-600">{formatRange(b.startDate, b.endDate)}</p>
              </div>
            </div>
          )}
          <dl className="divide-y divide-slate-100 border-t border-slate-100">
            <DetailRow label="Organisation">{b.organisation}</DetailRow>
            <DetailRow label="Contact">{b.contactName}</DetailRow>
            <DetailRow label="Hire dates">
              {formatDate(b.startDate)} – {formatDate(b.endDate)}
            </DetailRow>
            <DetailRow label="Hire cost">{currency(b.hireCost)}</DetailRow>
            <DetailRow label="Refundable deposit">{currency(b.deposit)}</DetailRow>
            <DetailRow label="Payment">
              <Badge>{b.paymentStatus}</Badge>
            </DetailRow>
            <DetailRow label="Deposit">
              <Badge>{b.depositStatus}</Badge>
            </DetailRow>
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900">History</h2>
          <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
            {b.history.map((h, i) => (
              <li key={i} className="text-sm">
                <p className="text-slate-800">{h.text}</p>
                <p className="text-xs text-slate-500">{formatDateTime(h.at)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {canCancel && (
        <div className="mt-8 border-t border-slate-200 pt-6">
          {!confirmCancel ? (
            <button className="btn-danger" onClick={() => setConfirmCancel(true)}>
              <X className="h-4 w-4" /> Cancel this request
            </button>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5" role="alert">
              <p className="font-semibold text-red-900">Cancel request #{b.id}?</p>
              <p className="mt-1 text-sm text-red-800">
                {b.paymentStatus === 'Paid'
                  ? `Under the cancellation rules you'll get ${pct}% of the hire fee back (${currency(
                      Math.round((b.hireCost * pct) / 100),
                    )}) plus your full ${currency(b.deposit)} deposit.`
                  : "You haven't paid anything, so there's nothing to refund."}
              </p>
              <div className="mt-4 flex gap-3">
                <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={() => cancel(b.id, 'hirer')}>
                  Yes, cancel it
                </button>
                <button className="btn-secondary" onClick={() => setConfirmCancel(false)}>
                  Keep booking
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
