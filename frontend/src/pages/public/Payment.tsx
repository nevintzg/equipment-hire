import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Info, Loader2, Lock } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { DetailRow, EquipmentImage, Field } from '../../components/ui'
import { currency, formatDate, hireDays } from '../../lib/dates'
import NotFound from './NotFound'

/*
 * Booking summary → checkout → confirmation.
 * In production the "Pay" button would call the backend to create a Stripe Checkout
 * Session and redirect to Stripe's hosted page; the backend then marks the booking paid
 * from Stripe's webhook. Here the card form is a local stand-in so the flow can be demoed.
 */
export default function Payment() {
  const { id } = useParams()
  const { bookings, equipmentById, pay } = useStore()
  const navigate = useNavigate()
  const [stage, setStage] = useState<'summary' | 'checkout'>('summary')
  const [processing, setProcessing] = useState(false)
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', expiry: '12 / 30', cvc: '123', name: '' })
  const [error, setError] = useState('')

  const b = bookings.find((x) => x.id === Number(id))
  if (!b) return <NotFound message="We couldn't find that booking." />
  if (b.status === 'Confirmed') return <Navigate to={`/pay/${b.id}/complete`} replace />
  const eq = equipmentById(b.equipmentId)
  const total = b.hireCost + b.deposit

  if (b.status !== 'Approved') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Payment not available</h1>
        <p className="mt-2 text-slate-600">
          Request #{b.id} is {b.status.toLowerCase()}. Payment opens once CRN SA approves a request.
        </p>
        <Link to={`/status/${b.id}?email=${encodeURIComponent(b.email)}`} className="btn-primary mt-6">
          View request
        </Link>
      </div>
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (card.number.replace(/\s/g, '').length < 15 || !card.name.trim()) {
      setError('Enter the card number and the name on the card.')
      return
    }
    setError('')
    setProcessing(true)
    setTimeout(() => {
      pay(b.id)
      navigate(`/pay/${b.id}/complete`, { replace: true })
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{stage === 'summary' ? 'Booking summary' : 'Payment'}</h1>
      <p className="mt-1 text-slate-600">Request #{b.id} · {b.organisation}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_20rem]">
        {stage === 'summary' ? (
          <div className="card p-6">
            {eq && (
              <div className="flex gap-4">
                <EquipmentImage eq={eq} className="h-20 w-24 shrink-0 rounded-lg" />
                <div>
                  <p className="font-semibold">
                    {b.quantity} × {eq.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatDate(b.startDate)} – {formatDate(b.endDate)} ({hireDays(b.startDate, b.endDate)} day(s))
                  </p>
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-600" />
              <p>
                The {currency(b.deposit)} deposit is refundable. It's returned once the equipment comes back in the same
                condition, or in full if you cancel.
              </p>
            </div>
            <button className="btn-primary mt-6 w-full py-3 text-base" onClick={() => setStage('checkout')}>
              Continue to payment
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lock className="h-4 w-4 text-emerald-600" /> Secure card payment
              </p>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Test mode</span>
            </div>
            <p className="text-xs text-slate-500">
              Demo checkout — in the live system this step is Stripe's hosted payment page. No real card is charged.
            </p>
            <Field label="Card number" htmlFor="cc">
              <input id="cc" className="input font-mono" inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Expiry" htmlFor="exp">
                <input id="exp" className="input font-mono" autoComplete="cc-exp" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
              </Field>
              <Field label="CVC" htmlFor="cvc">
                <input id="cvc" className="input font-mono" autoComplete="cc-csc" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
              </Field>
            </div>
            <Field label="Name on card" htmlFor="ccname">
              <input id="ccname" className="input" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
            </Field>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn-primary w-full py-3 text-base" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                `Pay ${currency(total)}`
              )}
            </button>
            <button type="button" className="btn-secondary w-full" onClick={() => setStage('summary')} disabled={processing}>
              Back
            </button>
          </form>
        )}

        <aside className="card h-fit p-5">
          <h2 className="font-semibold">Order total</h2>
          <dl className="mt-2 divide-y divide-slate-100">
            <DetailRow label="Hire cost">{currency(b.hireCost)}</DetailRow>
            <DetailRow label="Refundable deposit">{currency(b.deposit)}</DetailRow>
            <DetailRow label="Total today">
              <span className="text-lg">{currency(total)}</span>
            </DetailRow>
          </dl>
        </aside>
      </div>
    </div>
  )
}
