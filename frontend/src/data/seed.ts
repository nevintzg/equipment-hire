import type { Booking, BookingRules, BookingStatus, DepositStatus, Equipment, PaymentStatus } from '../types'
import { addDays, hireDays, today } from '../lib/dates'

export const seedEquipment: Equipment[] = [
  {
    id: 'eq-marquee',
    name: 'Large Event Marquee',
    category: 'Marquees',
    description:
      'Spacious 6 × 12 m marquee suitable for community events, festivals and gatherings. Includes poles, pegs and side walls. Set-up takes 4 people about 90 minutes.',
    images: ['/images/marquee.png'],
    quantity: 5,
    condition: 'Good',
    active: true,
    dailyRate: 50,
  },
  {
    id: 'eq-gazebo',
    name: 'Pop-up Gazebo 3 × 3 m',
    category: 'Marquees',
    description: 'Quick-assembly gazebo for stalls, registration desks and shade. Carry bag and weights included.',
    images: [],
    quantity: 8,
    condition: 'Good',
    active: true,
    dailyRate: 15,
  },
  {
    id: 'eq-tables',
    name: 'Folding Tables',
    category: 'Tables',
    description: '1.8 m trestle-style folding tables with a wipe-clean top. Seats six. Light enough for one person to carry.',
    images: ['/images/tables.png'],
    quantity: 20,
    condition: 'Good',
    active: true,
    dailyRate: 5,
  },
  {
    id: 'eq-speakers',
    name: 'Audio Speaker System',
    category: 'Audio Equipment',
    description:
      'Two powered 12" speakers on stands plus a 15" subwoofer. Bluetooth and XLR inputs. Suits outdoor events of up to 200 people.',
    images: ['/images/speakers.png'],
    quantity: 4,
    condition: 'Fair',
    active: true,
    dailyRate: 40,
  },
  {
    id: 'eq-mics',
    name: 'Wireless Microphone Set',
    category: 'Audio Equipment',
    description: 'Two handheld wireless microphones with receiver. Works with the Audio Speaker System.',
    images: [],
    quantity: 3,
    condition: 'Excellent',
    active: true,
    dailyRate: 15,
  },
  {
    id: 'eq-sport',
    name: 'Sporting Equipment Kit',
    category: 'Sporting Equipment',
    description:
      'Mixed kit for come-and-try days: cricket set, soccer and basketballs, tennis racquets, cones and a pump.',
    images: ['/images/sporting.png'],
    quantity: 6,
    condition: 'Good',
    active: true,
    dailyRate: 20,
  },
  {
    id: 'eq-bbq',
    name: 'BBQ Cooking Unit',
    category: 'Cooking Equipment',
    description: 'Trailer-free four-burner gas BBQ with hotplate and grill. Gas bottle supplied full; please return it attached.',
    images: [],
    quantity: 2,
    condition: 'Good',
    active: true,
    dailyRate: 35,
  },
  {
    id: 'eq-urn',
    name: 'Hot Water Urn 20 L',
    category: 'Cooking Equipment',
    description: 'Electric urn for tea and coffee stations.',
    images: [],
    quantity: 2,
    condition: 'Needs repair',
    active: false,
    dailyRate: 10,
  },
]

export const seedRules: BookingRules = {
  noticeDays: 7,
  earlyRefundPercent: 100,
  lateRefundPercent: 50,
  depositAmount: 500,
  minLeadDays: 2,
  maxHireDays: 14,
  conditions:
    'Equipment must be collected from and returned to the CRN SA depot during opening hours. The hirer is responsible for loss or damage during the hire period. The refundable deposit is returned once equipment is checked back in, in the same condition.',
}

interface SeedRow {
  id: number
  eq: string
  qty: number
  start: number
  len: number
  org: string
  contact: string
  status: BookingStatus
  pay?: PaymentStatus
  dep?: DepositStatus
  deposit?: number
}

// Offsets are days from today, so the demo always shows upcoming activity.
const past = (id: number, eq: string, qty: number, start: number, len: number, org: string, contact: string): SeedRow => ({
  id, eq, qty, start, len, org, contact, status: 'Confirmed', pay: 'Paid', dep: 'Refunded',
})

const rows: SeedRow[] = [
  past(1004, 'eq-marquee', 4, -80, 3, 'Glenelg Surf Life Saving Club', 'Ben Harris'),
  past(1005, 'eq-tables', 16, -75, 2, 'Glenelg Surf Life Saving Club', 'Ben Harris'),
  past(1006, 'eq-speakers', 2, -64, 2, 'Salisbury Youth Choir', 'Ava Martin'),
  past(1007, 'eq-sport', 5, -58, 3, 'Parkside Youth Centre', 'Jess Lim'),
  past(1008, 'eq-marquee', 3, -50, 4, 'Norwood Food Festival', 'Luca Bianchi'),
  past(1009, 'eq-bbq', 2, -44, 2, 'Westside Rotary', 'Alan Pierce'),
  past(1010, 'eq-gazebo', 6, -40, 2, 'Port Adelaide Markets', 'Kim Tran'),
  past(1011, 'eq-tables', 20, -35, 3, 'Adelaide Hills Farmers Market', 'Sam Oduya'),
  past(1012, 'eq-marquee', 2, -28, 5, 'Harbour Arts Festival', 'Ellie Chen'),
  past(1013, 'eq-speakers', 3, -26, 3, 'Harbour Arts Festival', 'Ellie Chen'),
  past(1014, 'eq-sport', 4, -22, 2, 'Marion Netball Association', 'Chloe Singh'),
  past(1015, 'eq-mics', 2, -17, 2, 'Unley Toastmasters', 'Grace Park'),
  past(1016, 'eq-gazebo', 4, -15, 3, 'Seaview Senior Citizens', 'Margaret Doyle'),
  past(1017, 'eq-marquee', 3, -9, 4, 'Riverbank Primary School', 'Tom Walsh'),
  { id: 1018, eq: 'eq-tables', qty: 12, start: -20, len: 2, org: 'Northside Lions Club', contact: 'Priya Nair', status: 'Confirmed', pay: 'Paid', dep: 'Refunded', deposit: 300 },
  { id: 1019, eq: 'eq-marquee', qty: 2, start: -12, len: 3, org: 'Riverbank Primary School', contact: 'Tom Walsh', status: 'Confirmed', pay: 'Paid', dep: 'Held' },
  { id: 1020, eq: 'eq-speakers', qty: 1, start: -6, len: 1, org: 'Seaview Senior Citizens', contact: 'Margaret Doyle', status: 'Cancelled', pay: 'Refunded', dep: 'Refunded', deposit: 300 },
  { id: 1021, eq: 'eq-marquee', qty: 3, start: 5, len: 2, org: 'Adelaide Hills Farmers Market', contact: 'Sam Oduya', status: 'Confirmed', pay: 'Paid', dep: 'Held' },
  { id: 1022, eq: 'eq-bbq', qty: 1, start: 8, len: 1, org: 'Westside Rotary', contact: 'Alan Pierce', status: 'Approved', pay: 'Unpaid', dep: 'Unpaid', deposit: 250 },
  { id: 1023, eq: 'eq-sport', qty: 4, start: 12, len: 2, org: 'Parkside Youth Centre', contact: 'Jess Lim', status: 'Confirmed', pay: 'Paid', dep: 'Held', deposit: 300 },
  { id: 1024, eq: 'eq-marquee', qty: 2, start: 21, len: 3, org: 'ABC Community Group', contact: 'John Smith', status: 'Pending' },
  { id: 1025, eq: 'eq-tables', qty: 15, start: 26, len: 2, org: 'XYZ Sports Club', contact: 'Maria Rossi', status: 'Approved', pay: 'Unpaid', dep: 'Unpaid' },
  { id: 1026, eq: 'eq-speakers', qty: 2, start: 28, len: 1, org: 'Community Club', contact: 'Daniel Ng', status: 'Declined' },
  { id: 1027, eq: 'eq-marquee', qty: 2, start: 14, len: 4, org: 'Harbour Arts Festival', contact: 'Ellie Chen', status: 'Confirmed', pay: 'Paid', dep: 'Held' },
  { id: 1028, eq: 'eq-tables', qty: 8, start: 9, len: 1, org: 'St Mary’s Parish', contact: 'Frank O’Neill', status: 'Pending' },
  { id: 1029, eq: 'eq-mics', qty: 1, start: 16, len: 1, org: 'Unley Toastmasters', contact: 'Grace Park', status: 'Pending' },
]

export function buildSeedBookings(): Booking[] {
  const t = today()
  const created = new Date(Date.now() - 3 * 86_400_000).toISOString()
  return rows.map((r) => {
    const eq = seedEquipment.find((e) => e.id === r.eq)!
    const startDate = addDays(t, r.start)
    const endDate = addDays(startDate, r.len - 1)
    const paid = r.pay === 'Paid' || r.pay === 'Refunded'
    return {
      id: r.id,
      equipmentId: r.eq,
      quantity: r.qty,
      startDate,
      endDate,
      organisation: r.org,
      contactName: r.contact,
      email: r.contact.toLowerCase().replace(/[^a-z]+/g, '.') + '@example.org.au',
      phone: '0412 345 678',
      notes: '',
      status: r.status,
      createdAt: created,
      hireCost: eq.dailyRate * r.qty * hireDays(startDate, endDate),
      deposit: r.deposit ?? seedRules.depositAmount,
      paymentStatus: r.pay ?? 'Unpaid',
      depositStatus: r.dep ?? 'Unpaid',
      paidAt: paid ? created : undefined,
      paymentRef: paid ? `pi_demo_${r.id}` : undefined,
      depositRefundedAt: r.dep === 'Refunded' ? created : undefined,
      history: [{ at: created, text: 'Request submitted' }],
    }
  })
}
