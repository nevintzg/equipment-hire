import type { Booking, BookingRules, BookingStatus, Equipment } from '../types'
import { diffDays, eachDay, hireDays, rangesOverlap, today } from './dates'

/** Bookings in these states reserve stock. Pending requests don't until staff approve them. */
export const HOLDS_STOCK: BookingStatus[] = ['Approved', 'Confirmed']

export function unitsBookedOn(bookings: Booking[], equipmentId: string, date: string, excludeId?: number): number {
  return bookings
    .filter(
      (b) =>
        b.equipmentId === equipmentId &&
        b.id !== excludeId &&
        HOLDS_STOCK.includes(b.status) &&
        b.startDate <= date &&
        date <= b.endDate,
    )
    .reduce((sum, b) => sum + b.quantity, 0)
}

export function unitsFreeOn(eq: Equipment, bookings: Booking[], date: string, excludeId?: number): number {
  return Math.max(0, eq.quantity - unitsBookedOn(bookings, eq.id, date, excludeId))
}

/** Fewest free units on any day in the range, which is the most that can be hired for the whole range. */
export function unitsFreeForRange(
  eq: Equipment,
  bookings: Booking[],
  start: string,
  end: string,
  excludeId?: number,
): number {
  return Math.min(...eachDay(start, end).map((d) => unitsFreeOn(eq, bookings, d, excludeId)))
}

export function pendingOn(bookings: Booking[], equipmentId: string, date: string): number {
  return bookings
    .filter((b) => b.equipmentId === equipmentId && b.status === 'Pending' && b.startDate <= date && date <= b.endDate)
    .reduce((s, b) => s + b.quantity, 0)
}

export function overlappingBookings(bookings: Booking[], equipmentId: string, start: string, end: string): Booking[] {
  return bookings.filter(
    (b) => b.equipmentId === equipmentId && HOLDS_STOCK.includes(b.status) && rangesOverlap(b.startDate, b.endDate, start, end),
  )
}

export function estimateCost(eq: Equipment, quantity: number, start: string, end: string): number {
  return eq.dailyRate * quantity * hireDays(start, end)
}

/** Refund owed on the hire cost if the booking is cancelled today, per the configured rules. */
export function refundPercent(rules: BookingRules, startDate: string, on = today()): number {
  return diffDays(on, startDate) > rules.noticeDays ? rules.earlyRefundPercent : rules.lateRefundPercent
}

export interface RequestInput {
  equipmentId: string
  quantity: number
  startDate: string
  endDate: string
}

/** Checks a hire request against the booking rules and current stock. Returns error messages keyed by field. */
export function validateRequest(
  input: RequestInput,
  equipment: Equipment[],
  bookings: Booking[],
  rules: BookingRules,
): Record<string, string> {
  const errors: Record<string, string> = {}
  const eq = equipment.find((e) => e.id === input.equipmentId)
  if (!eq || !eq.active) {
    errors.equipmentId = 'Choose an item to hire.'
    return errors
  }
  if (!input.startDate) errors.startDate = 'Choose a hire date.'
  if (!input.endDate) errors.endDate = 'Choose a return date.'
  if (!Number.isInteger(input.quantity) || input.quantity < 1) errors.quantity = 'Quantity must be at least 1.'
  else if (input.quantity > eq.quantity) errors.quantity = `We only have ${eq.quantity} of these.`
  if (errors.startDate || errors.endDate) return errors

  const earliest = diffDays(today(), input.startDate)
  if (earliest < rules.minLeadDays) {
    errors.startDate = `Hire must start at least ${rules.minLeadDays} days from today.`
  }
  if (input.endDate < input.startDate) {
    errors.endDate = 'Return date must be on or after the hire date.'
  } else if (hireDays(input.startDate, input.endDate) > rules.maxHireDays) {
    errors.endDate = `The longest hire is ${rules.maxHireDays} days.`
  }
  if (!errors.quantity && !errors.endDate && !errors.startDate) {
    const free = unitsFreeForRange(eq, bookings, input.startDate, input.endDate)
    if (free < input.quantity) {
      errors.quantity =
        free === 0
          ? 'This item is fully booked on some of those dates.'
          : `Only ${free} available for the whole of those dates.`
    }
  }
  return errors
}
