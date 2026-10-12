import { useState, type FormEvent, type ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { PageHeader } from '../../components/ui'
import type { BookingRules } from '../../types'
import { currency } from '../../lib/dates'

export default function BookingRulesPage() {
  const { rules, saveRules } = useStore()
  const [form, setForm] = useState<BookingRules>(rules)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const num = (k: keyof BookingRules) => ({
    type: 'number' as const,
    min: 0,
    className: 'input w-24 text-center',
    value: form[k] as number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [k]: Number(e.target.value) })
      setSaved(false)
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const pcts = [form.earlyRefundPercent, form.lateRefundPercent]
    if (pcts.some((p) => p < 0 || p > 100)) return setError('Refund percentages must be between 0 and 100.')
    if (form.maxHireDays < 1) return setError('Longest hire must be at least 1 day.')
    setError('')
    saveRules(form)
    setSaved(true)
  }

  return (
    <>
      <PageHeader title="Booking rules" subtitle="These apply to new requests and are shown to hirers before they submit." />
      <form onSubmit={submit} className="max-w-3xl space-y-6">
        <section className="card p-6">
          <h2 className="font-semibold">Cancellation & refund rules</h2>
          <div className="mt-4 space-y-4">
            <Rule>
              Cancelled more than <input {...num('noticeDays')} aria-label="Notice days" /> days before hire →{' '}
              <input {...num('earlyRefundPercent')} max={100} aria-label="Early refund percent" /> % of hire fee refunded
            </Rule>
            <Rule>
              Cancelled within {form.noticeDays} days → <input {...num('lateRefundPercent')} max={100} aria-label="Late refund percent" /> % of hire fee
              refunded
            </Rule>
            <p className="text-xs text-slate-500">Deposits are always refunded in full on cancellation. Staff cancellations refund 100%.</p>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-semibold">Deposit</h2>
          <Rule>
            Refundable deposit per booking: $ <input {...num('depositAmount')} aria-label="Deposit amount" />
          </Rule>
          <p className="mt-2 text-xs text-slate-500">Existing bookings keep the deposit they were quoted.</p>
        </section>

        <section className="card p-6">
          <h2 className="font-semibold">Booking conditions</h2>
          <div className="mt-4 space-y-4">
            <Rule>
              Requests must be made at least <input {...num('minLeadDays')} aria-label="Minimum lead days" /> days before hire
            </Rule>
            <Rule>
              Longest single hire: <input {...num('maxHireDays')} aria-label="Maximum hire days" /> days
            </Rule>
            <div>
              <label htmlFor="conditions" className="field-label">
                Conditions of hire (shown to hirers)
              </label>
              <textarea
                id="conditions"
                rows={4}
                className="input"
                value={form.conditions}
                onChange={(e) => {
                  setForm({ ...form, conditions: e.target.value })
                  setSaved(false)
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-navy-50 p-5 text-sm text-navy-900">
          <p className="font-semibold">What hirers will see</p>
          <p className="mt-1">
            Cancel more than {form.noticeDays} days before hire: {form.earlyRefundPercent}% back. Within {form.noticeDays} days:{' '}
            {form.lateRefundPercent}% back. Deposit {currency(form.depositAmount)}, refunded when equipment is returned.
          </p>
        </section>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-center gap-4">
          <button className="btn-primary">Save rules</button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700" role="status">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </>
  )
}

function Rule({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 [&_input]:inline-block">{children}</div>
}
