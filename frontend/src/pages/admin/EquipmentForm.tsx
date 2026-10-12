import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Field, PageHeader } from '../../components/ui'
import { CATEGORIES, CONDITIONS, type Equipment } from '../../types'
import NotFound from '../public/NotFound'

const MAX_IMAGE_BYTES = 1_500_000

const blank: Equipment = {
  id: '',
  name: '',
  category: 'Marquees',
  description: '',
  images: [],
  quantity: 1,
  condition: 'Good',
  active: true,
  dailyRate: 10,
}

export default function EquipmentForm() {
  const { id } = useParams()
  const { equipmentById, saveEquipment } = useStore()
  const navigate = useNavigate()
  const existing = id ? equipmentById(id) : undefined
  const [form, setForm] = useState<Equipment>(existing ?? blank)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (id && !existing) return <NotFound message="That equipment doesn't exist." />

  const set = <K extends keyof Equipment>(k: K, v: Equipment[K]) => setForm((f) => ({ ...f, [k]: v }))

  // Demo only: images are stored as data URLs. The real system uploads them to file storage.
  const addImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const tooBig = files.filter((f) => f.size > MAX_IMAGE_BYTES)
    setErrors((er) => ({ ...er, images: tooBig.length ? `${tooBig.map((f) => f.name).join(', ')} is over 1.5 MB.` : '' }))
    files
      .filter((f) => f.size <= MAX_IMAGE_BYTES)
      .forEach((f) => {
        const reader = new FileReader()
        reader.onload = () => setForm((x) => ({ ...x, images: [...x.images, reader.result as string] }))
        reader.readAsDataURL(f)
      })
    e.target.value = ''
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!form.name.trim()) er.name = 'Enter a name.'
    if (!form.description.trim()) er.description = 'Add a short description for hirers.'
    if (!Number.isInteger(form.quantity) || form.quantity < 0) er.quantity = 'Quantity must be 0 or more.'
    if (!(form.dailyRate >= 0)) er.dailyRate = 'Enter a daily rate.'
    setErrors(er)
    if (Object.keys(er).length) return
    saveEquipment({ ...form, id: form.id || `eq-${Date.now().toString(36)}` })
    navigate('/admin/equipment')
  }

  return (
    <>
      <Link to="/admin/equipment" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Equipment
      </Link>
      <PageHeader title={existing ? `Edit ${existing.name}` : 'Add equipment'} />

      <form onSubmit={submit} noValidate className="card max-w-3xl space-y-5 p-6">
        <Field label="Equipment name" htmlFor="name" error={errors.name}>
          <input id="name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="category">
            <select id="category" className="input" value={form.category} onChange={(e) => set('category', e.target.value as Equipment['category'])}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Hire rate per item per day ($)" htmlFor="dailyRate" error={errors.dailyRate}>
            <input id="dailyRate" type="number" min={0} step="0.5" className="input" value={form.dailyRate} onChange={(e) => set('dailyRate', Number(e.target.value))} />
          </Field>
        </div>

        <Field label="Description" htmlFor="description" error={errors.description}>
          <textarea id="description" rows={4} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} aria-invalid={!!errors.description} />
        </Field>

        <div>
          <span className="field-label">Images</span>
          <div className="flex flex-wrap gap-3">
            {form.images.map((src, i) => (
              <div key={i} className="group relative h-24 w-32 overflow-hidden rounded-lg border border-slate-200">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 rounded-md bg-white/90 p-1 text-red-600 shadow"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-[10px] font-semibold">Main</span>}
              </div>
            ))}
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-navy-600 hover:text-navy-600">
              <ImagePlus className="h-5 w-5" />
              Upload images
              <input type="file" accept="image/*" multiple className="sr-only" onChange={addImages} />
            </label>
          </div>
          {errors.images && <p className="field-error">{errors.images}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Quantity in stock" htmlFor="quantity" error={errors.quantity}>
            <input id="quantity" type="number" min={0} className="input" value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
          </Field>
          <Field label="Condition" htmlFor="condition">
            <select id="condition" className="input" value={form.condition} onChange={(e) => set('condition', e.target.value as Equipment['condition'])}>
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="active" hint="Inactive items are hidden from the public catalogue.">
            <select id="active" className="input" value={form.active ? 'Active' : 'Inactive'} onChange={(e) => set('active', e.target.value === 'Active')}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link to="/admin/equipment" className="btn-secondary">
            Cancel
          </Link>
          <button className="btn-primary">Save equipment</button>
        </div>
      </form>
    </>
  )
}
