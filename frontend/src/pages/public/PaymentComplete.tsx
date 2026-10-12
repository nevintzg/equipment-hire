import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { DetailRow } from '../../components/ui'
import { currency, formatDate, formatDateTime } from '../../lib/dates'
import NotFound from './NotFound'

export default function PaymentComplete() {
  const { id } = useParams()
  const { bookings, equipmentById } = useStore()
  const b = bookings.find((x) => x.id === Number(id))
  if (!b || b.paymentStatus === 'Unpaid') return <NotFound message="No payment found for that booking." />
  const eq = equipmentById(b.equipmentId)

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="card p-8">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-emerald-700">Booking confirmed</h1>
          <p className="mt-2 text-slate-600">Payment received. Your equipment is reserved.</p>
        </div>
        <dl className="mt-8 divide-y divide-slate-100 border-y border-slate-100">
          <DetailRow label="Booking">#{b.id}</DetailRow>
          <DetailRow label="Equipment">
            {b.quantity} × {eq?.name}
          </DetailRow>
          <DetailRow label="Collect">{formatDate(b.startDate)}</DetailRow>
          <DetailRow label="Return">{formatDate(b.endDate)}</DetailRow>
          <DetailRow label="Hire cost paid">{currency(b.hireCost)}</DetailRow>
          <DetailRow label="Deposit held">{currency(b.deposit)}</DetailRow>
          {b.paidAt && <DetailRow label="Paid">{formatDateTime(b.paidAt)}</DetailRow>}
          {b.paymentRef && (
            <DetailRow label="Payment reference">
              <span className="font-mono text-xs">{b.paymentRef}</span>
            </DetailRow>
          )}
        </dl>
        <p className="mt-6 text-sm text-slate-600">
          A receipt has been sent to {b.email}. Bring your booking number when you collect the equipment.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to={`/status/${b.id}?email=${encodeURIComponent(b.email)}`} className="btn-primary flex-1">
            View booking
          </Link>
          <Link to="/" className="btn-secondary flex-1">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
