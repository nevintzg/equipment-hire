import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStoreProvider } from '../store/AppStore'
import { seedRules } from '../data/seed'
import type { Booking, BookingRules, Equipment } from '../types'

// Must match STORAGE_KEY in src/store/AppStore.tsx. The store loads its starting data from here.
const STORAGE_KEY = 'crnsa-hire-demo-v1'

export interface StoreData {
  equipment?: Equipment[]
  bookings?: Booking[]
  rules?: BookingRules
}

/** Builds an Equipment item with sensible defaults; override only what a test cares about. */
export function makeEquipment(overrides: Partial<Equipment> = {}): Equipment {
  return {
    id: 'eq-test',
    name: 'Test Item',
    category: 'Tables',
    description: 'A test item.',
    images: [],
    quantity: 5,
    condition: 'Good',
    active: true,
    dailyRate: 10,
    ...overrides,
  }
}

/** Builds a Booking with sensible defaults; override only what a test cares about. */
export function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 2000,
    equipmentId: 'eq-test',
    quantity: 1,
    startDate: '2030-01-10',
    endDate: '2030-01-11',
    organisation: 'Test Org',
    contactName: 'Alex Tester',
    email: 'alex@example.com',
    phone: '0400 000 000',
    notes: '',
    status: 'Pending',
    createdAt: '2030-01-01T09:00:00.000Z',
    hireCost: 20,
    deposit: 500,
    paymentStatus: 'Unpaid',
    depositStatus: 'Unpaid',
    history: [{ at: '2030-01-01T09:00:00.000Z', text: 'Request submitted' }],
    ...overrides,
  }
}

/**
 * Renders a page inside the real app store and a memory router.
 * The store starts with exactly the data given (instead of the random-ish demo seed data).
 */
export function renderWithStore(
  ui: ReactNode,
  { route = '/', path = '/', data = {}, extraRoutes }: { route?: string; path?: string; data?: StoreData; extraRoutes?: ReactNode } = {},
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ equipment: data.equipment ?? [], bookings: data.bookings ?? [], rules: data.rules ?? seedRules }),
  )
  return render(
    <AppStoreProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          {extraRoutes}
        </Routes>
      </MemoryRouter>
    </AppStoreProvider>,
  )
}
