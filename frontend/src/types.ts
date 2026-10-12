export const CATEGORIES = [
  'Marquees',
  'Tables',
  'Audio Equipment',
  'Sporting Equipment',
  'Cooking Equipment',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs repair'] as const
export type Condition = (typeof CONDITIONS)[number]

export interface Equipment {
  id: string
  name: string
  category: Category
  description: string
  images: string[]
  quantity: number
  condition: Condition
  active: boolean
  /** Hire rate per unit per day, in dollars. */
  dailyRate: number
}

export const BOOKING_STATUSES = ['Pending', 'Approved', 'Confirmed', 'Declined', 'Cancelled'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded' | 'Partially refunded'
export type DepositStatus = 'Unpaid' | 'Held' | 'Refunded'

export interface Booking {
  id: number
  equipmentId: string
  quantity: number
  /** Inclusive ISO dates, YYYY-MM-DD. */
  startDate: string
  endDate: string
  organisation: string
  contactName: string
  email: string
  phone: string
  notes: string
  status: BookingStatus
  createdAt: string
  hireCost: number
  deposit: number
  paymentStatus: PaymentStatus
  depositStatus: DepositStatus
  paidAt?: string
  paymentRef?: string
  refundAmount?: number
  depositRefundedAt?: string
  statusReason?: string
  history: { at: string; text: string }[]
}

export interface BookingRules {
  /** Cancelling more than this many days before hire start gets the early refund. */
  noticeDays: number
  earlyRefundPercent: number
  lateRefundPercent: number
  depositAmount: number
  minLeadDays: number
  maxHireDays: number
  conditions: string
}

export interface AdminUser {
  name: string
  email: string
}
