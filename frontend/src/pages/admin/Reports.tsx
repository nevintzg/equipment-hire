import { useSearchParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Badge, EmptyState, PageHeader, Tabs } from '../../components/ui'
import { HOLDS_STOCK } from '../../lib/availability'
import { addDays, currency, eachDay, formatDate, formatRange, today } from '../../lib/dates'

const TABS = ['Upcoming bookings', 'Equipment utilisation', 'Outstanding deposits'] as const
type Tab = (typeof TABS)[number]
const TAB_KEYS: Record<string, Tab> = { upcoming: TABS[0], utilisation: TABS[1], deposits: TABS[2] }
const PERIODS = [30, 90] as const

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}-${today()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { bookings, equipment, equipmentById } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = TAB_KEYS[params.get('tab') ?? ''] ?? TABS[0]
  const period = Number(params.get('days')) === 90 ? 90 : 30
  const t = today()

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    next.set(k, v)
    setParams(next, { replace: true })
  }
  const setTab = (v: Tab) => setParam('tab', Object.keys(TAB_KEYS).find((k) => TAB_KEYS[k] === v)!)

  const upcoming = bookings
    .filter((b) => HOLDS_STOCK.includes(b.status) && b.endDate >= t)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  // Utilisation over the last N days: unit-days hired ÷ unit-days in stock.
  const from = addDays(t, -period + 1)
  const days = eachDay(from, t)
  const utilisation = equipment
    .filter((e) => e.active && e.quantity > 0)
    .map((e) => {
      const used = bookings
        .filter((b) => b.equipmentId === e.id && HOLDS_STOCK.includes(b.status))
        .reduce((s, b) => s + days.filter((d) => d >= b.startDate && d <= b.endDate).length * b.quantity, 0)
      return { eq: e, pct: Math.round((used / (e.quantity * days.length)) * 100), used }
    })
    .sort((a, b) => b.pct - a.pct)

  const outstanding = bookings.filter((b) => b.status === 'Approved' && b.paymentStatus === 'Unpaid')
  const held = bookings.filter((b) => b.depositStatus === 'Held')

  const exportCurrent = () => {
    if (tab === TABS[0]) {
      downloadCsv('upcoming-bookings', [
        ['ID', 'Organisation', 'Equipment', 'Qty', 'Start', 'End', 'Status', 'Payment'],
        ...upcoming.map((b) => [b.id, b.organisation, equipmentById(b.equipmentId)?.name ?? '', b.quantity, b.startDate, b.endDate, b.status, b.paymentStatus]),
      ])
    } else if (tab === TABS[1]) {
      downloadCsv('equipment-utilisation', [
        ['Equipment', 'Quantity', `Unit-days hired (last ${period} days)`, 'Utilisation %'],
        ...utilisation.map((u) => [u.eq.name, u.eq.quantity, u.used, u.pct]),
      ])
    } else {
      downloadCsv('outstanding-deposits', [
        ['ID', 'Organisation', 'Type', 'Amount'],
        ...outstanding.map((b) => [b.id, b.organisation, 'Awaiting payment', b.deposit]),
        ...held.map((b) => [b.id, b.organisation, 'Held — to refund on return', b.deposit]),
      ])
    }
  }

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Basic administrative reporting."
        action={
          <button className="btn-primary" onClick={exportCurrent}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />
      <div className="mb-5">
        <Tabs options={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === TABS[0] && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Dates</th>
                <th className="th">Booking</th>
                <th className="th">Organisation</th>
                <th className="th">Equipment</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcoming.map((b) => (
                <tr key={b.id}>
                  <td className="td font-medium">{formatRange(b.startDate, b.endDate)}</td>
                  <td className="td">#{b.id}</td>
                  <td className="td">{b.organisation}</td>
                  <td className="td">
                    {b.quantity} × {equipmentById(b.equipmentId)?.name}
                  </td>
                  <td className="td">
                    <Badge>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {upcoming.length === 0 && <EmptyState>No upcoming bookings.</EmptyState>}
        </div>
      )}

      {tab === TABS[1] && (
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Equipment utilisation</h2>
              <p className="text-sm text-slate-500">
                Share of available unit-days that were hired, {formatDate(from)} – {formatDate(t)}.
              </p>
            </div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setParam('days', String(p))}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${period === p ? 'bg-white shadow-sm' : 'text-slate-600'}`}
                >
                  {p} days
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-6 space-y-4">
            {utilisation.map(({ eq, pct }) => (
              <li key={eq.id} className="grid grid-cols-[minmax(8rem,14rem)_1fr_3rem] items-center gap-4 text-sm">
                <span className="truncate text-slate-700">{eq.name}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={eq.name}>
                  <div className="h-full rounded-full bg-navy-600" style={{ width: `${Math.max(pct, pct ? 2 : 0)}%` }} />
                </div>
                <span className="text-right font-semibold tabular-nums">{pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === TABS[2] && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DepositList title="Awaiting payment" note="Approved bookings where the deposit hasn't been paid yet." rows={outstanding.map((b) => ({ id: b.id, org: b.organisation, amount: b.deposit, when: formatDate(b.startDate) }))} />
          <DepositList title="Held — refund on return" note="Paid deposits CRN SA is holding until equipment comes back." rows={held.map((b) => ({ id: b.id, org: b.organisation, amount: b.deposit, when: `Due back ${formatDate(b.endDate)}` }))} />
        </div>
      )}
    </>
  )
}

function DepositList({ title, note, rows }: { title: string; note: string; rows: { id: number; org: string; amount: number; when: string }[] }) {
  const total = rows.reduce((s, r) => s + r.amount, 0)
  return (
    <section className="card p-6">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-slate-500">{note}</p>
      <ul className="mt-4 divide-y divide-slate-100">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between py-2.5 text-sm">
            <span>
              <span className="font-semibold">#{r.id}</span> {r.org}
              <span className="block text-xs text-slate-500">{r.when}</span>
            </span>
            <span className="font-medium tabular-nums">{currency(r.amount)}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="py-2.5 text-sm text-slate-500">None.</li>}
      </ul>
      <p className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-sm font-semibold">
        <span>Total</span>
        <span>{currency(total)}</span>
      </p>
    </section>
  )
}
