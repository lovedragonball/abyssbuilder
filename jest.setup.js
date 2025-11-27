/**
 * Jest Setup File
 * 
 * This file runs before each test suite and sets up the testing environment.
 */

// Import Jest DOM matchers
import '@testing-library/jest-dom'
import React from 'react'

// Import jest-axe for accessibility testing
import { toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

// Mock lucide-react icons to avoid ESM parsing issues in Jest
jest.mock('lucide-react', () => {
  const createIcon = (name) =>
    React.forwardRef((props, ref) => (
      <svg {...props} ref={ref} data-icon={name} />
    ))

  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === '__esModule') return true
        return createIcon(String(prop))
      },
    }
  )
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Suppress console errors in tests (optional)
// Uncomment if you want to suppress React error boundary logs
// const originalError = console.error
// beforeAll(() => {
//   console.error = (...args) => {
//     if (
//       typeof args[0] === 'string' &&
//       args[0].includes('Warning: ReactDOM.render')
//     ) {
//       return
//     }
//     originalError.call(console, ...args)
//   }
// })

// afterAll(() => {
//   console.error = originalError
// })
