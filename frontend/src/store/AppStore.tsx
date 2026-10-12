import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AdminUser, Booking, BookingRules, Equipment } from '../types'
import { buildSeedBookings, seedEquipment, seedRules } from '../data/seed'
import { estimateCost, refundPercent, unitsFreeForRange, validateRequest } from '../lib/availability'

/*
 * Stand-in for the backend. Everything lives in localStorage so the full journey
 * (request → approval → payment → availability update) can be demonstrated in one browser.
 * The same checks (validateRequest, stock re-check on approval) belong on the server
 * in the real system so double-booking is prevented there, not just in the UI.
 */

const STORAGE_KEY = 'crnsa-hire-demo-v1'

export const DEMO_ADMIN = { email: 'admin@crnsa.org.au', password: 'admin123', name: 'CRN SA Staff' }

interface State {
  equipment: Equipment[]
  bookings: Booking[]
  rules: BookingRules
  admin: AdminUser | null
  /** Request IDs submitted from this browser, so hirers can find them again. */
  myRequests: number[]
}

function initialState(): State {
  return { equipment: seedEquipment, bookings: buildSeedBookings(), rules: seedRules, admin: null, myRequests: [] }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState(), ...JSON.parse(raw) }
  } catch {
    // Fall through to fresh demo data.
  }
  return initialState()
}

export interface NewRequest {
  equipmentId: string
  quantity: number
  startDate: string
  endDate: string
  organisation: string
  contactName: string
  email: string
  phone: string
  notes: string
}

type Result = { ok: true } | { ok: false; error: string }

interface Store extends State {
  submitRequest(req: NewRequest): { ok: true; id: number } | { ok: false; errors: Record<string, string> }
  approve(id: number): Result
  decline(id: number, reason: string): void
  cancel(id: number, by: 'hirer' | 'staff', reason?: string): void
  pay(id: number): void
  refundDeposit(id: number): void
  saveEquipment(eq: Equipment): void
  saveRules(rules: BookingRules): void
  login(email: string, password: string): boolean
  logout(): void
  resetDemo(): void
  equipmentById(id: string): Equipment | undefined
}

const Ctx = createContext<Store | null>(null)

const now = () => new Date().toISOString()

function logged(b: Booking, text: string, patch: Partial<Booking>): Booking {
  return { ...b, ...patch, history: [...b.history, { at: now(), text }] }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage full (e.g. large uploaded images) — keep working in memory.
    }
  }, [state])

  const updateBooking = useCallback((id: number, fn: (b: Booking, s: State) => Booking) => {
    setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? fn(b, s) : b)) }))
  }, [])

  const submitRequest: Store['submitRequest'] = (req) => {
    const errors = validateRequest(req, state.equipment, state.bookings, state.rules)
    if (Object.keys(errors).length) return { ok: false, errors }
    const eq = state.equipment.find((e) => e.id === req.equipmentId)!
    const id = Math.max(1000, ...state.bookings.map((b) => b.id)) + 1
    const booking: Booking = {
      ...req,
      id,
      status: 'Pending',
      createdAt: now(),
      hireCost: estimateCost(eq, req.quantity, req.startDate, req.endDate),
      deposit: state.rules.depositAmount,
      paymentStatus: 'Unpaid',
      depositStatus: 'Unpaid',
      history: [{ at: now(), text: 'Request submitted' }],
    }
    setState((s) => ({ ...s, bookings: [...s.bookings, booking], myRequests: [...s.myRequests, id] }))
    return { ok: true, id }
  }

  const approve: Store['approve'] = (id) => {
    const b = state.bookings.find((x) => x.id === id)
    const eq = b && state.equipment.find((e) => e.id === b.equipmentId)
    if (!b || !eq) return { ok: false, error: 'Booking not found.' }
    // Re-check stock at approval time: another request may have been approved since this one came in.
    const free = unitsFreeForRange(eq, state.bookings, b.startDate, b.endDate, b.id)
    if (free < b.quantity) {
      return {
        ok: false,
        error: `Can't approve: only ${free} of ${eq.name} free across those dates. Decline it or ask the hirer to change dates.`,
      }
    }
    updateBooking(id, (x) => logged(x, 'Approved by staff — awaiting payment', { status: 'Approved', statusReason: undefined }))
    return { ok: true }
  }

  const decline: Store['decline'] = (id, reason) =>
    updateBooking(id, (x) => logged(x, `Declined${reason ? `: ${reason}` : ''}`, { status: 'Declined', statusReason: reason }))

  const cancel: Store['cancel'] = (id, by, reason) =>
    updateBooking(id, (x, s) => {
      const patch: Partial<Booking> = { status: 'Cancelled', statusReason: reason }
      let text = `Cancelled by ${by === 'hirer' ? 'hirer' : 'staff'}`
      if (x.paymentStatus === 'Paid') {
        const pct = by === 'staff' ? 100 : refundPercent(s.rules, x.startDate)
        patch.refundAmount = Math.round((x.hireCost * pct) / 100)
        patch.paymentStatus = pct === 100 ? 'Refunded' : 'Partially refunded'
        patch.depositStatus = 'Refunded'
        patch.depositRefundedAt = now()
        text += ` — ${pct}% of hire cost refunded plus full deposit`
      }
      return logged(x, text, patch)
    })

  const pay: Store['pay'] = (id) =>
    updateBooking(id, (x) =>
      logged(x, 'Payment received — booking confirmed', {
        status: 'Confirmed',
        paymentStatus: 'Paid',
        depositStatus: 'Held',
        paidAt: now(),
        paymentRef: `pi_demo_${Math.random().toString(36).slice(2, 12)}`,
      }),
    )

  const refundDeposit: Store['refundDeposit'] = (id) =>
    updateBooking(id, (x) =>
      logged(x, 'Equipment returned — deposit refunded', { depositStatus: 'Refunded', depositRefundedAt: now() }),
    )

  const saveEquipment: Store['saveEquipment'] = (eq) =>
    setState((s) => ({
      ...s,
      equipment: s.equipment.some((e) => e.id === eq.id)
        ? s.equipment.map((e) => (e.id === eq.id ? eq : e))
        : [...s.equipment, eq],
    }))

  const saveRules: Store['saveRules'] = (rules) => setState((s) => ({ ...s, rules }))

  const login: Store['login'] = (email, password) => {
    if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) return false
    setState((s) => ({ ...s, admin: { name: DEMO_ADMIN.name, email: DEMO_ADMIN.email } }))
    return true
  }

  const logout = () => setState((s) => ({ ...s, admin: null }))

  const resetDemo = () => setState((s) => ({ ...initialState(), admin: s.admin }))

  const equipmentById = useCallback((id: string) => state.equipment.find((e) => e.id === id), [state.equipment])

  const value: Store = {
    ...state,
    submitRequest,
    approve,
    decline,
    cancel,
    pay,
    refundDeposit,
    saveEquipment,
    saveRules,
    login,
    logout,
    resetDemo,
    equipmentById,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside AppStoreProvider')
  return s
}
