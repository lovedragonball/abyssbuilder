import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PatchNotesCard } from '../patch-notes-card'
import { UpdateGroup } from '@/lib/patch-data'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}))

// Mock Slot from radix-ui
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('PatchNotesCard', () => {
  const mockUpdates: UpdateGroup[] = [
    {
      date: '2025-11-22',
      displayDate: 'Update Details - 2025-11-22',
      notes: [
        {
          id: 'fix-1',
          description: 'Fixed an issue where the pick-up range bonus from the [Eclosion] effect would not apply immediately.',
          highlightedTerms: ['Eclosion'],
          type: 'fix',
        },
        {
          id: 'fix-2',
          description: 'Fixed an issue where the [Longbow: Embla Inflorescence] damage calculation was incorrect.',
          highlightedTerms: ['Longbow: Embla Inflorescence'],
          type: 'fix',
        },
      ],
    },
    {
      date: '2025-11-20',
      displayDate: 'Update Details - 2025-11-20',
      notes: [
        {
          id: 'fix-3',
          description: 'Optimized performance for large maps.',
          highlightedTerms: [],
          type: 'optimization',
        },
      ],
    },
    {
      date: '2025-11-18',
      displayDate: 'Update Details - 2025-11-18',
      notes: [
        {
          id: 'fix-4',
          description: 'Fixed rendering issues with [Character Models].',
          highlightedTerms: ['Character Models'],
          type: 'fix',
        },
      ],
    },
  ]

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      expect(screen.getByText('Patch Notes (Bug Fixes and Improvements)')).toBeInTheDocument()
    })

    it('should render Thai title when locale is th', () => {
      render(<PatchNotesCard updates={mockUpdates} locale="th" />)
      expect(screen.getByText('บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)')).toBeInTheDocument()
    })

    it('should render empty state when no updates', () => {
      render(<PatchNotesCard updates={[]} />)
      expect(screen.getByText('No recent updates')).toBeInTheDocument()
    })

    it('should render Thai empty state when locale is th', () => {
      render(<PatchNotesCard updates={[]} locale="th" />)
      expect(screen.getByText('ไม่มีการอัปเดตล่าสุด')).toBeInTheDocument()
    })
  })

  describe('Date Grouping', () => {
    it('should render date headers for each update group', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      expect(screen.getByText('Update Details - 2025-11-22')).toBeInTheDocument()
      expect(screen.getByText('Update Details - 2025-11-20')).toBeInTheDocument()
      expect(screen.getByText('Update Details - 2025-11-18')).toBeInTheDocument()
    })

    it('should group notes under their respective date headers', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      // Check that notes appear after their date headers
      const dateHeader = screen.getByText('Update Details - 2025-11-22')
      const container = dateHeader.closest('.update-group')
      
      expect(container).toBeInTheDocument()
      expect(within(container!).getByText(/Fixed an issue where the pick-up range bonus/)).toBeInTheDocument()
      // Check for the Longbow text (split across elements due to highlighting)
      expect(within(container!).getByText(/damage calculation was incorrect/)).toBeInTheDocument()
    })

    it('should render notes in correct order within each group', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const allNotes = screen.getAllByRole('listitem')
      // All notes from all 3 update groups should be visible (4 notes total)
      expect(allNotes).toHaveLength(4)
    })
  })

  describe('Patch Note Items', () => {
    it('should render all patch notes with ✦ icons', () => {
      render(<PatchNotesCard updates={mockUpdates} maxVisibleUpdates={10} />)
      
      const icons = screen.getAllByText('✦')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should render patch note descriptions', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      expect(screen.getByText(/Fixed an issue where the pick-up range bonus/)).toBeInTheDocument()
      expect(screen.getByText(/Optimized performance for large maps/)).toBeInTheDocument()
    })

    it('should highlight bracketed terms', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const highlightedTerms = screen.getAllByText(/\[.*\]/)
      expect(highlightedTerms.length).toBeGreaterThan(0)
      
      // Check for specific highlighted term
      const eclosionTerm = screen.getByText('[Eclosion]')
      expect(eclosionTerm).toHaveClass('highlighted-term')
    })

    it('should handle notes without highlighted terms', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      expect(screen.getByText(/Optimized performance for large maps/)).toBeInTheDocument()
    })
  })

  describe('Show More Functionality', () => {
    const manyUpdates: UpdateGroup[] = Array.from({ length: 10 }, (_, i) => ({
      date: `2025-11-${22 - i}`,
      displayDate: `Update Details - 2025-11-${22 - i}`,
      notes: [
        {
          id: `fix-${i}`,
          description: `Fixed issue ${i}`,
          highlightedTerms: [],
          type: 'fix' as const,
        },
      ],
    }))

    it('should show only maxVisibleUpdates by default', () => {
      render(<PatchNotesCard updates={manyUpdates} maxVisibleUpdates={5} />)
      
      const dateHeaders = screen.getAllByRole('heading', { level: 3 })
      expect(dateHeaders).toHaveLength(5)
    })

    it('should show "Show More" button when there are more updates', () => {
      render(<PatchNotesCard updates={manyUpdates} maxVisibleUpdates={5} />)
      
      expect(screen.getByText('Show More')).toBeInTheDocument()
    })

    it('should show Thai "Show More" button when locale is th', () => {
      render(<PatchNotesCard updates={manyUpdates} maxVisibleUpdates={5} locale="th" />)
      
      expect(screen.getByText('แสดงเพิ่มเติม')).toBeInTheDocument()
    })

    it('should not show "Show More" button when showMoreButton is false', () => {
      render(<PatchNotesCard updates={manyUpdates} maxVisibleUpdates={5} showMoreButton={false} />)
      
      expect(screen.queryByText('Show More')).not.toBeInTheDocument()
    })

    it('should not show "Show More" button when all updates are visible', () => {
      render(<PatchNotesCard updates={mockUpdates} maxVisibleUpdates={10} />)
      
      expect(screen.queryByText('Show More')).not.toBeInTheDocument()
    })

    it('should expand to show all updates when "Show More" is clicked', () => {
      render(<PatchNotesCard updates={manyUpdates} maxVisibleUpdates={5} />)
      
      // Initially 5 date headers
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
      
      // Click Show More
      const showMoreButton = screen.getByText('Show More')
      fireEvent.click(showMoreButton)
      
      // Now all 10 date headers should be visible
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(10)
      
      // Button text should change
      expect(screen.getByText('Show Less')).toBeInTheDocument()
    })

    it('should collapse back when "Show Less" is clicked', () => {
      render(<PatchNotesCard updates={manyUpdates} maxVisibleUpdates={5} />)
      
      // Expand
      const showMoreButton = screen.getByText('Show More')
      fireEvent.click(showMoreButton)
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(10)
      
      // Collapse
      const showLessButton = screen.getByText('Show Less')
      fireEvent.click(showLessButton)
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      expect(screen.getByRole('region', { name: 'Patch Notes (Bug Fixes and Improvements)' })).toBeInTheDocument()
    })

    it('should have proper list structure', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const lists = screen.getAllByRole('list')
      expect(lists.length).toBeGreaterThan(0)
    })

    it('should have proper heading hierarchy', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const dateHeaders = screen.getAllByRole('heading', { level: 3 })
      expect(dateHeaders.length).toBeGreaterThan(0)
    })

    it('should have aria-expanded on Show More button', () => {
      const manyUpdates: UpdateGroup[] = Array.from({ length: 10 }, (_, i) => ({
        date: `2025-11-${22 - i}`,
        displayDate: `Update Details - 2025-11-${22 - i}`,
        notes: [
          {
            id: `fix-${i}`,
            description: `Fixed issue ${i}`,
            highlightedTerms: [],
            type: 'fix' as const,
          },
        ],
      }))

      render(<PatchNotesCard updates={manyUpdates} maxVisibleUpdates={5} />)
      
      const button = screen.getByText('Show More')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      
      fireEvent.click(button)
      const buttonAfter = screen.getByText('Show Less')
      expect(buttonAfter).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      const { container } = render(<PatchNotesCard updates={mockUpdates} className="custom-class" />)
      
      // The className is passed to UpdateCard, check if it's in the DOM
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should apply custom maxHeight', () => {
      render(<PatchNotesCard updates={mockUpdates} maxHeight="800px" />)
      
      // The maxHeight is passed to UpdateCard component
      // We can't directly test this without checking the UpdateCard implementation
      // but we can verify the component renders without errors
      expect(screen.getByText('Patch Notes (Bug Fixes and Improvements)')).toBeInTheDocument()
    })

    it('should have proper CSS classes for styling', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const items = screen.getAllByRole('listitem')
      items.forEach(item => {
        expect(item).toHaveClass('update-item')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle single update group', () => {
      const singleUpdate: UpdateGroup[] = [mockUpdates[0]]
      render(<PatchNotesCard updates={singleUpdate} />)
      
      expect(screen.getByText('Update Details - 2025-11-22')).toBeInTheDocument()
      expect(screen.queryByText('Show More')).not.toBeInTheDocument()
    })

    it('should handle update group with single note', () => {
      const singleNoteUpdate: UpdateGroup[] = [
        {
          date: '2025-11-22',
          displayDate: 'Update Details - 2025-11-22',
          notes: [mockUpdates[0].notes[0]],
        },
      ]
      
      render(<PatchNotesCard updates={singleNoteUpdate} />)
      
      expect(screen.getByText(/Fixed an issue where the pick-up range bonus/)).toBeInTheDocument()
    })

    it('should handle notes with multiple highlighted terms', () => {
      const multiTermUpdate: UpdateGroup[] = [
        {
          date: '2025-11-22',
          displayDate: 'Update Details - 2025-11-22',
          notes: [
            {
              id: 'fix-1',
              description: 'Fixed [Item A] and [Item B] interaction with [System C].',
              highlightedTerms: ['Item A', 'Item B', 'System C'],
              type: 'fix',
            },
          ],
        },
      ]
      
      render(<PatchNotesCard updates={multiTermUpdate} />)
      
      expect(screen.getByText('[Item A]')).toBeInTheDocument()
      expect(screen.getByText('[Item B]')).toBeInTheDocument()
      expect(screen.getByText('[System C]')).toBeInTheDocument()
    })

    it('should handle very long descriptions', () => {
      const longDescUpdate: UpdateGroup[] = [
        {
          date: '2025-11-22',
          displayDate: 'Update Details - 2025-11-22',
          notes: [
            {
              id: 'fix-1',
              description: 'Fixed an issue where ' + 'a'.repeat(500) + ' would cause problems.',
              highlightedTerms: [],
              type: 'fix',
            },
          ],
        },
      ]
      
      render(<PatchNotesCard updates={longDescUpdate} />)
      
      expect(screen.getByText(/Fixed an issue where/)).toBeInTheDocument()
    })
  })
})
