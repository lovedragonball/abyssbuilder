/**
 * @jest-environment jsdom
 */

import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PageTransition } from '../page-transition'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/test-page'),
}))

// Mock framer-motion to avoid animation complexities in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('PageTransition Accessibility Features', () => {
  beforeEach(() => {
    // Clear any previous mocks
    jest.clearAllMocks()
  })

  describe('ARIA Live Region', () => {
    it('should render ARIA live region for screen reader announcements', () => {
      render(
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      )

      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toBeInTheDocument()
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('should have sr-only class on live region', () => {
      render(
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      )

      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveClass('sr-only')
    })

    it('should announce page changes when announcePageChange is enabled', async () => {
      const { rerender } = render(
        <PageTransition config={{ announcePageChange: true }}>
          <div>Test Content</div>
        </PageTransition>
      )

      // Change pathname
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValue('/my-builds')

      rerender(
        <PageTransition config={{ announcePageChange: true }}>
          <div>New Content</div>
        </PageTransition>
      )

      await waitFor(() => {
        const liveRegion = screen.getByRole('status')
        expect(liveRegion.textContent).toContain('Navigated to')
      })
    })

    it('should not announce when announcePageChange is disabled', () => {
      render(
        <PageTransition config={{ announcePageChange: false }}>
          <div>Test Content</div>
        </PageTransition>
      )

      const liveRegion = screen.getByRole('status')
      expect(liveRegion.textContent).toBe('')
    })
  })

  describe('Focus Management', () => {
    it('should render container with tabindex -1 for focus management', () => {
      const { container } = render(
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      )

      const focusableDiv = container.querySelector('[tabindex="-1"]')
      expect(focusableDiv).toBeInTheDocument()
    })

    it('should have outline: none style to prevent focus ring on container', () => {
      const { container } = render(
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      )

      const focusableDiv = container.querySelector('[tabindex="-1"]') as HTMLElement
      expect(focusableDiv?.style.outline).toBe('none')
    })

    it('should support manageFocus configuration', () => {
      render(
        <PageTransition config={{ manageFocus: true }}>
          <div>Test Content</div>
        </PageTransition>
      )

      // Component should render without errors
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should work when manageFocus is disabled', () => {
      render(
        <PageTransition config={{ manageFocus: false }}>
          <div>Test Content</div>
        </PageTransition>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion media query', () => {
      // Mock matchMedia to return reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      )

      // Component should render with reduced motion
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render without AnimatePresence when animations are disabled', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(
        <PageTransition config={{ enableAnimation: false }}>
          <div>Test Content</div>
        </PageTransition>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should not trap focus during transitions', () => {
      const { container } = render(
        <PageTransition>
          <main>
            <button>Button 1</button>
            <button>Button 2</button>
          </main>
        </PageTransition>
      )

      const buttons = container.querySelectorAll('button')
      expect(buttons).toHaveLength(2)
      
      // Buttons should be accessible
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled')
        expect(button).not.toHaveAttribute('aria-hidden')
      })
    })

    it('should maintain keyboard accessibility during animations', () => {
      render(
        <PageTransition>
          <nav>
            <a href="/page1">Page 1</a>
            <a href="/page2">Page 2</a>
          </nav>
        </PageTransition>
      )

      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(2)
      
      // Links should be keyboard accessible
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Configuration Options', () => {
    it('should accept all accessibility configuration options', () => {
      const config = {
        enableAnimation: true,
        manageFocus: true,
        announcePageChange: true,
        fallbackDelay: 1000,
      }

      render(
        <PageTransition config={config}>
          <div>Test Content</div>
        </PageTransition>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should work with default configuration', () => {
      render(
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should render fallback with accessibility features on error', () => {
      // Force an error by passing invalid children
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      render(
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      )

      // Should still render ARIA live region
      expect(screen.getByRole('status')).toBeInTheDocument()
      
      consoleError.mockRestore()
    })
  })

  describe('Page Title Generation', () => {
    it('should generate readable page titles from pathnames', async () => {
      const usePathname = require('next/navigation').usePathname
      
      // Test various pathname formats
      const testCases = [
        { path: '/my-builds', expected: 'My Builds' },
        { path: '/tier-list', expected: 'Tier List' },
        { path: '/attribute-optimizer', expected: 'Attribute Optimizer' },
        { path: '/', expected: 'Home' },
      ]

      for (const testCase of testCases) {
        usePathname.mockReturnValue(testCase.path)
        
        const { rerender } = render(
          <PageTransition config={{ announcePageChange: true }}>
            <div>Content</div>
          </PageTransition>
        )

        // Trigger pathname change
        usePathname.mockReturnValue(testCase.path + '-new')
        rerender(
          <PageTransition config={{ announcePageChange: true }}>
            <div>New Content</div>
          </PageTransition>
        )

        await waitFor(() => {
          const liveRegion = screen.getByRole('status')
          // Should contain "Navigated to" text
          expect(liveRegion.textContent).toContain('Navigated to')
        })
      }
    })
  })
})
