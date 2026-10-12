import { Check } from 'lucide-react'

const STEPS = ['Details', 'Review', 'Submit'] as const

export default function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2 text-sm">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-navy-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
            aria-current={i === step ? 'step' : undefined}
          >
            {i < step ? <Check className="h-4 w-4" /> : i + 1}
          </span>
          <span className={i === step ? 'font-semibold text-slate-900' : 'text-slate-500'}>{s}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300 sm:w-12" />}
        </li>
      ))}
    </ol>
  )
}
