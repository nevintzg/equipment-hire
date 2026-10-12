import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/AppStore'
import { Badge, EmptyState, PageHeader, Tabs } from '../../components/ui'
import { currency, formatDate, formatRange, today } from '../../lib/dates'

const TABS = ['Payment records', 'Deposit records', 'Outstanding', 'Refunds'] as const
type Tab = (typeof TABS)[number]

export default function Payments() {
  const { bookings, refundDeposit } = useStore()
  const [tab, setTab] = useState<Tab>('Payment records')
  const t = today()

  const paid = bookings.filter((b) => b.paymentStatus !== 'Unpaid')
  const deposits = bookings.filter((b) => b.depositStatus !== 'Unpaid')
  const outstanding = bookings.filter((b) => b.status === 'Approved' && b.paymentStatus === 'Unpaid')
  const refunds = bookings.filter((b) => b.refundAmount !== undefined || b.depositStatus === 'Refunded')

  const received = paid.reduce((s, b) => s + b.hireCost - (b.refundAmount ?? 0), 0)
  const held = deposits.filter((b) => b.depositStatus === 'Held').reduce((s, b) => s + b.deposit, 0)
  const outstandingTotal = outstanding.reduce((s, b) => s + b.deposit, 0)

  const idLink = (id: number) => (
    <Link to={`/admin/bookings/${id}`} className="font-semibold text-navy-700 hover:underline">
      #{id}
    </Link>
  )

  return (
    <>
      <PageHeader title="Payments & deposits" subtitle="Card payments are processed by Stripe; this is the booking-side record." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Summary label="Hire fees received (net of refunds)" value={currency(received)} />
        <Summary label="Deposits currently held" value={currency(held)} />
        <Summary label="Outstanding deposits (approved, unpaid)" value={currency(outstandingTotal)} highlight />
      </div>

      <div className="mb-4">
        <Tabs options={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="card overflow-x-auto">
        {tab === 'Payment records' && (
          <Table head={['Booking', 'Organisation', 'Paid', 'Amount', 'Reference', 'Status']} empty={paid.length === 0}>
            {paid.map((b) => (
              <tr key={b.id}>
                <td className="td">{idLink(b.id)}</td>
                <td className="td">{b.organisation}</td>
                <td className="td">{b.paidAt ? formatDate(b.paidAt.slice(0, 10)) : '—'}</td>
                <td className="td text-right">{currency(b.hireCost + b.deposit)}</td>
                <td className="td font-mono text-xs">{b.paymentRef}</td>
                <td className="td">
                  <Badge>{b.paymentStatus}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
        {tab === 'Deposit records' && (
          <Table head={['Booking', 'Organisation', 'Hire dates', 'Deposit', 'Status', '']} empty={deposits.length === 0}>
            {deposits.map((b) => (
              <tr key={b.id}>
                <td className="td">{idLink(b.id)}</td>
                <td className="td">{b.organisation}</td>
                <td className="td">{formatRange(b.startDate, b.endDate)}</td>
                <td className="td text-right">{currency(b.deposit)}</td>
                <td className="td">
                  <Badge>{b.depositStatus}</Badge>
                </td>
                <td className="td text-right">
                  {b.depositStatus === 'Held' && b.endDate < t && (
                    <button className="btn-secondary btn-sm" onClick={() => refundDeposit(b.id)}>
                      Mark returned & refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
        {tab === 'Outstanding' && (
          <Table head={['Booking', 'Organisation', 'Hire starts', 'Hire fee', 'Deposit', 'Total due']} empty={outstanding.length === 0}>
            {outstanding.map((b) => (
              <tr key={b.id}>
                <td className="td">{idLink(b.id)}</td>
                <td className="td">{b.organisation}</td>
                <td className="td">{formatDate(b.startDate)}</td>
                <td className="td text-right">{currency(b.hireCost)}</td>
                <td className="td text-right">{currency(b.deposit)}</td>
                <td className="td text-right font-semibold">{currency(b.hireCost + b.deposit)}</td>
              </tr>
            ))}
            {outstanding.length > 0 && (
              <tr className="bg-slate-50">
                <td className="td font-semibold" colSpan={4}>
                  Total outstanding deposits
                </td>
                <td className="td text-right font-semibold">{currency(outstandingTotal)}</td>
                <td />
              </tr>
            )}
          </Table>
        )}
        {tab === 'Refunds' && (
          <Table head={['Booking', 'Organisation', 'Booking status', 'Hire fee refunded', 'Deposit', 'Status']} empty={refunds.length === 0}>
            {refunds.map((b) => (
              <tr key={b.id}>
                <td className="td">{idLink(b.id)}</td>
                <td className="td">{b.organisation}</td>
                <td className="td">
                  <Badge>{b.status}</Badge>
                </td>
                <td className="td text-right">{b.refundAmount !== undefined ? currency(b.refundAmount) : '—'}</td>
                <td className="td text-right">{currency(b.deposit)}</td>
                <td className="td">
                  <Badge>Refunded</Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </>
  )
}

function Summary({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card p-5 ${highlight ? 'border-amber-200 bg-amber-50/50' : ''}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  )
}

function Table({ head, empty, children }: { head: string[]; empty: boolean; children: React.ReactNode }) {
  return (
    <>
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {head.map((h, i) => (
              <th key={i} className={`th ${['Amount', 'Deposit', 'Hire fee', 'Total due', 'Hire fee refunded'].includes(h) ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
      {empty && <EmptyState>Nothing to show.</EmptyState>}
    </>
  )
}
