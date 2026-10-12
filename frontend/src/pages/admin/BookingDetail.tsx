import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Check, Undo2, X } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Badge, DetailRow, EquipmentImage, PageHeader } from '../../components/ui'
import { overlappingBookings, unitsFreeForRange } from '../../lib/availability'
import { currency, formatDate, formatDateTime, formatRange, hireDays, today } from '../../lib/dates'
import NotFound from '../public/NotFound'

export default function BookingDetail() {
  const { id } = useParams()
  const { bookings, equipmentById, approve, decline, cancel, refundDeposit } = useStore()
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'none' | 'decline' | 'cancel'>('none')
  const [reason, setReason] = useState('')

  const b = bookings.find((x) => x.id === Number(id))
  if (!b) return <NotFound message="That booking doesn't exist." />
  const eq = equipmentById(b.equipmentId)
  const free = eq ? unitsFreeForRange(eq, bookings, b.startDate, b.endDate, b.id) : 0
  const clashes = overlappingBookings(bookings, b.equipmentId, b.startDate, b.endDate).filter((x) => x.id !== b.id)
  const t = today()

  const doApprove = () => {
    const r = approve(b.id)
    setError(r.ok ? '' : r.error)
  }

  const confirmReason = () => {
    if (mode === 'decline') decline(b.id, reason.trim())
    else cancel(b.id, 'staff', reason.trim())
    setMode('none')
    setReason('')
  }

  return (
    <>
      <Link to="/admin/bookings" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All bookings
      </Link>
      <PageHeader
        title={`Booking #${b.id}`}
        subtitle={`Submitted ${formatDateTime(b.createdAt)}`}
        action={<Badge>{b.status}</Badge>}
      />

      {error && (
        <p className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold">Customer</h2>
            <dl className="mt-2 divide-y divide-slate-100">
              <DetailRow label="Organisation">{b.organisation}</DetailRow>
              <DetailRow label="Contact">{b.contactName}</DetailRow>
              <DetailRow label="Email">
                <a href={`mailto:${b.email}`} className="text-navy-600 hover:underline">
                  {b.email}
                </a>
              </DetailRow>
              <DetailRow label="Phone">{b.phone}</DetailRow>
              {b.notes && <DetailRow label="Notes">{b.notes}</DetailRow>}
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold">Equipment & dates</h2>
            {eq && (
              <div className="mt-4 flex items-center gap-4">
                <EquipmentImage eq={eq} className="h-16 w-20 shrink-0 rounded-lg" />
                <div>
                  <Link to={`/admin/equipment/${eq.id}`} className="font-semibold hover:underline">
                    {b.quantity} × {eq.name}
                  </Link>
                  <p className="text-sm text-slate-600">
                    {formatDate(b.startDate)} – {formatDate(b.endDate)} · {hireDays(b.startDate, b.endDate)} day(s)
                  </p>
                </div>
              </div>
            )}
            {b.status === 'Pending' && eq && (
              <div
                className={`mt-4 rounded-lg p-3 text-sm ${
                  free >= b.quantity ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {free >= b.quantity
                  ? `Stock check: ${free} of ${eq.quantity} free for all of these dates. OK to approve.`
                  : `Stock check: only ${free} of ${eq.quantity} free on the busiest day. Approving would double-book.`}
                {clashes.length > 0 && (
                  <span className="mt-1 block text-xs opacity-80">
                    Overlaps with {clashes.map((c) => `#${c.id} (${c.quantity})`).join(', ')}
                  </span>
                )}
              </div>
            )}
          </section>

          <section className="card p-6">
            <h2 className="font-semibold">Payment & deposit</h2>
            <dl className="mt-2 divide-y divide-slate-100">
              <DetailRow label="Hire cost">{currency(b.hireCost)}</DetailRow>
              <DetailRow label="Payment">
                <Badge>{b.paymentStatus}</Badge>
              </DetailRow>
              {b.paymentRef && (
                <DetailRow label="Stripe reference">
                  <span className="font-mono text-xs">{b.paymentRef}</span>
                </DetailRow>
              )}
              {b.refundAmount !== undefined && <DetailRow label="Refunded">{currency(b.refundAmount)}</DetailRow>}
              <DetailRow label="Deposit">
                {currency(b.deposit)} <Badge>{b.depositStatus}</Badge>
              </DetailRow>
            </dl>
            {b.depositStatus === 'Held' && b.status === 'Confirmed' && (
              <button className="btn-secondary mt-4" onClick={() => refundDeposit(b.id)}>
                <Undo2 className="h-4 w-4" />
                {b.endDate < t ? 'Mark returned & refund deposit' : 'Refund deposit early'}
              </button>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Actions</h2>
            {mode === 'none' ? (
              <div className="mt-3 grid gap-2">
                {b.status === 'Pending' && (
                  <>
                    <button className="btn-success" onClick={doApprove}>
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button className="btn-danger" onClick={() => setMode('decline')}>
                      <X className="h-4 w-4" /> Decline
                    </button>
                  </>
                )}
                {(b.status === 'Approved' || b.status === 'Confirmed') && b.endDate >= t && (
                  <button className="btn-danger" onClick={() => setMode('cancel')}>
                    <X className="h-4 w-4" /> Cancel booking
                  </button>
                )}
                {b.status === 'Approved' && (
                  <p className="text-sm text-slate-600">
                    Waiting for the hirer to pay. Payment link:{' '}
                    <Link to={`/pay/${b.id}`} className="font-medium break-all text-navy-600 hover:underline">
                      /pay/{b.id}
                    </Link>
                  </p>
                )}
                {['Declined', 'Cancelled'].includes(b.status) && <p className="text-sm text-slate-500">No actions — this booking is closed.</p>}
                {b.status === 'Confirmed' && b.endDate < t && <p className="text-sm text-slate-500">Hire period finished.</p>}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <label htmlFor="reason" className="field-label">
                  {mode === 'decline' ? 'Reason for declining (sent to hirer)' : 'Reason for cancelling (sent to hirer)'}
                </label>
                <textarea id="reason" rows={3} className="input" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
                {mode === 'cancel' && b.paymentStatus === 'Paid' && (
                  <p className="text-xs text-slate-600">Staff cancellations refund the hire cost and deposit in full.</p>
                )}
                <div className="flex gap-2">
                  <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={confirmReason}>
                    {mode === 'decline' ? 'Decline request' : 'Cancel booking'}
                  </button>
                  <button className="btn-secondary" onClick={() => setMode('none')}>
                    Back
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">History</h2>
            <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
              {b.history.map((h, i) => (
                <li key={i} className="text-sm">
                  <p>{h.text}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </section>

          {clashes.length > 0 && (
            <section className="card p-5">
              <h2 className="font-semibold">Other bookings for these dates</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {clashes.map((c) => (
                  <li key={c.id}>
                    <Link to={`/admin/bookings/${c.id}`} className="flex justify-between hover:underline">
                      <span>
                        #{c.id} · {c.quantity} units
                      </span>
                      <span className="text-slate-500">{formatRange(c.startDate, c.endDate)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  )
}
