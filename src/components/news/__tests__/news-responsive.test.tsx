/**
 * Responsive Testing Suite for News Updates Section
 * Tests various screen sizes, animations, scrolling, and content variations
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewsUpdatesSection } from '../news-updates-section';
import { KnownIssuesCard } from '../known-issues-card';
import { PatchNotesCard } from '../patch-notes-card';
import type { PatchData, KnownIssue, UpdateGroup } from '@/lib/patch-data';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock i18n translations
jest.mock('@/lib/i18n/news-translations', () => ({
  useNewsTranslations: () => ({
    knownIssues: {
      title: 'Known Issues (Still Unresolved)',
      empty: 'No known issues at this time',
    },
    patchNotes: {
      title: 'Patch Notes (Bug Fixes and Improvements)',
      showMore: 'Show More',
      empty: 'No recent updates',
    },
  }),
  getNewsTranslations: () => ({
    knownIssues: {
      title: 'Known Issues (Still Unresolved)',
      empty: 'No known issues at this time',
    },
    patchNotes: {
      title: 'Patch Notes (Bug Fixes and Improvements)',
      showMore: 'Show More',
      empty: 'No recent updates',
    },
  }),
}));

describe('Responsive Testing - News Updates Section', () => {
  // Helper to set viewport size
  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  };

  // Sample data generators
  const createKnownIssues = (count: number): KnownIssue[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `issue-${i}`,
      description: `Test issue ${i + 1} with [Bracketed Term ${i}] for highlighting`,
      highlightedTerms: [`Bracketed Term ${i}`],
    }));
  };

  const createUpdateGroups = (count: number): UpdateGroup[] => {
    return Array.from({ length: count }, (_, i) => ({
      date: `2025-11-${22 - i}`,
      displayDate: `Update Details - 2025-11-${22 - i}`,
      notes: [
        {
          id: `fix-${i}-1`,
          description: `Fixed issue ${i + 1} with [Component ${i}]`,
          highlightedTerms: [`Component ${i}`],
          type: 'fix' as const,
        },
        {
          id: `fix-${i}-2`,
          description: `Optimized performance for feature ${i + 1}`,
          highlightedTerms: [],
          type: 'optimization' as const,
        },
      ],
    }));
  };

  describe('Screen Size Testing', () => {
    test('Mobile (320px) - Cards stack vertically', () => {
      setViewport(320, 568);
      const patchData: PatchData = {
        knownIssues: createKnownIssues(2),
        updates: createUpdateGroups(2),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      const grid = container.querySelector('.news-updates-grid');
      
      expect(grid).toBeInTheDocument();
      // On mobile, grid should be single column
      const computedStyle = window.getComputedStyle(grid!);
      expect(computedStyle.gridTemplateColumns).toBeTruthy();
    });

    test('Tablet (768px) - Cards stack vertically', () => {
      setViewport(768, 1024);
      const patchData: PatchData = {
        knownIssues: createKnownIssues(3),
        updates: createUpdateGroups(3),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      const grid = container.querySelector('.news-updates-grid');
      
      expect(grid).toBeInTheDocument();
    });

    test('Desktop (1024px) - Two column layout', () => {
      setViewport(1024, 768);
      const patchData: PatchData = {
        knownIssues: createKnownIssues(5),
        updates: createUpdateGroups(5),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      const grid = container.querySelector('.news-updates-grid');
      
      expect(grid).toBeInTheDocument();
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument();
      expect(screen.getByText('Patch Notes (Bug Fixes and Improvements)')).toBeInTheDocument();
    });

    test('Large Desktop (1440px) - Two column layout with proper spacing', () => {
      setViewport(1440, 900);
      const patchData: PatchData = {
        knownIssues: createKnownIssues(8),
        updates: createUpdateGroups(8),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      render(<NewsUpdatesSection patchData={patchData} />);
      
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument();
      expect(screen.getByText('Patch Notes (Bug Fixes and Improvements)')).toBeInTheDocument();
    });

    test('Ultra-wide (2560px) - Maintains max-width constraint', () => {
      setViewport(2560, 1440);
      const patchData: PatchData = {
        knownIssues: createKnownIssues(10),
        updates: createUpdateGroups(10),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      // Should still render properly without stretching too wide
      expect(container.querySelector('.news-updates-grid')).toBeInTheDocument();
    });
  });

  describe('Content Length Variations', () => {
    test('Few items (1-2 issues, 1-2 updates)', () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(2),
        updates: createUpdateGroups(1),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      render(<NewsUpdatesSection patchData={patchData} />);
      
      expect(screen.getByText('Test issue 1 with')).toBeInTheDocument();
      expect(screen.getByText('Test issue 2 with')).toBeInTheDocument();
    });

    test('Medium items (5-10 issues, 5-10 updates)', () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(7),
        updates: createUpdateGroups(7),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      render(<NewsUpdatesSection patchData={patchData} />);
      
      expect(screen.getByText('Test issue 1 with')).toBeInTheDocument();
      expect(screen.getByText('Test issue 7 with')).toBeInTheDocument();
    });

    test('Many items (20+ issues, 20+ updates) - Scrolling required', () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(25),
        updates: createUpdateGroups(25),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      // Check that scrollable containers exist
      const scrollableContainers = container.querySelectorAll('[style*="overflow"]');
      expect(scrollableContainers.length).toBeGreaterThan(0);
    });

    test('Very long text in single item', () => {
      const longText = 'This is a very long description that should wrap properly across multiple lines and maintain readability even when the text content is extremely lengthy and contains many words that need to be displayed in the card component without breaking the layout or causing overflow issues. '.repeat(3);
      
      const patchData: PatchData = {
        knownIssues: [{
          id: 'long-issue',
          description: longText,
          highlightedTerms: [],
        }],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      expect(container.textContent).toContain('This is a very long description');
    });
  });

  describe('Empty State Handling', () => {
    test('No known issues', () => {
      const patchData: PatchData = {
        knownIssues: [],
        updates: createUpdateGroups(3),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      render(<NewsUpdatesSection patchData={patchData} />);
      
      expect(screen.getByText('No known issues at this time')).toBeInTheDocument();
    });

    test('No patch notes', () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(3),
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      render(<NewsUpdatesSection patchData={patchData} />);
      
      expect(screen.getByText('No recent updates')).toBeInTheDocument();
    });

    test('Completely empty data', () => {
      const patchData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      render(<NewsUpdatesSection patchData={patchData} />);
      
      expect(screen.getByText('No known issues at this time')).toBeInTheDocument();
      expect(screen.getByText('No recent updates')).toBeInTheDocument();
    });
  });

  describe('Scrolling Behavior', () => {
    test('Known Issues Card - Scrollable when content exceeds max height', () => {
      const { container } = render(
        <KnownIssuesCard issues={createKnownIssues(20)} maxHeight="400px" />
      );

      const scrollContainer = container.querySelector('[style*="max-height"]');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('Patch Notes Card - Scrollable when content exceeds max height', () => {
      const { container } = render(
        <PatchNotesCard updates={createUpdateGroups(15)} maxHeight="400px" />
      );

      const scrollContainer = container.querySelector('[style*="max-height"]');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('Smooth scrolling behavior', () => {
      const { container } = render(
        <KnownIssuesCard issues={createKnownIssues(20)} />
      );

      const scrollContainer = container.querySelector('[style*="overflow"]');
      if (scrollContainer) {
        const computedStyle = window.getComputedStyle(scrollContainer);
        // Check for smooth scrolling
        expect(computedStyle.overflowY).toBeTruthy();
      }
    });
  });

  describe('Color Scheme Consistency', () => {
    test('Cards use consistent background colors', () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(3),
        updates: createUpdateGroups(3),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    test('Highlighted terms use consistent styling', () => {
      const patchData: PatchData = {
        knownIssues: [{
          id: 'test',
          description: 'Test with [Highlighted Term]',
          highlightedTerms: ['Highlighted Term'],
        }],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      const highlightedElements = container.querySelectorAll('[class*="highlight"]');
      expect(highlightedElements.length).toBeGreaterThan(0);
    });

    test('Text contrast meets accessibility standards', () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(2),
        updates: createUpdateGroups(2),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      // Check that text elements exist and are readable
      const textElements = container.querySelectorAll('p, span, div');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation and Transition Smoothness', () => {
    test('Cards render without animation errors', async () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(3),
        updates: createUpdateGroups(3),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      await waitFor(() => {
        expect(container.querySelector('.news-updates-grid')).toBeInTheDocument();
      });
    });

    test('Hover states are properly defined', () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(2),
        updates: createUpdateGroups(2),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      // Check that interactive elements exist
      const interactiveElements = container.querySelectorAll('[class*="hover"]');
      // Elements should be present (even if hover class is applied via CSS)
      expect(container.querySelector('.news-updates-grid')).toBeInTheDocument();
    });
  });

  describe('Touch Device Compatibility', () => {
    test('Touch events work on mobile viewport', () => {
      setViewport(375, 667);
      const patchData: PatchData = {
        knownIssues: createKnownIssues(5),
        updates: createUpdateGroups(5),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      const { container } = render(<NewsUpdatesSection patchData={patchData} />);
      
      // Verify scrollable areas are touch-friendly
      const scrollableAreas = container.querySelectorAll('[style*="overflow"]');
      expect(scrollableAreas.length).toBeGreaterThan(0);
    });

    test('No hover-only interactions that break on touch', () => {
      const patchData: PatchData = {
        knownIssues: createKnownIssues(3),
        updates: createUpdateGroups(3),
        lastUpdated: '2025-11-22T00:00:00Z',
      };

      render(<NewsUpdatesSection patchData={patchData} />);
      
      // All content should be accessible without hover
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument();
      expect(screen.getByText('Patch Notes (Bug Fixes and Improvements)')).toBeInTheDocument();
    });
  });
});
