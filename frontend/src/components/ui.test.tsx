import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, ConditionText, EquipmentImage } from './ui'
import { makeEquipment } from '../test/renderWithStore'

describe('Badge (booking status)', () => {
  it.each([
    ['Pending', 'bg-amber-50'],
    ['Approved', 'bg-sky-50'],
    ['Confirmed', 'bg-emerald-50'],
    ['Declined', 'bg-red-50'],
  ])('shows "%s" with its colour', (status, colourClass) => {
    render(<Badge>{status}</Badge>)
    expect(screen.getByText(status)).toHaveClass(colourClass)
  })

  it('falls back to a neutral style for unknown labels', () => {
    render(<Badge>Something else</Badge>)
    expect(screen.getByText('Something else')).toHaveClass('bg-slate-100')
  })
})

describe('ConditionText', () => {
  it('shows good condition in green and needs-repair in red', () => {
    render(
      <>
        <ConditionText condition="Excellent" />
        <ConditionText condition="Needs repair" />
      </>,
    )
    expect(screen.getByText('Excellent')).toHaveClass('text-emerald-700')
    expect(screen.getByText('Needs repair')).toHaveClass('text-red-700')
  })
})

describe('EquipmentImage', () => {
  it('shows the first photo with the equipment name as alt text', () => {
    render(<EquipmentImage eq={makeEquipment({ name: 'Marquee', images: ['/m.png'] })} />)
    expect(screen.getByRole('img', { name: 'Marquee' })).toHaveAttribute('src', '/m.png')
  })

  it('shows a placeholder with screen-reader text when there is no photo', () => {
    render(<EquipmentImage eq={makeEquipment({ name: 'Gazebo', images: [] })} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Gazebo (no photo yet)')).toBeInTheDocument()
  })
})
