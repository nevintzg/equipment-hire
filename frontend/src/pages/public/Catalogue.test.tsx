import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Catalogue from './Catalogue'
import { makeBooking, makeEquipment, renderWithStore } from '../../test/renderWithStore'
import { today } from '../../lib/dates'

const marquee = makeEquipment({ id: 'eq-marquee', name: 'Large Event Marquee', category: 'Marquees', quantity: 5, condition: 'Good', dailyRate: 50 })
const speakers = makeEquipment({ id: 'eq-speakers', name: 'PA Speakers', category: 'Audio Equipment', quantity: 2, condition: 'Fair', dailyRate: 40 })
const tables = makeEquipment({ id: 'eq-tables', name: 'Folding Tables', category: 'Tables', quantity: 20, condition: 'Excellent', dailyRate: 5 })
const retired = makeEquipment({ id: 'eq-old', name: 'Old Urn', category: 'Cooking Equipment', active: false })

// Both speakers are out today, so they should show as fully booked.
const speakersBookedToday = makeBooking({ id: 3001, equipmentId: 'eq-speakers', quantity: 2, startDate: today(), endDate: today(), status: 'Confirmed' })

function renderCatalogue(route = '/equipment') {
  return renderWithStore(<Catalogue />, {
    route,
    path: '/equipment',
    data: { equipment: [marquee, speakers, tables, retired], bookings: [speakersBookedToday] },
  })
}

/** The catalogue card (list item) for a piece of equipment, found by its name. */
const card = (name: string) => screen.getByRole('link', { name }).closest('li')!

const visibleNames = () => screen.queryAllByRole('heading', { level: 2 }).map((h) => h.textContent)

describe('Catalogue – equipment display', () => {
  it('shows name, category, quantity, condition, price and availability for each item', () => {
    renderCatalogue()
    const c = within(card('Large Event Marquee'))
    expect(c.getByText('Marquees')).toBeInTheDocument()
    expect(c.getByText(/of 5 available/)).toHaveTextContent('5 of 5 available')
    expect(c.getByText('Good')).toBeInTheDocument()
    expect(c.getByText('$50')).toBeInTheDocument()
    expect(c.getByText('Available')).toBeInTheDocument()
  })

  it('shows "Fully booked today" when every unit is booked today', () => {
    renderCatalogue()
    const c = within(card('PA Speakers'))
    expect(c.getByText(/of 2 available/)).toHaveTextContent('0 of 2 available')
    expect(c.getByText('Fully booked today')).toBeInTheDocument()
  })

  it('hides inactive equipment', () => {
    renderCatalogue()
    expect(screen.queryByText('Old Urn')).not.toBeInTheDocument()
  })

  it('has a "View details" button linking to the equipment page', () => {
    renderCatalogue()
    expect(within(card('Folding Tables')).getByRole('link', { name: 'View details' })).toHaveAttribute('href', '/equipment/eq-tables')
  })
})

describe('Catalogue – search and filtering', () => {
  it('searches by equipment name (case-insensitive)', async () => {
    renderCatalogue()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search equipment' }), 'MARQUEE')
    expect(visibleNames()).toEqual(['Large Event Marquee'])
  })

  it('filters by category using the dropdown', async () => {
    renderCatalogue()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'Audio Equipment')
    expect(visibleNames()).toEqual(['PA Speakers'])
  })

  it('filters by category using the category buttons, and "All Equipment" resets it', async () => {
    renderCatalogue()
    await userEvent.click(screen.getByRole('button', { name: 'Tables' }))
    expect(visibleNames()).toEqual(['Folding Tables'])
    await userEvent.click(screen.getByRole('button', { name: 'All Equipment' }))
    expect(visibleNames()).toHaveLength(3)
  })

  it('filters to items available today', async () => {
    renderCatalogue()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Availability' }), 'Available today')
    expect(visibleNames()).toEqual(['Large Event Marquee', 'Folding Tables'])
  })

  it('reads filters from the URL', () => {
    renderCatalogue('/equipment?category=Marquees')
    expect(visibleNames()).toEqual(['Large Event Marquee'])
  })

  it('shows a message when nothing matches', async () => {
    renderCatalogue()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search equipment' }), 'trampoline')
    expect(screen.getByText('No equipment matches those filters.')).toBeInTheDocument()
  })
})
