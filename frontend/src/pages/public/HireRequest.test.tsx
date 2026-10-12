import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, useParams } from 'react-router-dom'
import HireRequest from './HireRequest'
import { makeEquipment, renderWithStore } from '../../test/renderWithStore'
import { addDays, today } from '../../lib/dates'
import { seedRules } from '../../data/seed'

const tables = makeEquipment({ id: 'eq-tables', name: 'Folding Tables', category: 'Tables', quantity: 20, dailyRate: 5 })

// Stand-in for the real "request submitted" page, so we can see where the form sends the user.
function SubmittedProbe() {
  const { id } = useParams()
  return <p>Submitted request {id}</p>
}

const start = addDays(today(), 10)

function renderForm(route = `/request?equipment=eq-tables&start=${start}&end=${addDays(start, 2)}`) {
  return renderWithStore(<HireRequest />, {
    route,
    path: '/request',
    data: { equipment: [tables] },
    extraRoutes: <Route path="/request/:id/submitted" element={<SubmittedProbe />} />,
  })
}

const reviewButton = () => screen.getByRole('button', { name: 'Review request' })

async function fillContactDetails() {
  await userEvent.type(screen.getByLabelText('Organisation name'), 'Riverbank Primary School')
  await userEvent.type(screen.getByLabelText('Contact name'), 'Tom Walsh')
  await userEvent.type(screen.getByLabelText('Email'), 'tom@example.com')
  await userEvent.type(screen.getByLabelText('Phone'), '0400 123 456')
}

describe('HireRequest – required fields', () => {
  it('shows an error for every missing contact field and stays on the form', async () => {
    renderForm()
    await userEvent.click(reviewButton())
    expect(screen.getByText('Enter your organisation name.')).toBeInTheDocument()
    expect(screen.getByText('Enter a contact name.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter a phone number we can reach you on.')).toBeInTheDocument()
    expect(screen.getByLabelText('Organisation name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('heading', { name: 'Hire request' })).toBeInTheDocument()
  })

  it('rejects an invalid email address', async () => {
    renderForm()
    await fillContactDetails()
    await userEvent.clear(screen.getByLabelText('Email'))
    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email')
    await userEvent.click(reviewButton())
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('clears a field error once the user edits that field', async () => {
    renderForm()
    await userEvent.click(reviewButton())
    await userEvent.type(screen.getByLabelText('Contact name'), 'T')
    expect(screen.queryByText('Enter a contact name.')).not.toBeInTheDocument()
  })
})

describe('HireRequest – date and quantity validation', () => {
  it('rejects a hire date that is too soon', async () => {
    renderForm()
    await fillContactDetails()
    fireEvent.change(screen.getByLabelText('Hire date'), { target: { value: today() } })
    await userEvent.click(reviewButton())
    expect(screen.getByText(`Hire must start at least ${seedRules.minLeadDays} days from today.`)).toBeInTheDocument()
  })

  it('rejects a return date earlier than the hire date', async () => {
    renderForm()
    await fillContactDetails()
    fireEvent.change(screen.getByLabelText('Return date'), { target: { value: addDays(start, -1) } })
    await userEvent.click(reviewButton())
    expect(screen.getByText('Return date must be on or after the hire date.')).toBeInTheDocument()
  })

  it('moves the return date forward when the hire date is set after it', () => {
    renderForm()
    const later = addDays(start, 5)
    fireEvent.change(screen.getByLabelText('Hire date'), { target: { value: later } })
    expect(screen.getByLabelText('Return date')).toHaveValue(later)
  })

  it('rejects more units than are in stock', async () => {
    renderForm()
    await fillContactDetails()
    await userEvent.clear(screen.getByLabelText('Quantity'))
    await userEvent.type(screen.getByLabelText('Quantity'), '21')
    await userEvent.click(reviewButton())
    expect(screen.getByText('We only have 20 of these.')).toBeInTheDocument()
  })
})

describe('HireRequest – price estimate and successful submission', () => {
  it('shows the estimated cost for the chosen quantity and dates', async () => {
    renderForm()
    await userEvent.clear(screen.getByLabelText('Quantity'))
    await userEvent.type(screen.getByLabelText('Quantity'), '4')
    // 4 tables × $5 × 3 days = $60
    expect(screen.getByText(/Estimated cost:/)).toHaveTextContent('Estimated cost: $60 + $500 refundable deposit')
  })

  it('goes to review, requires agreeing to the conditions, then submits', async () => {
    renderForm()
    await fillContactDetails()
    await userEvent.click(reviewButton())

    expect(screen.getByRole('heading', { name: 'Review your hire request' })).toBeInTheDocument()
    expect(screen.getByText('Riverbank Primary School')).toBeInTheDocument()

    const submit = screen.getByRole('button', { name: 'Submit request' })
    expect(submit).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: /I agree/ }))
    expect(submit).toBeEnabled()

    await userEvent.click(submit)
    // The store gives the first request ID 1001 when there are no existing bookings.
    expect(screen.getByText('Submitted request 1001')).toBeInTheDocument()
  })

  it('the Back button on the review step returns to the form with answers kept', async () => {
    renderForm()
    await fillContactDetails()
    await userEvent.click(reviewButton())
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Organisation name')).toHaveValue('Riverbank Primary School')
  })
})
