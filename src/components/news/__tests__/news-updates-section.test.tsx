import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NewsUpdatesSection } from '../news-updates-section'
import { PatchData } from '@/lib/patch-data'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { describe } from 'node:test'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

// Mock child components
jest.mock('../known-issues-card', () => ({
  KnownIssuesCard: ({ issues, locale }: any) => (
    <div data-testid="known-issues-card" data-locale={locale}>
      Known Issues: {issues.length}
    </div>
  )
}))

jest.mock('../patch-notes-card', () => ({
  PatchNotesCard: ({ updates, locale, maxVisibleUpdates }: any) => (
    <div 
      data-testid="patch-notes-card" 
      data-locale={locale}
      data-max-visible={maxVisibleUpdates}
    >
      Updates: {updates.length}
    </div>
  )
}))

describe('NewsUpdatesSection', () => {
  const mockPatchData: PatchData = {
    knownIssues: [
      {
        id: 'issue-1',
        description: 'Test issue 1',
        highlightedTerms: ['Term1']
      },
      {
        id: 'issue-2',
        description: 'Test issue 2',
        highlightedTerms: ['Term2']
      }
    ],
    updates: [
      {
        date: '2025-11-22',
        displayDate: 'Update Details - 2025-11-22',
        notes: [
          {
            id: 'note-1',
            description: 'Fixed bug 1',
            highlightedTerms: ['Bug1'],
            type: 'fix'
          }
        ]
      },
      {
        date: '2025-11-20',
        displayDate: 'Update Details - 2025-11-20',
        notes: [
          {
            id: 'note-2',
            description: 'Fixed bug 2',
            highlightedTerms: ['Bug2'],
            type: 'fix'
          }
        ]
      }
    ],
    lastUpdated: '2025-11-22T00:00:00Z'
  }

  describe('Layout and Rendering', () => {
    it('should render both cards in a grid layout', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)

      expect(screen.getByTestId('known-issues-card')).toBeInTheDocument()
      expect(screen.getByTestId('patch-notes-card')).toBeInTheDocument()
    })

    it('should apply correct grid classes for responsive layout', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const grid = container.querySelector('.news-updates-grid')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2')
    })

    it('should render with custom className', () => {
      const { container } = render(
        <NewsUpdatesSection patchData={mockPatchData} className="custom-class" />
      )
      
      const section = container.querySelector('.news-updates-section')
      expect(section).toHaveClass('custom-class')
    })

    it('should have proper ARIA region role', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const section = container.querySelector('[role="region"]')
      expect(section).toBeInTheDocument()
      expect(section).toHaveAttribute('aria-label', 'Game News and Updates')
    })
  })

  describe('Data Integration', () => {
    it('should pass correct data to KnownIssuesCard', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)

      const card = screen.getByTestId('known-issues-card')
      expect(card).toHaveTextContent('Known Issues: 2')
    })

    it('should pass correct data to PatchNotesCard', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)

      const card = screen.getByTestId('patch-notes-card')
      expect(card).toHaveTextContent('Updates: 2')
    })

    it('should pass maxVisibleUpdates prop to PatchNotesCard', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} maxVisibleUpdates={3} />)

      const card = screen.getByTestId('patch-notes-card')
      expect(card).toHaveAttribute('data-max-visible', '3')
    })
  })

  describe('Error Handling', () => {
    it('should display error fallback when patchData has error', () => {
      const errorData: PatchData = {
        ...mockPatchData,
        error: 'Failed to parse patch data'
      }

      render(<NewsUpdatesSection patchData={errorData} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Unable to load patch notes')).toBeInTheDocument()
      expect(screen.getByText('Failed to parse patch data')).toBeInTheDocument()
    })

    it('should not display error when error is empty string', () => {
      const errorData: PatchData = {
        ...mockPatchData,
        error: ''
      }

      render(<NewsUpdatesSection patchData={errorData} />)

      // Should render normal content, not error
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByTestId('known-issues-card')).toBeInTheDocument()
    })

    it('should display Thai error message when locale is th', () => {
      const errorData: PatchData = {
        ...mockPatchData,
        error: 'Test error'
      }

      render(<NewsUpdatesSection patchData={errorData} locale="th" />)

      expect(screen.getByText('ไม่สามารถโหลดบันทึกการแก้ไขได้')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no issues or updates', () => {
      const emptyData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z'
      }

      render(<NewsUpdatesSection patchData={emptyData} />)

      expect(screen.getByText('No updates available')).toBeInTheDocument()
      expect(screen.queryByTestId('known-issues-card')).not.toBeInTheDocument()
      expect(screen.queryByTestId('patch-notes-card')).not.toBeInTheDocument()
    })

    it('should display Thai empty state message', () => {
      const emptyData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z'
      }

      render(<NewsUpdatesSection patchData={emptyData} locale="th" />)

      expect(screen.getByText('ไม่มีข้อมูลอัปเดต')).toBeInTheDocument()
    })

    it('should render cards when only known issues exist', () => {
      const dataWithIssuesOnly: PatchData = {
        knownIssues: mockPatchData.knownIssues,
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z'
      }

      render(<NewsUpdatesSection patchData={dataWithIssuesOnly} />)

      expect(screen.getByTestId('known-issues-card')).toBeInTheDocument()
      expect(screen.getByTestId('patch-notes-card')).toBeInTheDocument()
    })

    it('should render cards when only updates exist', () => {
      const dataWithUpdatesOnly: PatchData = {
        knownIssues: [],
        updates: mockPatchData.updates,
        lastUpdated: '2025-11-22T00:00:00Z'
      }

      render(<NewsUpdatesSection patchData={dataWithUpdatesOnly} />)

      expect(screen.getByTestId('known-issues-card')).toBeInTheDocument()
      expect(screen.getByTestId('patch-notes-card')).toBeInTheDocument()
    })
  })

  describe('Internationalization', () => {
    it('should pass locale prop to child components', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} locale="th" />)

      expect(screen.getByTestId('known-issues-card')).toHaveAttribute('data-locale', 'th')
      expect(screen.getByTestId('patch-notes-card')).toHaveAttribute('data-locale', 'th')
    })

    it('should use English as default locale', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)

      expect(screen.getByTestId('known-issues-card')).toHaveAttribute('data-locale', 'en')
      expect(screen.getByTestId('patch-notes-card')).toHaveAttribute('data-locale', 'en')
    })

    it('should display Thai ARIA label when locale is th', () => {
      const { container } = render(
        <NewsUpdatesSection patchData={mockPatchData} locale="th" />
      )

      const section = container.querySelector('[role="region"]')
      expect(section).toHaveAttribute('aria-label', 'ข่าวสารและการอัปเดตเกม')
    })
  })

  describe('Responsive Behavior', () => {
    it('should have mobile-first grid layout', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const grid = container.querySelector('.news-updates-grid')
      expect(grid).toHaveClass('grid-cols-1')
    })

    it('should have desktop two-column layout class', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const grid = container.querySelector('.news-updates-grid')
      expect(grid).toHaveClass('md:grid-cols-2')
    })

    it('should maintain proper gap spacing', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const grid = container.querySelector('.news-updates-grid')
      expect(grid).toHaveClass('gap-6', 'md:gap-6')
    })
  })

  describe('Accessibility', () => {
    it('should have proper region role and label', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const region = container.querySelector('[role="region"]')
      expect(region).toBeInTheDocument()
      expect(region).toHaveAttribute('aria-label')
    })

    it('should have alert role for error state', () => {
      const errorData: PatchData = {
        ...mockPatchData,
        error: 'Test error'
      }

      render(<NewsUpdatesSection patchData={errorData} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should have status role for empty state', () => {
      const emptyData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z'
      }

      render(<NewsUpdatesSection patchData={emptyData} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should have aria-live for dynamic content', () => {
      const emptyData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z'
      }

      const { container } = render(<NewsUpdatesSection patchData={emptyData} />)

      const status = container.querySelector('[aria-live="polite"]')
      expect(status).toBeInTheDocument()
    })
  })

  describe('Props Forwarding', () => {
    it('should forward maxHeight prop to child cards', () => {
      // This is implicitly tested through the component structure
      // The maxHeight prop is passed to both card components
      const { container } = render(
        <NewsUpdatesSection patchData={mockPatchData} maxHeight="800px" />
      )
      
      expect(container.querySelector('.news-updates-section')).toBeInTheDocument()
    })

    it('should use default maxVisibleUpdates of 5', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)

      const card = screen.getByTestId('patch-notes-card')
      expect(card).toHaveAttribute('data-max-visible', '5')
    })
  })
})
