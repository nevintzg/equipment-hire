import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, type NewRequest } from '../../store/AppStore'
import { DetailRow, EquipmentImage, Field } from '../../components/ui'
import Stepper from '../../components/Stepper'
import { estimateCost, unitsFreeForRange, validateRequest } from '../../lib/availability'
import { addDays, currency, formatDate, formatRange, hireDays, today } from '../../lib/dates'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function HireRequest() {
  const { equipment, bookings, rules, submitRequest } = useStore()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const active = equipment.filter((e) => e.active)

  const defaultStart = params.get('start') ?? addDays(today(), Math.max(rules.minLeadDays, 7))
  const [form, setForm] = useState<NewRequest>({
    equipmentId: params.get('equipment') ?? active[0]?.id ?? '',
    quantity: 1,
    startDate: defaultStart,
    endDate: params.get('end') ?? defaultStart,
    organisation: '',
    contactName: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [agreed, setAgreed] = useState(false)

  const eq = active.find((e) => e.id === form.equipmentId)
  const datesValid = form.startDate && form.endDate && form.endDate >= form.startDate
  const freeForRange = eq && datesValid ? unitsFreeForRange(eq, bookings, form.startDate, form.endDate) : null
  const cost = eq && datesValid ? estimateCost(eq, form.quantity, form.startDate, form.endDate) : 0

  const set = <K extends keyof NewRequest>(key: K, value: NewRequest[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = validateRequest(form, equipment, bookings, rules)
    if (!form.organisation.trim()) e.organisation = 'Enter your organisation name.'
    if (!form.contactName.trim()) e.contactName = 'Enter a contact name.'
    if (!EMAIL.test(form.email)) e.email = 'Enter a valid email address.'
    if (form.phone.replace(/\D/g, '').length < 8) e.phone = 'Enter a phone number we can reach you on.'
    return e
  }

  const toReview = (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.values(e).some(Boolean)) {
      document.getElementById(Object.keys(e).find((k) => e[k])!)?.focus()
      return
    }
    setStep(1)
    window.scrollTo(0, 0)
  }

  const submit = () => {
    const result = submitRequest(form)
    if (!result.ok) {
      // Stock changed since the form was filled in; send them back to fix it.
      setErrors(result.errors)
      setStep(0)
      return
    }
    navigate(`/request/${result.id}/submitted`, { replace: true })
  }

  const err = (k: string) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${k}-error` } : {})

  if (step === 1 && eq) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Stepper step={1} />
        <h1 className="text-2xl font-bold tracking-tight">Review your hire request</h1>
        <div className="card mt-6 p-6">
          <div className="flex gap-4">
            <EquipmentImage eq={eq} className="h-20 w-24 shrink-0 rounded-lg" />
            <div>
              <p className="font-semibold">
                {form.quantity} × {eq.name}
              </p>
              <p className="text-sm text-slate-600">
                {formatRange(form.startDate, form.endDate)} · {hireDays(form.startDate, form.endDate)} day(s)
              </p>
              <p className="text-sm text-slate-600">{form.organisation}</p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
            <DetailRow label="Hire date">{formatDate(form.startDate)}</DetailRow>
            <DetailRow label="Return date">{formatDate(form.endDate)}</DetailRow>
            <DetailRow label="Contact">{form.contactName}</DetailRow>
            <DetailRow label="Email">{form.email}</DetailRow>
            <DetailRow label="Phone">{form.phone}</DetailRow>
            {form.notes && <DetailRow label="Additional information">{form.notes}</DetailRow>}
            <DetailRow label="Estimated hire cost">
              {currency(cost)}
              <span className="block text-xs font-normal text-slate-500">
                {form.quantity} × {currency(eq.dailyRate)} × {hireDays(form.startDate, form.endDate)} day(s)
              </span>
            </DetailRow>
            <DetailRow label="Refundable deposit">{currency(rules.depositAmount)}</DetailRow>
            <DetailRow label="Total due after approval">
              <span className="text-lg">{currency(cost + rules.depositAmount)}</span>
            </DetailRow>
          </dl>

          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            You won't pay anything yet. CRN SA staff will review your request and email you a payment link once it's
            approved. Cancel more than {rules.noticeDays} days before hire for a {rules.earlyRefundPercent}% refund;
            within {rules.noticeDays} days, {rules.lateRefundPercent}%.{' '}
            <Link to="/about#conditions" target="_blank" className="font-medium text-navy-600 hover:underline">
              View all conditions
            </Link>
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            I agree to the booking and cancellation conditions.
          </label>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button className="btn-secondary" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn-primary" onClick={submit} disabled={!agreed}>
              Submit request
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Stepper step={0} />
      <h1 className="text-2xl font-bold tracking-tight">Hire request</h1>
      <p className="mt-1 text-slate-600">Tell us what you need and when. You'll review everything before sending.</p>

      <form onSubmit={toReview} noValidate className="card mt-6 space-y-5 p-6">
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Equipment & dates</legend>
          <Field label="Equipment" htmlFor="equipmentId" error={errors.equipmentId}>
            <select
              id="equipmentId"
              className="input"
              value={form.equipmentId}
              onChange={(e) => set('equipmentId', e.target.value)}
              {...err('equipmentId')}
            >
              {active.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.category})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Hire date" htmlFor="startDate" error={errors.startDate}>
              <input
                id="startDate"
                type="date"
                className="input"
                min={addDays(today(), rules.minLeadDays)}
                value={form.startDate}
                onChange={(e) => {
                  set('startDate', e.target.value)
                  if (form.endDate < e.target.value) set('endDate', e.target.value)
                }}
                {...err('startDate')}
              />
            </Field>
            <Field label="Return date" htmlFor="endDate" error={errors.endDate}>
              <input
                id="endDate"
                type="date"
                className="input"
                min={form.startDate}
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                {...err('endDate')}
              />
            </Field>
          </div>

          <Field
            label="Quantity"
            htmlFor="quantity"
            error={errors.quantity}
            hint={
              freeForRange !== null && eq
                ? `${freeForRange} of ${eq.quantity} available for these dates.`
                : undefined
            }
          >
            <input
              id="quantity"
              type="number"
              min={1}
              max={eq?.quantity}
              className="input sm:w-32"
              value={form.quantity}
              onChange={(e) => set('quantity', Number(e.target.value))}
              {...err('quantity')}
            />
          </Field>

          {eq && datesValid && (
            <p className="rounded-lg bg-navy-50 px-4 py-3 text-sm text-navy-800">
              Estimated cost: <strong>{currency(cost)}</strong> + {currency(rules.depositAmount)} refundable deposit
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-5 border-t border-slate-100 pt-5">
          <legend className="pt-5 text-sm font-semibold tracking-wide text-slate-500 uppercase">Your organisation</legend>
          <Field label="Organisation name" htmlFor="organisation" error={errors.organisation}>
            <input id="organisation" className="input" autoComplete="organization" value={form.organisation} onChange={(e) => set('organisation', e.target.value)} {...err('organisation')} />
          </Field>
          <Field label="Contact name" htmlFor="contactName" error={errors.contactName}>
            <input id="contactName" className="input" autoComplete="name" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} {...err('contactName')} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" htmlFor="email" error={errors.email}>
              <input id="email" type="email" className="input" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} {...err('email')} />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone}>
              <input id="phone" type="tel" className="input" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} {...err('phone')} />
            </Field>
          </div>
          <Field label="Additional information (optional)" htmlFor="notes">
            <textarea
              id="notes"
              rows={3}
              className="input"
              placeholder="Event details, delivery questions, special requirements…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Field>
        </fieldset>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button type="submit" className="btn-primary">
            Review request
          </button>
        </div>
      </form>
    </div>
  )
}
