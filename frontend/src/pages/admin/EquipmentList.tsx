import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Badge, ConditionText, EmptyState, EquipmentImage, PageHeader } from '../../components/ui'
import { unitsFreeOn } from '../../lib/availability'
import { currency, today } from '../../lib/dates'

export default function EquipmentList() {
  const { equipment, bookings, saveEquipment } = useStore()
  const [q, setQ] = useState('')
  const t = today()
  const rows = equipment.filter((e) => `${e.name} ${e.category}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <PageHeader
        title="Equipment management"
        subtitle="Inventory, condition and whether each item is listed publicly."
        action={
          <Link to="/admin/equipment/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Add equipment
          </Link>
        }
      />
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="search" className="input pl-9" placeholder="Search equipment…" aria-label="Search equipment" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Equipment</th>
              <th className="th">Category</th>
              <th className="th text-right">Qty</th>
              <th className="th text-right">Out today</th>
              <th className="th">Condition</th>
              <th className="th text-right">Rate / day</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((e) => (
              <tr key={e.id} className={e.active ? '' : 'bg-slate-50/60'}>
                <td className="td">
                  <div className="flex items-center gap-3">
                    <EquipmentImage eq={e} className="h-10 w-12 shrink-0 rounded-md" />
                    <span className="font-medium text-slate-900">{e.name}</span>
                  </div>
                </td>
                <td className="td">{e.category}</td>
                <td className="td text-right">{e.quantity}</td>
                <td className="td text-right">{e.quantity - unitsFreeOn(e, bookings, t)}</td>
                <td className="td">
                  <ConditionText condition={e.condition} />
                </td>
                <td className="td text-right">{currency(e.dailyRate)}</td>
                <td className="td">
                  <button
                    onClick={() => saveEquipment({ ...e, active: !e.active })}
                    title={e.active ? 'Click to hide from the public catalogue' : 'Click to list publicly'}
                  >
                    <Badge>{e.active ? 'Active' : 'Inactive'}</Badge>
                  </button>
                </td>
                <td className="td text-right">
                  <Link to={`/admin/equipment/${e.id}`} className="btn-secondary btn-sm">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState>No equipment matches “{q}”.</EmptyState>}
      </div>
    </>
  )
}
