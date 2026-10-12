import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingDetail from './BookingDetail'
import { makeBooking, makeEquipment, renderWithStore } from '../../test/renderWithStore'
import type { Booking } from '../../types'

const marquee = makeEquipment({ id: 'eq-marquee', name: 'Large Event Marquee', category: 'Marquees', quantity: 5 })

const pending = makeBooking({
  id: 2001,
  equipmentId: 'eq-marquee',
  quantity: 2,
  startDate: '2030-06-10',
  endDate: '2030-06-12',
  organisation: 'ABC Community Group',
  contactName: 'John Smith',
  email: 'john@example.com',
  status: 'Pending',
  hireCost: 300,
})

function renderBooking(id: number, bookings: Booking[]) {
  return renderWithStore(<BookingDetail />, {
    route: `/admin/bookings/${id}`,
    path: '/admin/bookings/:id',
    data: { equipment: [marquee], bookings },
  })
}

/** The status badge shown next to the "Booking #…" title. */
const statusBadge = () => screen.getByRole('heading', { level: 1 }).parentElement!.nextElementSibling!

describe('Admin BookingDetail – information', () => {
  it('shows the customer, equipment, cost and status', () => {
    renderBooking(2001, [pending])
    expect(screen.getByRole('heading', { name: 'Booking #2001' })).toBeInTheDocument()
    expect(screen.getByText('ABC Community Group')).toBeInTheDocument()
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'john@example.com' })).toHaveAttribute('href', 'mailto:john@example.com')
    expect(screen.getByRole('link', { name: '2 × Large Event Marquee' })).toBeInTheDocument()
    expect(screen.getByText('$300')).toBeInTheDocument()
    expect(statusBadge()).toHaveTextContent('Pending')
  })

  it('shows a not-found message for an unknown booking ID', () => {
    renderBooking(9999, [pending])
    expect(screen.getByText("That booking doesn't exist.")).toBeInTheDocument()
  })
})

describe('Admin BookingDetail – actions', () => {
  it('Approve changes a pending booking to Approved', async () => {
    renderBooking(2001, [pending])
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(statusBadge()).toHaveTextContent('Approved')
    expect(screen.getByText('Approved by staff — awaiting payment')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('Approve is blocked with an error when it would double-book stock', async () => {
    const clash = makeBooking({ id: 2002, equipmentId: 'eq-marquee', quantity: 4, startDate: '2030-06-11', endDate: '2030-06-11', status: 'Confirmed' })
    renderBooking(2001, [pending, clash])
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(screen.getByRole('alert')).toHaveTextContent("Can't approve: only 1 of Large Event Marquee free")
    expect(statusBadge()).toHaveTextContent('Pending')
  })

  it('Decline asks for a reason and then marks the booking Declined', async () => {
    renderBooking(2001, [pending])
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }))
    await userEvent.type(screen.getByLabelText(/Reason for declining/), 'All marquees are out for repair')
    await userEvent.click(screen.getByRole('button', { name: 'Decline request' }))
    expect(statusBadge()).toHaveTextContent('Declined')
    expect(screen.getByText('Declined: All marquees are out for repair')).toBeInTheDocument()
    expect(screen.getByText('No actions — this booking is closed.')).toBeInTheDocument()
  })

  it('Back on the decline form returns without changing the status', async () => {
    renderBooking(2001, [pending])
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }))
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(statusBadge()).toHaveTextContent('Pending')
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
  })

  it('an Approved booking shows its payment link and can be cancelled', () => {
    renderBooking(2001, [{ ...pending, status: 'Approved' }])
    expect(screen.getByRole('link', { name: '/pay/2001' })).toHaveAttribute('href', '/pay/2001')
    expect(screen.getByRole('button', { name: 'Cancel booking' })).toBeInTheDocument()
  })

  it('has a navigation link back to all bookings', () => {
    renderBooking(2001, [pending])
    expect(screen.getByRole('link', { name: 'All bookings' })).toHaveAttribute('href', '/admin/bookings')
  })
})
