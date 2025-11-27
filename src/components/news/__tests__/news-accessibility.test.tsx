/**
 * Accessibility Tests for News Components
 * 
 * Tests ARIA labels, roles, keyboard navigation, focus management,
 * and WCAG compliance using jest-axe.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import { NewsUpdatesSection } from '../news-updates-section'
import { KnownIssuesCard } from '../known-issues-card'
import { PatchNotesCard } from '../patch-notes-card'
import { UpdateCard } from '@/components/ui/update-card'
import { PatchData, KnownIssue, UpdateGroup } from '@/lib/patch-data'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
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
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { describe } from 'node:test'

expect.extend(toHaveNoViolations)

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

describe('News Components Accessibility', () => {
  const mockKnownIssues: KnownIssue[] = [
    {
      id: 'issue-1',
      description: 'Issue with [Longbow: Embla Inflorescence] in Co-op mode',
      highlightedTerms: ['Longbow: Embla Inflorescence'],
    },
    {
      id: 'issue-2',
      description: 'Problem with [Character: Vina] skill animation',
      highlightedTerms: ['Character: Vina'],
    },
  ]

  const mockUpdates: UpdateGroup[] = [
    {
      date: '2025-11-22',
      displayDate: 'Update Details - 2025-11-22',
      notes: [
        {
          id: 'fix-1',
          description: 'Fixed issue with [Eclosion] effect',
          highlightedTerms: ['Eclosion'],
          type: 'fix',
        },
        {
          id: 'fix-2',
          description: 'Optimized [Map Loading] performance',
          highlightedTerms: ['Map Loading'],
          type: 'optimization',
        },
      ],
    },
    {
      date: '2025-11-20',
      displayDate: 'Update Details - 2025-11-20',
      notes: [
        {
          id: 'fix-3',
          description: 'Fixed [UI Bug] in settings menu',
          highlightedTerms: ['UI Bug'],
          type: 'fix',
        },
      ],
    },
  ]

  const mockPatchData: PatchData = {
    knownIssues: mockKnownIssues,
    updates: mockUpdates,
    lastUpdated: '2025-11-22T00:00:00Z',
  }

  describe('UpdateCard Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA role', () => {
      render(
        <UpdateCard title="Test Card" role="region">
          <p>Test content</p>
        </UpdateCard>
      )
      // There will be two regions: the card itself and the content area
      const regions = screen.getAllByRole('region')
      expect(regions.length).toBeGreaterThan(0)
    })

    it('should have proper heading hierarchy', () => {
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Test Card')
    })

    it('should have aria-labelledby linking title to card', () => {
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const heading = screen.getByRole('heading', { level: 2 })
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-labelledby', heading.id)
    })

    it('should have keyboard accessible scrollable content', () => {
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const contentRegion = screen.getByRole('region', { name: /Test Card content/i })
      expect(contentRegion).toHaveAttribute('tabIndex', '0')
    })

    it('should have focus indicators', () => {
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const card = container.querySelector('.update-card')
      expect(card).toHaveClass('focus-within:ring-2')
    })
  })

  describe('KnownIssuesCard Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <KnownIssuesCard issues={mockKnownIssues} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      const regions = screen.getAllByRole('region', { name: /Known Issues/i })
      expect(regions.length).toBeGreaterThan(0)
    })

    it('should have proper list semantics', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      const list = screen.getByRole('list', { name: /Known issues list/i })
      expect(list).toBeInTheDocument()
      
      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(mockKnownIssues.length)
    })

    it('should have keyboard accessible list items', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      const items = screen.getAllByRole('listitem')
      
      items.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should have descriptive aria-labels for each item', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      const items = screen.getAllByRole('listitem')
      
      items.forEach((item, index) => {
        expect(item).toHaveAttribute('aria-label')
        expect(item.getAttribute('aria-label')).toContain(`Known issue ${index + 1}`)
      })
    })

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(<KnownIssuesCard issues={mockKnownIssues} />)
      const icons = container.querySelectorAll('.item-icon')
      
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('should show empty state with proper role', () => {
      render(<KnownIssuesCard issues={[]} />)
      const emptyState = screen.getByRole('status')
      expect(emptyState).toHaveTextContent(/No known issues/i)
      expect(emptyState).toHaveAttribute('aria-live', 'polite')
    })

    it('should support Thai language', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} locale="th" />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('ปัญหาที่ทราบ')
    })
  })

  describe('PatchNotesCard Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <PatchNotesCard updates={mockUpdates} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      // h2 for card title
      const cardTitle = screen.getByRole('heading', { level: 2 })
      expect(cardTitle).toHaveTextContent(/Patch Notes/i)
      
      // h3 for date headers
      const dateHeaders = screen.getAllByRole('heading', { level: 3 })
      expect(dateHeaders.length).toBeGreaterThan(0)
      expect(dateHeaders[0]).toHaveTextContent(/Update Details/i)
    })

    it('should have proper list semantics with nested lists', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      // Nested lists for each date group
      const nestedLists = screen.getAllByRole('list', { name: /updates for/i })
      // Should have at least one list per date group
      expect(nestedLists.length).toBeGreaterThanOrEqual(1)
      expect(nestedLists.length).toBeLessThanOrEqual(mockUpdates.length)
    })

    it('should have keyboard accessible list items', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      const items = screen.getAllByRole('listitem')
      
      items.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should have proper ARIA attributes for Show More button', () => {
      render(
        <PatchNotesCard 
          updates={mockUpdates} 
          maxVisibleUpdates={1}
          showMoreButton={true}
        />
      )
      
      const button = screen.getByRole('button', { name: /Show More/i })
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-controls', 'patch-notes-list')
    })

    it('should update aria-expanded when Show More is clicked', async () => {
      const user = userEvent.setup()
      render(
        <PatchNotesCard 
          updates={mockUpdates} 
          maxVisibleUpdates={1}
          showMoreButton={true}
        />
      )
      
      const button = screen.getByRole('button', { name: /Show More/i })
      expect(button).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(button)
      
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(button).toHaveTextContent(/Show Less/i)
    })

    it('should have proper aria-labelledby for date groups', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const dateHeaders = screen.getAllByRole('heading', { level: 3 })
      
      dateHeaders.forEach(header => {
        expect(header).toHaveAttribute('id')
        const headerId = header.getAttribute('id')
        
        // Find the region with matching aria-labelledby
        const region = screen.getByRole('region', { name: header.textContent || '' })
        expect(region).toHaveAttribute('aria-labelledby', headerId)
      })
    })

    it('should support Thai language', () => {
      render(<PatchNotesCard updates={mockUpdates} locale="th" />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('บันทึกการแก้ไข')
    })
  })

  describe('NewsUpdatesSection Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <NewsUpdatesSection patchData={mockPatchData} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper region role with label', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)
      const region = screen.getByRole('region', { name: /Game News and Updates/i })
      expect(region).toBeInTheDocument()
    })

    it('should have proper error state with alert role', () => {
      const errorData: PatchData = {
        ...mockPatchData,
        error: 'Failed to load patch notes',
      }
      
      render(<NewsUpdatesSection patchData={errorData} />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(/Unable to load patch notes/i)
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper empty state with status role', () => {
      const emptyData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
      }
      
      render(<NewsUpdatesSection patchData={emptyData} />)
      const status = screen.getByRole('status')
      expect(status).toHaveTextContent(/No updates available/i)
      expect(status).toHaveAttribute('aria-live', 'polite')
    })

    it('should support Thai language throughout', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} locale="th" />)
      
      const region = screen.getByRole('region', { name: /ข่าวสารและการอัปเดตเกม/i })
      expect(region).toBeInTheDocument()
      
      const knownIssuesHeading = screen.getByRole('heading', { name: /ปัญหาที่ทราบ/i })
      expect(knownIssuesHeading).toBeInTheDocument()
      
      const patchNotesHeading = screen.getByRole('heading', { name: /บันทึกการแก้ไข/i })
      expect(patchNotesHeading).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should allow keyboard navigation through issue items', async () => {
      const user = userEvent.setup()
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const items = screen.getAllByRole('listitem')
      
      // Tab to content region first, then to items
      await user.tab()
      // Content region gets focus first
      
      await user.tab()
      expect(items[0]).toHaveFocus()
      
      // Tab to second item
      await user.tab()
      expect(items[1]).toHaveFocus()
    })

    it('should allow keyboard navigation through patch note items', async () => {
      const user = userEvent.setup()
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const items = screen.getAllByRole('listitem')
      
      // Tab to content region first
      await user.tab()
      
      // Tab to first item
      await user.tab()
      expect(items[0]).toHaveFocus()
    })

    it('should allow keyboard activation of Show More button', async () => {
      const user = userEvent.setup()
      render(
        <PatchNotesCard 
          updates={mockUpdates} 
          maxVisibleUpdates={1}
          showMoreButton={true}
        />
      )
      
      const button = screen.getByRole('button', { name: /Show More/i })
      
      // Focus and activate with keyboard
      button.focus()
      expect(button).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(button).toHaveTextContent(/Show Less/i)
    })
  })

  describe('Color Contrast', () => {
    it('should have sufficient contrast for text elements', () => {
      const { container } = render(
        <NewsUpdatesSection patchData={mockPatchData} />
      )
      
      // Check that text elements have appropriate color classes
      const descriptions = container.querySelectorAll('.item-description')
      descriptions.forEach(desc => {
        expect(desc).toHaveClass('text-gray-300')
      })
      
      // Check highlighted terms have proper styling
      const highlightedTerms = container.querySelectorAll('.highlighted-term')
      highlightedTerms.forEach(term => {
        expect(term).toHaveClass('text-cyan-400')
      })
    })

    it('should have sufficient contrast for date headers', () => {
      const { container } = render(
        <PatchNotesCard updates={mockUpdates} />
      )
      
      const dateHeaders = container.querySelectorAll('.date-header')
      dateHeaders.forEach(header => {
        expect(header).toHaveClass('text-yellow-400')
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should announce list counts properly', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const list = screen.getByRole('list')
      const ariaLabel = list.getAttribute('aria-label')
      expect(ariaLabel).toContain('2')
      expect(ariaLabel).toContain('items')
    })

    it('should announce update group counts', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const lists = screen.getAllByRole('list', { name: /updates for/i })
      lists.forEach(list => {
        const ariaLabel = list.getAttribute('aria-label')
        expect(ariaLabel).toMatch(/\d+ (update|updates) for/)
      })
    })

    it('should provide context in Show More button label', () => {
      render(
        <PatchNotesCard 
          updates={mockUpdates} 
          maxVisibleUpdates={1}
          showMoreButton={true}
        />
      )
      
      const button = screen.getByRole('button', { name: /Show More/i })
      const ariaLabel = button.getAttribute('aria-label')
      expect(ariaLabel).toContain('Currently showing')
      expect(ariaLabel).toContain('of')
    })
  })
})
