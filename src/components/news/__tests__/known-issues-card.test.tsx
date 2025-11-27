import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { KnownIssuesCard } from '../known-issues-card'
import { KnownIssue } from '@/lib/patch-data'
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
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { describe } from 'node:test'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, whileHover, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('KnownIssuesCard', () => {
  const mockIssues: KnownIssue[] = [
    {
      id: 'issue-1',
      description: 'In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause the launch point of homing arrows to be positioned incorrectly after charging.',
      highlightedTerms: ['Longbow: Embla Inflorescence'],
    },
    {
      id: 'issue-2',
      description: 'The [Eclosion] effect may not apply immediately in certain situations.',
      highlightedTerms: ['Eclosion'],
    },
    {
      id: 'issue-3',
      description: 'Players may experience lag when using [Skill: Rapid Fire] and [Weapon: Thunder Bow] simultaneously.',
      highlightedTerms: ['Skill: Rapid Fire', 'Weapon: Thunder Bow'],
    },
  ]

  describe('Rendering', () => {
    it('should render the card with English title by default', () => {
      render(<KnownIssuesCard issues={mockIssues} />)
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument()
    })

    it('should render the card with Thai title when locale is "th"', () => {
      render(<KnownIssuesCard issues={mockIssues} locale="th" />)
      expect(screen.getByText('ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)')).toBeInTheDocument()
    })

    it('should render all issues', () => {
      render(<KnownIssuesCard issues={mockIssues} />)
      expect(screen.getByText(/In Co-op Commissions/)).toBeInTheDocument()
      // Text is split by highlighted spans, so we need to check for partial text
      expect(screen.getByText(/The/)).toBeInTheDocument()
      expect(screen.getByText(/effect may not apply immediately/)).toBeInTheDocument()
      expect(screen.getByText(/Players may experience lag/)).toBeInTheDocument()
    })

    it('should render the ✧ icon for each issue', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />)
      const icons = container.querySelectorAll('.item-icon')
      expect(icons).toHaveLength(3)
      icons.forEach((icon) => {
        expect(icon.textContent).toBe('✧')
      })
    })

    it('should render empty state when no issues are provided', () => {
      render(<KnownIssuesCard issues={[]} />)
      expect(screen.getByText('No known issues at this time')).toBeInTheDocument()
    })

    it('should render Thai empty state when locale is "th"', () => {
      render(<KnownIssuesCard issues={[]} locale="th" />)
      expect(screen.getByText('ไม่มีปัญหาที่ทราบในขณะนี้')).toBeInTheDocument()
    })
  })

  describe('Term Highlighting', () => {
    it('should highlight single bracketed term', () => {
      const issues: KnownIssue[] = [
        {
          id: 'test-1',
          description: 'Issue with [Test Item] in game.',
          highlightedTerms: ['Test Item'],
        },
      ]
      const { container } = render(<KnownIssuesCard issues={issues} />)
      const highlightedTerm = container.querySelector('.highlighted-term')
      expect(highlightedTerm).toBeInTheDocument()
      expect(highlightedTerm?.textContent).toBe('[Test Item]')
    })

    it('should highlight multiple bracketed terms', () => {
      const issues: KnownIssue[] = [
        {
          id: 'test-2',
          description: 'Issue with [Item A] and [Item B] in game.',
          highlightedTerms: ['Item A', 'Item B'],
        },
      ]
      const { container } = render(<KnownIssuesCard issues={issues} />)
      const highlightedTerms = container.querySelectorAll('.highlighted-term')
      expect(highlightedTerms).toHaveLength(2)
      expect(highlightedTerms[0].textContent).toBe('[Item A]')
      expect(highlightedTerms[1].textContent).toBe('[Item B]')
    })

    it('should highlight terms with colons and special characters', () => {
      const issues: KnownIssue[] = [
        {
          id: 'test-3',
          description: 'Issue with [Weapon: Test-Item #1] in game.',
          highlightedTerms: ['Weapon: Test-Item #1'],
        },
      ]
      const { container } = render(<KnownIssuesCard issues={issues} />)
      const highlightedTerm = container.querySelector('.highlighted-term')
      expect(highlightedTerm).toBeInTheDocument()
      expect(highlightedTerm?.textContent).toBe('[Weapon: Test-Item #1]')
    })

    it('should apply correct styling to highlighted terms', () => {
      const issues: KnownIssue[] = [
        {
          id: 'test-4',
          description: 'Issue with [Test] in game.',
          highlightedTerms: ['Test'],
        },
      ]
      const { container } = render(<KnownIssuesCard issues={issues} />)
      const highlightedTerm = container.querySelector('.highlighted-term')
      expect(highlightedTerm).toHaveClass('bg-cyan-500/10')
      expect(highlightedTerm).toHaveClass('text-cyan-400')
      expect(highlightedTerm).toHaveClass('font-medium')
    })

    it('should handle text without bracketed terms', () => {
      const issues: KnownIssue[] = [
        {
          id: 'test-5',
          description: 'Issue with no bracketed terms.',
          highlightedTerms: [],
        },
      ]
      render(<KnownIssuesCard issues={issues} />)
      expect(screen.getByText('Issue with no bracketed terms.')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA role for the card', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />)
      const region = container.querySelector('[role="region"]')
      expect(region).toBeInTheDocument()
    })

    it('should have proper ARIA label for the card', () => {
      render(<KnownIssuesCard issues={mockIssues} />)
      expect(screen.getByRole('region', { name: 'Known Issues (Still Unresolved)' })).toBeInTheDocument()
    })

    it('should have proper list role for issues container', () => {
      render(<KnownIssuesCard issues={mockIssues} />)
      expect(screen.getByRole('list', { name: 'List of known issues' })).toBeInTheDocument()
    })

    it('should have proper listitem role for each issue', () => {
      render(<KnownIssuesCard issues={mockIssues} />)
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })

    it('should mark icon as aria-hidden', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />)
      const icons = container.querySelectorAll('.item-icon')
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} className="custom-class" />)
      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })

    it('should apply custom maxHeight', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} maxHeight="400px" />)
      const content = container.querySelector('.card-content')
      expect(content).toHaveStyle({ maxHeight: '400px' })
    })

    it('should apply hover effect classes to issue items', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />)
      const items = container.querySelectorAll('.update-item')
      items.forEach((item) => {
        expect(item).toHaveClass('hover:bg-white/[0.08]')
        expect(item).toHaveClass('hover:translate-x-1')
      })
    })

    it('should render issue descriptions with proper styling', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />)
      const descriptions = container.querySelectorAll('.item-description')
      expect(descriptions).toHaveLength(3)
      descriptions.forEach((desc) => {
        expect(desc).toHaveClass('text-gray-300')
        expect(desc).toHaveClass('text-sm')
        expect(desc).toHaveClass('leading-relaxed')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle issue with empty description', () => {
      const issues: KnownIssue[] = [
        {
          id: 'empty',
          description: '',
          highlightedTerms: [],
        },
      ]
      render(<KnownIssuesCard issues={issues} />)
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(1)
    })

    it('should handle issue with very long description', () => {
      const longDescription = 'A'.repeat(500) + ' [Test Item] ' + 'B'.repeat(500)
      const issues: KnownIssue[] = [
        {
          id: 'long',
          description: longDescription,
          highlightedTerms: ['Test Item'],
        },
      ]
      render(<KnownIssuesCard issues={issues} />)
      expect(screen.getByText(/AAAA/)).toBeInTheDocument()
    })

    it('should handle multiple consecutive bracketed terms', () => {
      const issues: KnownIssue[] = [
        {
          id: 'consecutive',
          description: '[Item A][Item B][Item C] are broken.',
          highlightedTerms: ['Item A', 'Item B', 'Item C'],
        },
      ]
      const { container } = render(<KnownIssuesCard issues={issues} />)
      const highlightedTerms = container.querySelectorAll('.highlighted-term')
      expect(highlightedTerms).toHaveLength(3)
    })

    it('should handle nested brackets correctly', () => {
      const issues: KnownIssue[] = [
        {
          id: 'nested',
          description: 'Issue with [Item [Nested]] in game.',
          highlightedTerms: ['Item [Nested'],
        },
      ]
      render(<KnownIssuesCard issues={issues} />)
      expect(screen.getByText(/Issue with/)).toBeInTheDocument()
    })

    it('should handle undefined locale gracefully', () => {
      render(<KnownIssuesCard issues={mockIssues} locale={undefined} />)
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument()
    })

    it('should handle unsupported locale by falling back to English', () => {
      render(<KnownIssuesCard issues={mockIssues} locale="fr" />)
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument()
    })
  })
})
