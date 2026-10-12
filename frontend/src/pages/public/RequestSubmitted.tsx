import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Badge } from '../../components/ui'
import Stepper from '../../components/Stepper'
import NotFound from './NotFound'

export default function RequestSubmitted() {
  const { id } = useParams()
  const { bookings, myRequests } = useStore()
  const booking = bookings.find((b) => b.id === Number(id))
  if (!booking || !myRequests.includes(booking.id)) return <NotFound message="We couldn't find that request." />

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <Stepper step={3} />
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-emerald-700">Request submitted</h1>
        <p className="mt-2 text-slate-600">Your hire request has been sent to CRN SA for approval.</p>

        <div className="mx-auto mt-6 max-w-xs rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Request ID</p>
          <p className="text-2xl font-bold tracking-tight">#{booking.id}</p>
          <p className="mt-2 text-sm">
            Status: <Badge>{booking.status}</Badge>
          </p>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          We'll email <strong>{booking.email}</strong> when it's been reviewed. Keep your request ID to check its
          status any time.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={`/status/${booking.id}`} className="btn-primary">
            Track this request
          </Link>
          <Link to="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
