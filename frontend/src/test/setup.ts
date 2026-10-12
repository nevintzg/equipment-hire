// Runs before every test file.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  // Unmount anything rendered and wipe the demo store so tests don't leak into each other.
  cleanup()
  localStorage.clear()
})

// jsdom doesn't implement scrolling; the app calls window.scrollTo when changing steps/pages.
window.scrollTo = () => {}
