import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { categoryIcons } from '../../components/ui'
import type { Category } from '../../types'
import { STEPS } from './HowItWorks'

const POPULAR: { category: Category; label: string }[] = [
  { category: 'Marquees', label: 'Marquees' },
  { category: 'Tables', label: 'Tables' },
  { category: 'Audio Equipment', label: 'Audio' },
  { category: 'Sporting Equipment', label: 'Sporting' },
  { category: 'Cooking Equipment', label: 'Cooking' },
]

export default function Home() {
  const { equipment } = useStore()
  const countFor = (c: Category) => equipment.filter((e) => e.active && e.category === c).length

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src="/images/marquee.png" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-navy-900/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold tracking-wide text-emerald-300 uppercase">For community groups</p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Equipment Hire Made Simple</h1>
            <p className="mt-4 text-lg text-white/85">
              Find and request marquees, tables, audio gear and more for your community organisation. Check
              availability before you ask.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/equipment" className="btn-primary px-6 py-3 text-base">
                Browse Equipment <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/status" className="btn px-6 py-3 text-base text-white ring-1 ring-white/40 hover:bg-white/10">
                Check a booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold text-slate-900">Popular equipment</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {POPULAR.map(({ category, label }) => {
            const Icon = categoryIcons[category]
            return (
              <Link
                key={category}
                to={`/equipment?category=${encodeURIComponent(category)}`}
                className="card group flex flex-col items-center gap-3 px-4 py-6 text-center transition hover:-translate-y-0.5 hover:border-navy-600/40 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-600 group-hover:bg-navy-600 group-hover:text-white">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="font-semibold text-slate-900">{label}</span>
                <span className="text-xs text-slate-500">{countFor(category)} {countFor(category) === 1 ? 'item' : 'items'}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-bold text-slate-900">How it works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
          <Link to="/equipment" className="btn-primary mt-10">
            Start by browsing equipment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
