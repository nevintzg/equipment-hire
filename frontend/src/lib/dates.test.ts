import { describe, expect, it } from 'vitest'
import { addDays, diffDays, hireDays, rangesOverlap } from './dates'

describe('rental duration (dates.ts)', () => {
  it('counts both the start and end day as hire days', () => {
    expect(hireDays('2030-03-10', '2030-03-10')).toBe(1)
    expect(hireDays('2030-03-10', '2030-03-12')).toBe(3)
  })

  it('works across month and year boundaries', () => {
    expect(hireDays('2030-01-30', '2030-02-02')).toBe(4)
    expect(hireDays('2030-12-31', '2031-01-01')).toBe(2)
  })

  it('diffDays is negative when the end is before the start', () => {
    expect(diffDays('2030-03-12', '2030-03-10')).toBe(-2)
  })

  it('addDays moves forwards and backwards by calendar days', () => {
    expect(addDays('2030-02-28', 1)).toBe('2030-03-01')
    expect(addDays('2030-03-01', -1)).toBe('2030-02-28')
  })

  it('rangesOverlap detects shared days, including touching edges', () => {
    expect(rangesOverlap('2030-01-01', '2030-01-05', '2030-01-05', '2030-01-08')).toBe(true)
    expect(rangesOverlap('2030-01-01', '2030-01-04', '2030-01-05', '2030-01-08')).toBe(false)
  })
})
