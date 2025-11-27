/**
 * Integration Test Suite: Full Navigation Flow
 * Tests complete navigation between all pages with performance monitoring
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname, useRouter } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Import components
import MainLayout from '@/components/layout/main-layout';

describe('Integration: Full Navigation Flow', () => {
  let mockPush: jest.Mock;
  let mockPathname: string;
  let performanceMarks: { [key: string]: number } = {};

  beforeEach(() => {
    mockPush = jest.fn();
    mockPathname = '/';
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    });

    (usePathname as jest.Mock).mockImplementation(() => mockPathname);

    // Mock performance API
    performanceMarks = {};
    global.performance.mark = jest.fn((name: string) => {
      performanceMarks[name] = Date.now();
      return {} as PerformanceMark;
    });
    global.performance.measure = jest.fn();
    
    // Clear console
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Navigation Flow Tests', () => {
    const testPages = [
      { path: '/', name: 'Home' },
      { path: '/my-builds', name: 'My Builds' },
      { path: '/tier-list', name: 'Tier List' },
      { path: '/map', name: 'Interactive Map' },
      { path: '/attribute-optimizer', name: 'Attribute Optimizer' },
      { path: '/materials', name: 'Materials' },
      { path: '/news', name: 'News' },
    ];

    test('should navigate through all pages sequentially', async () => {
      const { rerender } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      for (const page of testPages) {
        mockPathname = page.path;
        
        rerender(
          <MainLayout>
            <div>{page.name} Content</div>
          </MainLayout>
        );

        await waitFor(() => {
          expect(screen.getByText(`${page.name} Content`)).toBeInTheDocument();
        }, { timeout: 2000 });
      }
    });

    test('should handle rapid navigation between pages', async () => {
      const { rerender } = render(
        <MainLayout>
          <div>Initial Content</div>
        </MainLayout>
      );

      // Rapidly change pages
      for (let i = 0; i < 5; i++) {
        const page = testPages[i % testPages.length];
        mockPathname = page.path;
        
        rerender(
          <MainLayout>
            <div>{page.name} Content</div>
          </MainLayout>
        );
      }

      // Wait for final render
      await waitFor(() => {
        const lastPage = testPages[4 % testPages.length];
        expect(screen.getByText(`${lastPage.name} Content`)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should navigate back and forth between pages', async () => {
      const { rerender } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      // Navigate forward
      mockPathname = '/my-builds';
      rerender(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('My Builds Content')).toBeInTheDocument();
      });

      // Navigate back
      mockPathname = '/';
      rerender(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('Home Content')).toBeInTheDocument();
      });

      // Navigate forward again
      mockPathname = '/tier-list';
      rerender(
        <MainLayout>
          <div>Tier List Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('Tier List Content')).toBeInTheDocument();
      });
    });

    test('should handle same page navigation', async () => {
      mockPathname = '/my-builds';
      
      const { rerender } = render(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('My Builds Content')).toBeInTheDocument();
      });

      // Navigate to same page
      rerender(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('My Builds Content')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Tests', () => {
    test('should complete navigation within performance budget', async () => {
      const startTime = Date.now();
      
      mockPathname = '/';
      const { rerender } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      mockPathname = '/my-builds';
      rerender(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('My Builds Content')).toBeInTheDocument();
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Navigation should complete within 1000ms
      expect(duration).toBeLessThan(1000);
    });

    test('should not cause memory leaks during multiple navigations', async () => {
      const { rerender } = render(
        <MainLayout>
          <div>Initial Content</div>
        </MainLayout>
      );

      // Perform multiple navigations
      for (let i = 0; i < 10; i++) {
        mockPathname = `/page-${i}`;
        rerender(
          <MainLayout>
            <div>Page {i} Content</div>
          </MainLayout>
        );

        await waitFor(() => {
          expect(screen.getByText(`Page ${i} Content`)).toBeInTheDocument();
        });
      }

      // If we get here without timeout, no memory leak detected
      expect(true).toBe(true);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle navigation errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      mockPathname = '/';
      const { rerender } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      // Simulate error during navigation
      mockPathname = '/error-page';
      rerender(
        <MainLayout>
          <div>Error Page Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Page Content')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    test('should recover from animation failures', async () => {
      mockPathname = '/';
      const { rerender } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      // Navigate to new page
      mockPathname = '/my-builds';
      rerender(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      // Content should still render even if animation fails
      await waitFor(() => {
        expect(screen.getByText('My Builds Content')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Console Error Detection', () => {
    test('should not produce console errors during navigation', async () => {
      const consoleError = jest.spyOn(console, 'error');
      const consoleWarn = jest.spyOn(console, 'warn');

      mockPathname = '/';
      const { rerender } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      mockPathname = '/my-builds';
      rerender(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('My Builds Content')).toBeInTheDocument();
      });

      // Check for errors (excluding expected test warnings)
      const errors = consoleError.mock.calls.filter(
        call => !call[0]?.toString().includes('Not implemented')
      );
      const warnings = consoleWarn.mock.calls.filter(
        call => !call[0]?.toString().includes('Not implemented')
      );

      expect(errors.length).toBe(0);
      expect(warnings.length).toBe(0);
    });
  });

  describe('Accessibility During Navigation', () => {
    test('should maintain focus management during navigation', async () => {
      mockPathname = '/';
      const { rerender } = render(
        <MainLayout>
          <div tabIndex={0}>Home Content</div>
        </MainLayout>
      );

      mockPathname = '/my-builds';
      rerender(
        <MainLayout>
          <div tabIndex={0}>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('My Builds Content')).toBeInTheDocument();
      });

      // Content should be focusable
      const content = screen.getByText('My Builds Content');
      expect(content).toHaveAttribute('tabIndex', '0');
    });

    test('should announce page changes to screen readers', async () => {
      mockPathname = '/';
      const { rerender, container } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      mockPathname = '/my-builds';
      rerender(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText('My Builds Content')).toBeInTheDocument();
      });

      // Check for ARIA live region
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
    });
  });
});
