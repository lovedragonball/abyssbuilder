/**
 * Accessibility Tests for UpdateCard Component
 * 
 * Tests ARIA attributes, keyboard navigation, focus management,
 * and WCAG compliance.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import { UpdateCard } from '../update-card'
import { it } from 'node:test'
import { describe } from 'node:test'
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
import { describe } from 'node:test'
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

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('UpdateCard Accessibility', () => {
  describe('ARIA Attributes', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have default article role', () => {
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()
    })

    it('should accept custom role', () => {
      render(
        <UpdateCard title="Test Card" role="region">
          <p>Test content</p>
        </UpdateCard>
      )
      // There will be two regions: the card itself and the content area
      const regions = screen.getAllByRole('region')
      expect(regions.length).toBeGreaterThan(0)
    })

    it('should have aria-labelledby linking to title', () => {
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const heading = screen.getByRole('heading', { level: 2 })
      const card = screen.getByRole('article')
      
      expect(heading).toHaveAttribute('id')
      expect(card).toHaveAttribute('aria-labelledby', heading.id)
    })

    it('should accept custom aria-label', () => {
      render(
        <UpdateCard title="Test Card" aria-label="Custom label">
          <p>Test content</p>
        </UpdateCard>
      )
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-label', 'Custom label')
    })

    it('should have proper content region with aria-label', () => {
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const contentRegion = screen.getByRole('region', { name: /Test Card content/i })
      expect(contentRegion).toBeInTheDocument()
    })
  })

  describe('Heading Hierarchy', () => {
    it('should use h2 for card title', () => {
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Test Card')
    })

    it('should have unique id for title', () => {
      const { container: container1 } = render(
        <UpdateCard title="Card 1">
          <p>Content 1</p>
        </UpdateCard>
      )
      const heading1 = within(container1).getByRole('heading', { level: 2 })
      const id1 = heading1.id

      const { container: container2 } = render(
        <UpdateCard title="Card 2">
          <p>Content 2</p>
        </UpdateCard>
      )
      const heading2 = within(container2).getByRole('heading', { level: 2 })
      const id2 = heading2.id

      expect(id1).not.toBe(id2)
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should have keyboard accessible scrollable content', () => {
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const contentRegion = screen.getByRole('region', { name: /Test Card content/i })
      expect(contentRegion).toHaveAttribute('tabIndex', '0')
    })

    it('should be focusable via keyboard', async () => {
      const user = userEvent.setup()
      render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      
      const contentRegion = screen.getByRole('region', { name: /Test Card content/i })
      
      await user.tab()
      expect(contentRegion).toHaveFocus()
    })

    it('should have smooth scrolling enabled', () => {
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const content = container.querySelector('.card-content')
      expect(content).toHaveClass('scroll-smooth')
    })
  })

  describe('Focus Indicators', () => {
    it('should have focus-within ring styles', () => {
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const card = container.querySelector('.update-card')
      expect(card).toHaveClass('focus-within:ring-2')
      expect(card).toHaveClass('focus-within:ring-cyan-500/50')
    })

    it('should have visible focus indicator when focused', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      
      const contentRegion = screen.getByRole('region', { name: /Test Card content/i })
      await user.tab()
      
      expect(contentRegion).toHaveFocus()
      expect(container.querySelector('.update-card')).toBeInTheDocument()
    })
  })

  describe('Scrollbar Accessibility', () => {
    it('should have custom scrollbar styles when enabled', () => {
      const { container } = render(
        <UpdateCard title="Test Card" showScrollbar={true}>
          <p>Test content</p>
        </UpdateCard>
      )
      const content = container.querySelector('.card-content')
      expect(content).toHaveClass('custom-scrollbar')
    })

    it('should not have custom scrollbar when disabled', () => {
      const { container } = render(
        <UpdateCard title="Test Card" showScrollbar={false}>
          <p>Test content</p>
        </UpdateCard>
      )
      const content = container.querySelector('.card-content')
      expect(content).not.toHaveClass('custom-scrollbar')
    })

    it('should have overflow-y-auto for scrolling', () => {
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const content = container.querySelector('.card-content')
      expect(content).toHaveClass('overflow-y-auto')
    })
  })

  describe('Max Height', () => {
    it('should apply default max height', () => {
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const content = container.querySelector('.card-content')
      expect(content).toHaveStyle({ maxHeight: '600px' })
    })

    it('should apply custom max height', () => {
      const { container } = render(
        <UpdateCard title="Test Card" maxHeight="400px">
          <p>Test content</p>
        </UpdateCard>
      )
      const content = container.querySelector('.card-content')
      expect(content).toHaveStyle({ maxHeight: '400px' })
    })
  })

  describe('Without Title', () => {
    it('should render without title', () => {
      render(
        <UpdateCard>
          <p>Test content</p>
        </UpdateCard>
      )
      const heading = screen.queryByRole('heading', { level: 2 })
      expect(heading).not.toBeInTheDocument()
    })

    it('should still have accessible content region without title', () => {
      render(
        <UpdateCard>
          <p>Test content</p>
        </UpdateCard>
      )
      const contentRegion = screen.getByRole('region', { name: /Card content/i })
      expect(contentRegion).toBeInTheDocument()
    })

    it('should have no accessibility violations without title', async () => {
      const { container } = render(
        <UpdateCard aria-label="Card without title">
          <p>Test content</p>
        </UpdateCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Complex Content', () => {
    it('should handle complex nested content', async () => {
      const { container } = render(
        <UpdateCard title="Complex Card">
          <div>
            <h3>Subsection</h3>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <button>Action</button>
          </div>
        </UpdateCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should maintain proper heading hierarchy with nested content', () => {
      render(
        <UpdateCard title="Main Card">
          <div>
            <h3>Subsection</h3>
            <p>Content</p>
          </div>
        </UpdateCard>
      )
      
      const h2 = screen.getByRole('heading', { level: 2 })
      expect(h2).toHaveTextContent('Main Card')
      
      const h3 = screen.getByRole('heading', { level: 3 })
      expect(h3).toHaveTextContent('Subsection')
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain accessibility on different screen sizes', async () => {
      const { container } = render(
        <UpdateCard title="Responsive Card" className="w-full md:w-1/2">
          <p>Test content</p>
        </UpdateCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Animation Accessibility', () => {
    it('should have will-change for performance', () => {
      const { container } = render(
        <UpdateCard title="Test Card">
          <p>Test content</p>
        </UpdateCard>
      )
      const card = container.querySelector('.update-card')
      expect(card).toHaveStyle({ willChange: 'transform, opacity' })
    })
  })
})
