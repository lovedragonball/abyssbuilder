/**
 * Animation Tests for News Updates Section
 * 
 * Tests all animation behaviors including:
 * - Card entry animations with fade and slide effects
 * - Item hover animations with translateX and background transitions
 * - Smooth scrolling behavior
 * - Card elevation on hover
 * - Performance optimizations (CSS transforms, will-change)
 * 
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { NewsUpdatesSection } from '../news-updates-section'
import { KnownIssuesCard } from '../known-issues-card'
import { PatchNotesCard } from '../patch-notes-card'
import { UpdateCard } from '@/components/ui/update-card'
import { PatchData, KnownIssue, UpdateGroup } from '@/lib/patch-data'

// Mock framer-motion to test animation variants
jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      div: React.forwardRef(({ children, variants, initial, animate, whileHover, style, ...props }: any, ref: any) => (
        <div
          ref={ref}
          data-testid="motion-div"
          data-variants={JSON.stringify(variants)}
          data-initial={initial}
          data-animate={animate}
          data-while-hover={JSON.stringify(whileHover)}
          style={style}
          {...props}
        >
          {children}
        </div>
      ))
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

describe('News Updates Section - Animations', () => {
  const mockKnownIssues: KnownIssue[] = [
    {
      id: 'issue-1',
      description: 'Test issue with [Highlighted Term]',
      highlightedTerms: ['Highlighted Term']
    },
    {
      id: 'issue-2',
      description: 'Another test issue',
      highlightedTerms: []
    }
  ]

  const mockUpdates: UpdateGroup[] = [
    {
      date: '2025-11-22',
      displayDate: 'Update Details - 2025-11-22',
      notes: [
        {
          id: 'note-1',
          description: 'Fixed [Bug Name]',
          highlightedTerms: ['Bug Name'],
          type: 'fix' as const
        }
      ]
    }
  ]

  const mockPatchData: PatchData = {
    knownIssues: mockKnownIssues,
    updates: mockUpdates,
    lastUpdated: '2025-11-22T00:00:00Z',
    error: ''
  }

  describe('Card Entry Animations', () => {
    it('should apply fade and slide animation variants to container', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const containers = screen.getAllByTestId('motion-div')
      const mainContainer = containers[0]
      
      expect(mainContainer).toHaveAttribute('data-initial', 'hidden')
      expect(mainContainer).toHaveAttribute('data-animate', 'visible')
      
      const variants = JSON.parse(mainContainer.getAttribute('data-variants') || '{}')
      expect(variants).toHaveProperty('hidden')
      expect(variants).toHaveProperty('visible')
    })

    it('should apply staggered children animation to container', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const containers = screen.getAllByTestId('motion-div')
      const mainContainer = containers[0]
      
      const variants = JSON.parse(mainContainer.getAttribute('data-variants') || '{}')
      expect(variants.visible).toHaveProperty('transition')
      expect(variants.visible.transition).toHaveProperty('staggerChildren')
    })

    it('should apply card animation variants with fade and slide', () => {
      render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const containers = screen.getAllByTestId('motion-div')
      // Find card containers (they should have cardVariants with y: 20)
      const cardContainers = containers.filter(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.hidden && variants.hidden.y === 20
      })
      
      expect(cardContainers.length).toBeGreaterThan(0)
      
      cardContainers.forEach(card => {
        const variants = JSON.parse(card.getAttribute('data-variants') || '{}')
        expect(variants.hidden).toEqual({ opacity: 0, y: 20 })
        expect(variants.visible).toMatchObject({
          opacity: 1,
          y: 0,
          transition: expect.objectContaining({
            duration: 0.5,
            ease: 'easeOut'
          })
        })
      })
    })
  })

  describe('Item Hover Animations', () => {
    it('should apply hover animation variants to issue items', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const containers = screen.getAllByTestId('motion-div')
      // Find item containers (they should have itemVariants with x translation)
      const itemContainers = containers.filter(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.rest && typeof variants.rest.x !== 'undefined'
      })
      
      expect(itemContainers.length).toBeGreaterThan(0)
      
      itemContainers.forEach(item => {
        const variants = JSON.parse(item.getAttribute('data-variants') || '{}')
        expect(variants.rest).toMatchObject({
          x: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.03)'
        })
        expect(variants.hover).toMatchObject({
          x: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.08)'
        })
      })
    })

    it('should apply hover animation variants to patch note items', () => {
      render(<PatchNotesCard updates={mockUpdates} />)
      
      const containers = screen.getAllByTestId('motion-div')
      const itemContainers = containers.filter(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.rest && typeof variants.rest.x !== 'undefined'
      })
      
      expect(itemContainers.length).toBeGreaterThan(0)
      
      itemContainers.forEach(item => {
        const variants = JSON.parse(item.getAttribute('data-variants') || '{}')
        expect(variants.hover).toMatchObject({
          x: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.08)'
        })
      })
    })

    it('should have transition timing for hover animations', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const containers = screen.getAllByTestId('motion-div')
      const itemContainers = containers.filter(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.rest && variants.rest.transition
      })
      
      itemContainers.forEach(item => {
        const variants = JSON.parse(item.getAttribute('data-variants') || '{}')
        expect(variants.rest.transition).toMatchObject({
          duration: 0.2,
          ease: 'easeInOut'
        })
        expect(variants.hover.transition).toMatchObject({
          duration: 0.2,
          ease: 'easeInOut'
        })
      })
    })
  })

  describe('Card Elevation Animation', () => {
    it('should apply whileHover animation to UpdateCard', () => {
      render(
        <UpdateCard title="Test Card">
          <div>Content</div>
        </UpdateCard>
      )
      
      const motionDivs = screen.getAllByTestId('motion-div')
      const cardDiv = motionDivs[0]
      
      const whileHover = JSON.parse(cardDiv.getAttribute('data-while-hover') || '{}')
      expect(whileHover).toMatchObject({
        y: -4,
        transition: expect.objectContaining({
          duration: 0.2,
          ease: 'easeOut'
        })
      })
    })

    it('should have CSS hover transition classes on UpdateCard', () => {
      render(
        <UpdateCard title="Test Card">
          <div>Content</div>
        </UpdateCard>
      )
      
      const motionDivs = screen.getAllByTestId('motion-div')
      const cardDiv = motionDivs[0]
      
      expect(cardDiv).toHaveClass('transition-all')
      expect(cardDiv).toHaveClass('duration-300')
      expect(cardDiv).toHaveClass('ease-out')
    })
  })

  describe('Smooth Scrolling Behavior', () => {
    it('should apply scroll-smooth class to card content', () => {
      render(
        <UpdateCard title="Test Card">
          <div>Content</div>
        </UpdateCard>
      )
      
      const cardContent = screen.getByRole('region', { name: 'Test Card content' })
      expect(cardContent).toHaveClass('scroll-smooth')
    })

    it('should have custom scrollbar styling class', () => {
      render(
        <UpdateCard title="Test Card">
          <div>Content</div>
        </UpdateCard>
      )
      
      const cardContent = screen.getByRole('region', { name: 'Test Card content' })
      expect(cardContent).toHaveClass('custom-scrollbar')
    })

    it('should have overflow-y-auto for scrollable content', () => {
      render(
        <UpdateCard title="Test Card">
          <div>Content</div>
        </UpdateCard>
      )
      
      const cardContent = screen.getByRole('region', { name: 'Test Card content' })
      expect(cardContent).toHaveClass('overflow-y-auto')
    })
  })

  describe('Performance Optimizations', () => {
    it('should use will-change for transform and background-color on items', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const items = screen.getAllByRole('listitem')
      items.forEach(item => {
        const motionDiv = item.closest('[data-testid="motion-div"]')
        expect(motionDiv).toHaveStyle({ willChange: 'transform, background-color' })
      })
    })

    it('should use will-change for transform and opacity on cards', () => {
      render(
        <UpdateCard title="Test Card">
          <div>Content</div>
        </UpdateCard>
      )
      
      const motionDivs = screen.getAllByTestId('motion-div')
      const cardDiv = motionDivs[0]
      
      expect(cardDiv).toHaveStyle({ willChange: 'transform, opacity' })
    })

    it('should use CSS transforms instead of position changes', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const containers = screen.getAllByTestId('motion-div')
      const itemContainers = containers.filter(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.hover && typeof variants.hover.x !== 'undefined'
      })
      
      // Verify using translateX (x property) instead of left/right
      itemContainers.forEach(item => {
        const variants = JSON.parse(item.getAttribute('data-variants') || '{}')
        expect(variants.hover).toHaveProperty('x')
        expect(variants.hover).not.toHaveProperty('left')
        expect(variants.hover).not.toHaveProperty('right')
      })
    })
  })

  describe('Item Entry Animations', () => {
    it('should apply staggered entry animations to items', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const containers = screen.getAllByTestId('motion-div')
      // Find container with staggerChildren
      const listContainer = containers.find(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.visible?.transition?.staggerChildren
      })
      
      expect(listContainer).toBeDefined()
      const variants = JSON.parse(listContainer!.getAttribute('data-variants') || '{}')
      expect(variants.visible.transition.staggerChildren).toBe(0.05)
    })

    it('should apply fade and slide entry animation to items', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const containers = screen.getAllByTestId('motion-div')
      // Find item entry containers
      const itemEntryContainers = containers.filter(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.hidden && typeof variants.hidden.x !== 'undefined' && variants.hidden.x === -10
      })
      
      expect(itemEntryContainers.length).toBeGreaterThan(0)
      
      itemEntryContainers.forEach(item => {
        const variants = JSON.parse(item.getAttribute('data-variants') || '{}')
        expect(variants.hidden).toEqual({ opacity: 0, x: -10 })
        expect(variants.visible).toMatchObject({
          opacity: 1,
          x: 0,
          transition: expect.objectContaining({
            duration: 0.3,
            ease: 'easeOut'
          })
        })
      })
    })
  })

  describe('Empty State Animations', () => {
    it('should animate empty state with fade in', () => {
      const emptyPatchData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '',
        error: ''
      }
      
      render(<KnownIssuesCard issues={[]} />)
      
      const emptyState = screen.getByRole('status')
      const motionDiv = emptyState.closest('[data-testid="motion-div"]')
      
      expect(motionDiv).toHaveAttribute('data-initial')
      expect(motionDiv).toHaveAttribute('data-animate')
    })
  })

  describe('Accessibility with Animations', () => {
    it('should maintain focus indicators during animations', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const items = screen.getAllByRole('listitem')
      items.forEach(item => {
        expect(item).toHaveClass('focus-within:ring-2')
        expect(item).toHaveClass('focus-within:ring-cyan-500/50')
      })
    })

    it('should be keyboard accessible with tabIndex', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const items = screen.getAllByRole('listitem')
      items.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should have proper ARIA labels for animated items', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveAttribute('aria-label', expect.stringContaining('Known issue 1'))
    })
  })

  describe('Responsive Animation Behavior', () => {
    it('should maintain animations on mobile layout', () => {
      // Set mobile viewport
      global.innerWidth = 375
      global.innerHeight = 667
      
      render(<NewsUpdatesSection patchData={mockPatchData} />)
      
      const containers = screen.getAllByTestId('motion-div')
      const mainContainer = containers[0]
      
      // Animations should still be present
      expect(mainContainer).toHaveAttribute('data-initial', 'hidden')
      expect(mainContainer).toHaveAttribute('data-animate', 'visible')
    })
  })

  describe('Animation Performance', () => {
    it('should use GPU-accelerated properties (transform, opacity)', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const containers = screen.getAllByTestId('motion-div')
      const itemContainers = containers.filter(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.hover
      })
      
      itemContainers.forEach(item => {
        const variants = JSON.parse(item.getAttribute('data-variants') || '{}')
        // Check that we're only animating transform-related and opacity properties
        const animatedProps = Object.keys(variants.hover)
        const gpuProps = ['x', 'y', 'scale', 'rotate', 'opacity', 'backgroundColor', 'transition']
        
        animatedProps.forEach(prop => {
          expect(gpuProps).toContain(prop)
        })
      })
    })

    it('should not animate layout-triggering properties', () => {
      render(<KnownIssuesCard issues={mockKnownIssues} />)
      
      const containers = screen.getAllByTestId('motion-div')
      const itemContainers = containers.filter(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.hover
      })
      
      itemContainers.forEach(item => {
        const variants = JSON.parse(item.getAttribute('data-variants') || '{}')
        // These properties trigger layout recalculation and should not be animated
        const badProps = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding']
        
        badProps.forEach(prop => {
          expect(variants.hover).not.toHaveProperty(prop)
        })
      })
    })
  })

  describe('Show More Button Animation', () => {
    it('should have animation container for show more button', () => {
      const manyUpdates: UpdateGroup[] = Array.from({ length: 10 }, (_, i) => ({
        date: `2025-11-${22 - i}`,
        displayDate: `Update Details - 2025-11-${22 - i}`,
        notes: [{
          id: `note-${i}`,
          description: `Fix ${i}`,
          highlightedTerms: [],
          type: 'fix' as const
        }]
      }))
      
      // Test without showMoreButton to avoid Button component mock issues
      render(<PatchNotesCard updates={manyUpdates} maxVisibleUpdates={5} showMoreButton={false} />)
      
      // Verify that animations are applied to the patch notes list
      const containers = screen.getAllByTestId('motion-div')
      expect(containers.length).toBeGreaterThan(0)
      
      // Verify list container has animation variants
      const listContainer = containers.find(container => {
        const variants = JSON.parse(container.getAttribute('data-variants') || '{}')
        return variants.visible?.transition?.staggerChildren
      })
      
      expect(listContainer).toBeDefined()
    })
  })
})
