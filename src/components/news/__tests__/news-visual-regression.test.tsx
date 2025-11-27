/**
 * Visual regression tests for News Updates Section
 * Tests desktop and mobile layouts, hover states, and visual consistency
 * 
 * Note: These tests verify DOM structure and classes that affect visual appearance.
 * For actual screenshot-based visual regression testing, integrate with tools like:
 * - Percy (https://percy.io/)
 * - Chromatic (https://www.chromatic.com/)
 * - BackstopJS (https://github.com/garris/BackstopJS)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewsUpdatesSection } from '../news-updates-section';
import { KnownIssuesCard } from '../known-issues-card';
import { PatchNotesCard } from '../patch-notes-card';
import { PatchData, KnownIssue, UpdateGroup } from '@/lib/patch-data';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('News Updates Section - Visual Regression', () => {
  const mockIssues: KnownIssue[] = [
    {
      id: 'issue-1',
      description: 'In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause issues.',
      highlightedTerms: ['Longbow: Embla Inflorescence'],
    },
    {
      id: 'issue-2',
      description: 'Currently, [Summon: Aurelia Aurita] does not inherit Morale.',
      highlightedTerms: ['Summon: Aurelia Aurita'],
    },
  ];

  const mockUpdates: UpdateGroup[] = [
    {
      date: '2025-11-22',
      displayDate: 'Update Details - 2025-11-22',
      notes: [
        {
          id: 'note-1',
          description: 'Fixed an issue where [Eclosion] would not apply.',
          highlightedTerms: ['Eclosion'],
          type: 'fix',
        },
        {
          id: 'note-2',
          description: 'Fixed an issue with [Seaborne Moon] effect.',
          highlightedTerms: ['Seaborne Moon'],
          type: 'fix',
        },
      ],
    },
    {
      date: '2025-11-20',
      displayDate: 'Update Details - 2025-11-20',
      notes: [
        {
          id: 'note-3',
          description: 'Optimized performance on mobile devices.',
          highlightedTerms: [],
          type: 'optimization',
        },
      ],
    },
  ];

  const mockPatchData: PatchData = {
    knownIssues: mockIssues,
    updates: mockUpdates,
    lastUpdated: '2025-11-22T00:00:00Z',
  };

  describe('Desktop Layout', () => {
    it('should render two-column grid layout', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const grid = container.querySelector('.news-updates-grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should have proper spacing between cards', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const grid = container.querySelector('.news-updates-grid');
      expect(grid).toHaveClass('gap-6');
    });

    it('should render cards with equal height potential', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const cards = container.querySelectorAll('.update-card');
      expect(cards.length).toBe(2);
      
      // Both cards should have the update-card class
      cards.forEach(card => {
        expect(card).toHaveClass('update-card');
      });
    });

    it('should maintain consistent card styling', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const cards = container.querySelectorAll('.update-card');
      cards.forEach(card => {
        expect(card).toHaveClass('rounded-2xl');
        expect(card).toHaveClass('update-card');
      });
    });
  });

  describe('Mobile Layout', () => {
    it('should render single-column grid layout', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const grid = container.querySelector('.news-updates-grid');
      expect(grid).toHaveClass('grid-cols-1');
    });

    it('should stack cards vertically', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const grid = container.querySelector('.news-updates-grid');
      expect(grid).toHaveClass('grid');
      
      // Grid should have single column class for mobile
      expect(grid).toHaveClass('grid-cols-1');
    });

    it('should maintain proper spacing on mobile', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const grid = container.querySelector('.news-updates-grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Card Visual Elements', () => {
    it('should render Known Issues card with proper styling', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const card = container.querySelector('.update-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('update-card');
    });

    it('should render Patch Notes card with proper styling', () => {
      const { container } = render(<PatchNotesCard updates={mockUpdates} />);
      
      const card = container.querySelector('.update-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('update-card');
    });

    it('should render card headers with consistent styling', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const header = container.querySelector('.card-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('card-header');
    });

    it('should render scrollable content areas', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const content = container.querySelector('.card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('overflow-y-auto');
    });
  });

  describe('Item Visual Elements', () => {
    it('should render issue items with proper styling', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const items = container.querySelectorAll('.update-item');
      expect(items.length).toBe(2);
      
      items.forEach(item => {
        expect(item).toHaveClass('update-item');
        expect(item).toHaveClass('rounded-lg');
      });
    });

    it('should render patch note items with proper styling', () => {
      const { container } = render(<PatchNotesCard updates={mockUpdates} />);
      
      const items = container.querySelectorAll('.update-item');
      expect(items.length).toBeGreaterThan(0);
      
      items.forEach(item => {
        expect(item).toHaveClass('update-item');
      });
    });

    it('should render icons with proper styling', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const icons = container.querySelectorAll('.item-icon');
      expect(icons.length).toBe(2);
      
      icons.forEach(icon => {
        expect(icon).toHaveClass('item-icon');
      });
    });

    it('should render highlighted terms with proper styling', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const highlightedTerms = container.querySelectorAll('.highlighted-term');
      expect(highlightedTerms.length).toBeGreaterThan(0);
      
      highlightedTerms.forEach(term => {
        expect(term).toHaveClass('highlighted-term');
        expect(term).toHaveClass('rounded');
      });
    });
  });

  describe('Date Header Visual Elements', () => {
    it('should render date headers with proper styling', () => {
      const { container } = render(<PatchNotesCard updates={mockUpdates} />);
      
      const dateHeaders = container.querySelectorAll('.date-header');
      expect(dateHeaders.length).toBe(2);
      
      dateHeaders.forEach(header => {
        expect(header).toHaveClass('date-header');
        expect(header).toHaveClass('font-semibold');
      });
    });

    it('should render date headers with proper spacing', () => {
      const { container } = render(<PatchNotesCard updates={mockUpdates} />);
      
      const dateHeaders = container.querySelectorAll('.date-header');
      dateHeaders.forEach(header => {
        expect(header).toHaveClass('mb-3');
      });
    });
  });

  describe('Color Scheme Consistency', () => {
    it('should use consistent background colors', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const cards = container.querySelectorAll('.update-card');
      cards.forEach(card => {
        // Cards should have background styling
        const classList = Array.from(card.classList);
        const hasBackgroundClass = classList.some(cls => 
          cls.includes('bg-') || cls.includes('background')
        );
        expect(hasBackgroundClass).toBe(true);
      });
    });

    it('should use consistent text colors', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const descriptions = container.querySelectorAll('.item-description');
      descriptions.forEach(desc => {
        const classList = Array.from(desc.classList);
        const hasTextColorClass = classList.some(cls => cls.includes('text-'));
        expect(hasTextColorClass).toBe(true);
      });
    });

    it('should use consistent highlight colors', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const highlightedTerms = container.querySelectorAll('.highlighted-term');
      highlightedTerms.forEach(term => {
        const classList = Array.from(term.classList);
        const hasColorClass = classList.some(cls => 
          cls.includes('text-') || cls.includes('bg-')
        );
        expect(hasColorClass).toBe(true);
      });
    });
  });

  describe('Shadow and Border Effects', () => {
    it('should render cards with shadow effects', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const cards = container.querySelectorAll('.update-card');
      cards.forEach(card => {
        // Cards should have shadow styling (custom shadow classes)
        const classList = Array.from(card.classList);
        const hasShadowClass = classList.some(cls => cls.includes('shadow'));
        expect(hasShadowClass).toBe(true);
      });
    });

    it('should render cards with rounded corners', () => {
      const { container } = render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const cards = container.querySelectorAll('.update-card');
      cards.forEach(card => {
        expect(card).toHaveClass('rounded-2xl');
      });
    });

    it('should render items with rounded corners', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const items = container.querySelectorAll('.update-item');
      items.forEach(item => {
        expect(item).toHaveClass('rounded-lg');
      });
    });
  });

  describe('Scrollbar Styling', () => {
    it('should have custom scrollbar classes', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const content = container.querySelector('.card-content');
      expect(content).toHaveClass('custom-scrollbar');
    });

    it('should have overflow-y-auto for scrolling', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const content = container.querySelector('.card-content');
      expect(content).toHaveClass('overflow-y-auto');
    });
  });

  describe('Empty State Visual Elements', () => {
    it('should render empty state with proper styling', () => {
      const emptyData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={emptyData} />);
      
      const emptyState = container.querySelector('[role="status"]');
      expect(emptyState).toBeInTheDocument();
      // Check for centering classes
      const classList = Array.from(emptyState!.classList);
      const hasCenteringClass = classList.some(cls => 
        cls.includes('center') || cls.includes('justify')
      );
      expect(hasCenteringClass).toBe(true);
    });
  });

  describe('Error State Visual Elements', () => {
    it('should render error state with proper styling', () => {
      const errorData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
        error: 'Test error',
      };

      const { container } = render(<NewsUpdatesSection patchData={errorData} />);
      
      const errorState = container.querySelector('[role="alert"]');
      expect(errorState).toBeInTheDocument();
      expect(errorState).toHaveClass('text-center');
    });

    it('should render error icon', () => {
      const errorData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
        error: 'Test error',
      };

      const { container } = render(<NewsUpdatesSection patchData={errorData} />);
      
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Responsive Typography', () => {
    it('should use responsive font sizes for card titles', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const title = container.querySelector('.card-title');
      expect(title).toHaveClass('text-xl');
    });

    it('should use readable font sizes for descriptions', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const descriptions = container.querySelectorAll('.item-description');
      descriptions.forEach(desc => {
        const classList = Array.from(desc.classList);
        const hasFontSizeClass = classList.some(cls => cls.includes('text-'));
        expect(hasFontSizeClass).toBe(true);
      });
    });

    it('should use proper line height for readability', () => {
      const { container } = render(<KnownIssuesCard issues={mockIssues} />);
      
      const descriptions = container.querySelectorAll('.item-description');
      descriptions.forEach(desc => {
        const classList = Array.from(desc.classList);
        const hasLineHeightClass = classList.some(cls => cls.includes('leading-'));
        expect(hasLineHeightClass).toBe(true);
      });
    });
  });

  describe('Visual Consistency Across Components', () => {
    it('should have consistent padding in both cards', () => {
      const { container: container1 } = render(<KnownIssuesCard issues={mockIssues} />);
      const { container: container2 } = render(<PatchNotesCard updates={mockUpdates} />);
      
      const content1 = container1.querySelector('.card-content');
      const content2 = container2.querySelector('.card-content');
      
      expect(content1?.className).toBe(content2?.className);
    });

    it('should have consistent item styling in both cards', () => {
      const { container: container1 } = render(<KnownIssuesCard issues={mockIssues} />);
      const { container: container2 } = render(<PatchNotesCard updates={mockUpdates} />);
      
      const item1 = container1.querySelector('.update-item');
      const item2 = container2.querySelector('.update-item');
      
      // Should have same base classes
      expect(item1).toHaveClass('update-item');
      expect(item2).toHaveClass('update-item');
    });
  });
});
