import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { CATEGORIES, type Category } from '../../types'
import { unitsFreeOn } from '../../lib/availability'
import { currency, today } from '../../lib/dates'
import { Badge, ConditionText, EmptyState, EquipmentImage } from '../../components/ui'

export default function Catalogue() {
  const { equipment, bookings } = useStore()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = (params.get('category') ?? '') as Category | ''
  const availableOnly = params.get('available') === '1'

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const t = today()
  const items = equipment
    .filter((e) => e.active)
    .map((e) => ({ eq: e, free: unitsFreeOn(e, bookings, t) }))
    .filter(({ eq }) => !category || eq.category === category)
    .filter(({ eq }) => !q || `${eq.name} ${eq.category} ${eq.description}`.toLowerCase().includes(q.toLowerCase()))
    .filter(({ free }) => !availableOnly || free > 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Equipment Catalogue</h1>
      <p className="mt-1 text-slate-600">Everything CRN SA lends and hires to community groups.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search equipment…"
            aria-label="Search equipment"
            value={q}
            onChange={(e) => set('q', e.target.value)}
          />
        </div>
        <select className="input" aria-label="Category" value={category} onChange={(e) => set('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Availability"
          value={availableOnly ? '1' : ''}
          onChange={(e) => set('available', e.target.value)}
        >
          <option value="">Any availability</option>
          <option value="1">Available today</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['', ...CATEGORIES] as const).map((c) => (
          <button
            key={c || 'all'}
            onClick={() => set('category', c)}
            className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
              category === c ? 'bg-navy-600 text-white ring-navy-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {c || 'All Equipment'}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState>No equipment matches those filters.</EmptyState>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ eq, free }) => (
            <li key={eq.id} className="card flex flex-col overflow-hidden">
              <Link to={`/equipment/${eq.id}`} className="block" tabIndex={-1} aria-hidden="true">
                <EquipmentImage eq={eq} className="aspect-[4/3] w-full" />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold tracking-wide text-navy-600 uppercase">{eq.category}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  <Link to={`/equipment/${eq.id}`} className="hover:underline">
                    {eq.name}
                  </Link>
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{eq.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-slate-700">
                    <strong>{free}</strong> of {eq.quantity} available
                  </span>
                  <span className="text-slate-300">•</span>
                  <ConditionText condition={eq.condition} />
                </div>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-sm text-slate-500">
                    <strong className="text-slate-900">{currency(eq.dailyRate)}</strong> / day each
                  </span>
                  {free === 0 ? <Badge>Fully booked today</Badge> : <Badge>Available</Badge>}
                </div>
                <Link to={`/equipment/${eq.id}`} className="btn-primary mt-4">
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
