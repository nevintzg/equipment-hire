import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  CookingPot,
  Dumbbell,
  Package,
  Speaker,
  Table2,
  Tent,
  type LucideIcon,
} from 'lucide-react'
import type { BookingStatus, Category, Condition, DepositStatus, Equipment, PaymentStatus } from '../types'

export function Logo({ admin = false, to = '/' }: { admin?: boolean; to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="CRN SA home">
      <svg viewBox="0 0 40 32" className="h-8 w-10" aria-hidden="true">
        <circle cx="10" cy="7" r="4.5" fill="#1b5fb4" />
        <circle cx="20" cy="5" r="4.5" fill="#f2994a" />
        <circle cx="30" cy="7" r="4.5" fill="#2f9a5a" />
        <path d="M2 30c0-9 6-15 13-15 3 0 5 1 5 1s2-1 5-1c7 0 13 6 13 15z" fill="#1b5fb4" opacity=".9" />
        <path d="M14 30c2-8 8-12 16-12 4 0 8 3 8 12z" fill="#2f9a5a" />
      </svg>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight text-navy-800">
          CRN SA{admin && <span className="ml-1.5 text-sm font-semibold text-slate-500">Admin</span>}
        </span>
        {!admin && <span className="hidden text-[11px] text-slate-500 sm:block">Community Resource Network SA</span>}
      </span>
    </Link>
  )
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  Approved: 'bg-sky-50 text-sky-800 ring-sky-200',
  Confirmed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Declined: 'bg-red-50 text-red-700 ring-red-200',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  Paid: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Unpaid: 'bg-amber-50 text-amber-800 ring-amber-200',
  Held: 'bg-sky-50 text-sky-800 ring-sky-200',
  Refunded: 'bg-slate-100 text-slate-600 ring-slate-200',
  'Partially refunded': 'bg-slate-100 text-slate-600 ring-slate-200',
  Active: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  Available: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  'Fully booked today': 'bg-red-50 text-red-700 ring-red-200',
}

export function Badge({ children }: { children: BookingStatus | PaymentStatus | DepositStatus | string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[children] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {children}
    </span>
  )
}

const conditionStyles: Record<Condition, string> = {
  Excellent: 'text-emerald-700',
  Good: 'text-emerald-700',
  Fair: 'text-amber-700',
  'Needs repair': 'text-red-700',
}

export function ConditionText({ condition }: { condition: Condition }) {
  return <span className={`font-medium ${conditionStyles[condition]}`}>{condition}</span>
}

export const categoryIcons: Record<Category, LucideIcon> = {
  Marquees: Tent,
  Tables: Table2,
  'Audio Equipment': Speaker,
  'Sporting Equipment': Dumbbell,
  'Cooking Equipment': CookingPot,
}

export function EquipmentImage({ eq, className = '' }: { eq: Equipment; className?: string }) {
  if (eq.images[0]) {
    return <img src={eq.images[0]} alt={eq.name} className={`object-cover ${className}`} />
  }
  const Icon = categoryIcons[eq.category] ?? Package
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-navy-50 to-slate-100 ${className}`}>
      <Icon className="h-1/3 w-1/3 max-h-16 max-w-16 text-navy-600/60" aria-hidden="true" />
      <span className="sr-only">{eq.name} (no photo yet)</span>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="field-error" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  )
}

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  counts,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  counts?: Partial<Record<T, number>>
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            value === o ? 'bg-white text-navy-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {o}
          {counts?.[o] !== undefined && <span className="ml-1.5 text-xs text-slate-400">{counts[o]}</span>}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="px-4 py-12 text-center text-sm text-slate-500">{children}</div>
}
