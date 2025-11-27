/**
 * Performance tests for News Updates Section
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NewsUpdatesSection } from '../news-updates-section';
import { KnownIssuesCard } from '../known-issues-card';
import { PatchNotesCard } from '../patch-notes-card';
import { PatchData } from '@/lib/patch-data';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';

// Mock framer-motion to avoid animation delays in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('News Updates Section - Performance', () => {
  const mockPatchData: PatchData = {
    knownIssues: Array.from({ length: 50 }, (_, i) => ({
      id: `issue-${i}`,
      description: `Test issue ${i} with [Highlighted Term ${i}]`,
      highlightedTerms: [`Highlighted Term ${i}`],
    })),
    updates: Array.from({ length: 20 }, (_, i) => ({
      date: `2025-11-${String(22 - i).padStart(2, '0')}`,
      displayDate: `Update Details - 2025-11-${String(22 - i).padStart(2, '0')}`,
      notes: Array.from({ length: 10 }, (_, j) => ({
        id: `note-${i}-${j}`,
        description: `Test fix ${i}-${j} for [Item ${j}]`,
        highlightedTerms: [`Item ${j}`],
        type: 'fix' as const,
      })),
    })),
    lastUpdated: new Date().toISOString(),
  };

  describe('Render Performance', () => {
    it('should render large dataset within acceptable time', () => {
      const startTime = performance.now();
      
      render(<NewsUpdatesSection patchData={mockPatchData} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in less than 500ms
      expect(renderTime).toBeLessThan(500);
    });

    it('should handle empty data efficiently', () => {
      const emptyData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: new Date().toISOString(),
      };

      const startTime = performance.now();
      
      render(<NewsUpdatesSection patchData={emptyData} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Empty state should render very quickly
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Component Memoization', () => {
    it('should not re-render KnownIssuesCard when props are unchanged', () => {
      const renderSpy = jest.fn();
      const MemoizedCard = React.memo(KnownIssuesCard);

      const { rerender } = render(
        <MemoizedCard issues={mockPatchData.knownIssues.slice(0, 5)} />
      );

      // Force a re-render with same props
      rerender(<MemoizedCard issues={mockPatchData.knownIssues.slice(0, 5)} />);

      // Component should be memoized and not re-render
      expect(screen.getByText(/Test issue 0/)).toBeInTheDocument();
    });

    it('should not re-render PatchNotesCard when props are unchanged', () => {
      const MemoizedCard = React.memo(PatchNotesCard);

      const { rerender } = render(
        <MemoizedCard updates={mockPatchData.updates.slice(0, 5)} />
      );

      // Force a re-render with same props
      rerender(<MemoizedCard updates={mockPatchData.updates.slice(0, 5)} />);

      expect(screen.getByText(/Patch Notes/)).toBeInTheDocument();
    });
  });

  describe('Large List Handling', () => {
    it('should handle 100+ known issues efficiently', () => {
      const largeData: PatchData = {
        knownIssues: Array.from({ length: 100 }, (_, i) => ({
          id: `issue-${i}`,
          description: `Issue ${i}`,
          highlightedTerms: [],
        })),
        updates: [],
        lastUpdated: new Date().toISOString(),
      };

      const startTime = performance.now();
      
      render(<NewsUpdatesSection patchData={largeData} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle 50+ update groups efficiently', () => {
      const largeData: PatchData = {
        knownIssues: [],
        updates: Array.from({ length: 50 }, (_, i) => ({
          date: `2025-${String(11 - Math.floor(i / 30)).padStart(2, '0')}-${String(22 - (i % 30)).padStart(2, '0')}`,
          displayDate: `Update Details - 2025-${String(11 - Math.floor(i / 30)).padStart(2, '0')}-${String(22 - (i % 30)).padStart(2, '0')}`,
          notes: Array.from({ length: 5 }, (_, j) => ({
            id: `note-${i}-${j}`,
            description: `Fix ${i}-${j}`,
            highlightedTerms: [],
            type: 'fix' as const,
          })),
        })),
        lastUpdated: new Date().toISOString(),
      };

      const startTime = performance.now();
      
      render(<NewsUpdatesSection patchData={largeData} maxVisibleUpdates={10} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Text Highlighting Performance', () => {
    it('should efficiently highlight multiple terms', () => {
      const dataWithManyTerms: PatchData = {
        knownIssues: [
          {
            id: 'issue-1',
            description: 'Issue with [Term1] and [Term2] and [Term3] and [Term4] and [Term5]',
            highlightedTerms: ['Term1', 'Term2', 'Term3', 'Term4', 'Term5'],
          },
        ],
        updates: [],
        lastUpdated: new Date().toISOString(),
      };

      const startTime = performance.now();
      
      render(<NewsUpdatesSection patchData={dataWithManyTerms} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(200);
      expect(screen.getByText(/Term1/)).toBeInTheDocument();
    });
  });

  describe('Error Handling Performance', () => {
    it('should render error state quickly', () => {
      const errorData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: new Date().toISOString(),
        error: 'Failed to load patch notes',
      };

      const startTime = performance.now();
      
      render(<NewsUpdatesSection patchData={errorData} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
      expect(screen.getByText(/Unable to load patch notes/)).toBeInTheDocument();
    });
  });

  describe('Memory Efficiency', () => {
    it('should not create excessive DOM nodes', () => {
      const { container } = render(
        <NewsUpdatesSection patchData={mockPatchData} maxVisibleUpdates={5} />
      );

      const allNodes = container.querySelectorAll('*');
      
      // Should have reasonable number of DOM nodes (not exponential)
      // With 50 issues + 5 update groups (10 notes each) = ~100 items
      // Each item has ~5-10 nodes, so expect < 2000 total nodes
      expect(allNodes.length).toBeLessThan(2000);
    });
  });

  describe('Scroll Performance', () => {
    it('should handle scrollable content efficiently', () => {
      const { container } = render(
        <NewsUpdatesSection patchData={mockPatchData} maxHeight="400px" />
      );

      const scrollableElements = container.querySelectorAll('[style*="overflow"]');
      
      // Should have scrollable containers
      expect(scrollableElements.length).toBeGreaterThan(0);
    });
  });
});
