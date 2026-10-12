import { describe, expect, it } from 'vitest'
import { estimateCost, refundPercent, unitsFreeOn, validateRequest } from './availability'
import { addDays, today } from './dates'
import { seedRules } from '../data/seed'
import { makeBooking, makeEquipment } from '../test/renderWithStore'

const eq = makeEquipment({ id: 'eq-tables', quantity: 5, dailyRate: 10 })

describe('rental price calculation (estimateCost)', () => {
  it('is daily rate × quantity × number of hire days', () => {
    // 3 units for 2 days at $10/day each = $60
    expect(estimateCost(eq, 3, '2030-05-01', '2030-05-02')).toBe(60)
  })

  it('charges one full day for a same-day hire', () => {
    expect(estimateCost(eq, 1, '2030-05-01', '2030-05-01')).toBe(10)
  })
})

describe('booking status and stock (unitsFreeOn)', () => {
  const on = '2030-05-01'
  const booking = (status: 'Pending' | 'Approved' | 'Confirmed' | 'Declined' | 'Cancelled') =>
    makeBooking({ equipmentId: eq.id, quantity: 2, startDate: on, endDate: on, status })

  it.each(['Approved', 'Confirmed'] as const)('%s bookings reserve stock', (status) => {
    expect(unitsFreeOn(eq, [booking(status)], on)).toBe(3)
  })

  it.each(['Pending', 'Declined', 'Cancelled'] as const)('%s bookings do not reserve stock', (status) => {
    expect(unitsFreeOn(eq, [booking(status)], on)).toBe(5)
  })

  it('never reports fewer than zero free units', () => {
    const big = makeBooking({ equipmentId: eq.id, quantity: 9, startDate: on, endDate: on, status: 'Confirmed' })
    expect(unitsFreeOn(eq, [big], on)).toBe(0)
  })
})

describe('hire request validation (validateRequest)', () => {
  const start = addDays(today(), 10)
  const valid = { equipmentId: eq.id, quantity: 2, startDate: start, endDate: addDays(start, 1) }
  const check = (overrides: Partial<typeof valid>, bookings = [] as ReturnType<typeof makeBooking>[]) =>
    validateRequest({ ...valid, ...overrides }, [eq], bookings, seedRules)

  it('accepts a valid request with no errors', () => {
    expect(check({})).toEqual({})
  })

  it('requires an existing, active equipment item', () => {
    expect(check({ equipmentId: 'nope' }).equipmentId).toBe('Choose an item to hire.')
    expect(validateRequest(valid, [{ ...eq, active: false }], [], seedRules).equipmentId).toBeTruthy()
  })

  it('requires both a start and end date', () => {
    const errors = check({ startDate: '', endDate: '' })
    expect(errors.startDate).toBe('Choose a hire date.')
    expect(errors.endDate).toBe('Choose a return date.')
  })

  it('rejects a start date sooner than the minimum lead time', () => {
    const tooSoon = addDays(today(), seedRules.minLeadDays - 1)
    expect(check({ startDate: tooSoon, endDate: tooSoon }).startDate).toBe(
      `Hire must start at least ${seedRules.minLeadDays} days from today.`,
    )
  })

  it('rejects an end date earlier than the start date', () => {
    expect(check({ endDate: addDays(start, -1) }).endDate).toBe('Return date must be on or after the hire date.')
  })

  it('rejects a hire longer than the maximum number of days', () => {
    expect(check({ endDate: addDays(start, seedRules.maxHireDays) }).endDate).toBe(
      `The longest hire is ${seedRules.maxHireDays} days.`,
    )
  })

  it('rejects a quantity below 1 or above total stock', () => {
    expect(check({ quantity: 0 }).quantity).toBe('Quantity must be at least 1.')
    expect(check({ quantity: 6 }).quantity).toBe('We only have 5 of these.')
  })

  it('rejects a quantity larger than what is free on those dates', () => {
    const taken = makeBooking({ equipmentId: eq.id, quantity: 4, startDate: start, endDate: start, status: 'Confirmed' })
    expect(check({ quantity: 2 }, [taken]).quantity).toBe('Only 1 available for the whole of those dates.')
  })
})

describe('cancellation refund (refundPercent)', () => {
  it('gives the early refund when cancelling with more than the notice period', () => {
    expect(refundPercent(seedRules, '2030-01-20', '2030-01-01')).toBe(seedRules.earlyRefundPercent)
  })

  it('gives the late refund when cancelling within the notice period', () => {
    expect(refundPercent(seedRules, '2030-01-05', '2030-01-01')).toBe(seedRules.lateRefundPercent)
  })
})
