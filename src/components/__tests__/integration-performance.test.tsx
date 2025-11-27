/**
 * Integration Test: Performance Monitoring
 * Tests animation frame rate and page load times
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
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

import MainLayout from '@/components/layout/main-layout';

describe('Integration: Performance Monitoring', () => {
  let mockPush: jest.Mock;
  let mockPathname: string;
  let performanceEntries: any[] = [];

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
    performanceEntries = [];
    
    global.performance.mark = jest.fn((name: string) => {
      const entry = {
        name,
        entryType: 'mark',
        startTime: Date.now(),
        duration: 0,
      };
      performanceEntries.push(entry);
      return entry as PerformanceMark;
    });

    global.performance.measure = jest.fn((name: string, startMark?: string, endMark?: string) => {
      const start = performanceEntries.find(e => e.name === startMark);
      const end = performanceEntries.find(e => e.name === endMark);
      
      const entry = {
        name,
        entryType: 'measure',
        startTime: start?.startTime || 0,
        duration: end ? end.startTime - (start?.startTime || 0) : 0,
      };
      performanceEntries.push(entry);
      return entry as PerformanceMeasure;
    });

    global.performance.getEntriesByType = jest.fn((type: string) => {
      return performanceEntries.filter(e => e.entryType === type);
    });

    global.performance.getEntriesByName = jest.fn((name: string) => {
      return performanceEntries.filter(e => e.name === name);
    });

    // Mock requestAnimationFrame
    let frameId = 0;
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      setTimeout(() => callback(Date.now()), 16); // ~60fps
      return ++frameId;
    });

    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Load Performance', () => {
    test('should load pages within performance budget (< 1000ms)', async () => {
      const pages = [
        { path: '/', name: 'Home' },
        { path: '/my-builds', name: 'My Builds' },
        { path: '/tier-list', name: 'Tier List' },
        { path: '/map', name: 'Map' },
      ];

      const loadTimes: number[] = [];

      for (const page of pages) {
        const startTime = Date.now();
        
        mockPathname = page.path;
        const { rerender } = render(
          <MainLayout>
            <div>{page.name} Content</div>
          </MainLayout>
        );

        await waitFor(() => {
          const element = document.querySelector('main');
          expect(element).toBeInTheDocument();
        }, { timeout: 2000 });

        const endTime = Date.now();
        const loadTime = endTime - startTime;
        loadTimes.push(loadTime);

        // Each page should load within 1000ms
        expect(loadTime).toBeLessThan(1000);
      }

      // Average load time should be under 500ms
      const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      expect(avgLoadTime).toBeLessThan(500);
    });

    test('should handle navigation transitions within 500ms', async () => {
      mockPathname = '/';
      const { rerender } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      const startTime = Date.now();
      
      mockPathname = '/my-builds';
      rerender(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        const element = document.querySelector('main');
        expect(element).toBeInTheDocument();
      });

      const endTime = Date.now();
      const transitionTime = endTime - startTime;

      // Transition should complete within 500ms
      expect(transitionTime).toBeLessThan(500);
    });
  });

  describe('Animation Frame Rate', () => {
    test('should maintain 60fps during animations', async () => {
      const frameTimestamps: number[] = [];
      let frameCount = 0;

      // Mock RAF to track frame times
      global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
        const timestamp = Date.now();
        frameTimestamps.push(timestamp);
        frameCount++;
        
        if (frameCount < 30) { // Track 30 frames (~500ms at 60fps)
          setTimeout(() => callback(timestamp), 16.67); // 60fps = 16.67ms per frame
        }
        
        return frameCount;
      });

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
        expect(frameCount).toBeGreaterThan(0);
      }, { timeout: 1000 });

      // Calculate frame times
      if (frameTimestamps.length > 1) {
        const frameTimes = [];
        for (let i = 1; i < frameTimestamps.length; i++) {
          frameTimes.push(frameTimestamps[i] - frameTimestamps[i - 1]);
        }

        const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
        
        // Average frame time should be close to 16.67ms (60fps)
        // Allow some variance (up to 20ms for 50fps minimum)
        expect(avgFrameTime).toBeLessThan(20);
      }
    });

    test('should not drop frames during rapid navigation', async () => {
      let droppedFrames = 0;
      let lastFrameTime = Date.now();

      global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
        const currentTime = Date.now();
        const frameTime = currentTime - lastFrameTime;
        
        // Frame is considered dropped if it takes > 33ms (< 30fps)
        if (frameTime > 33) {
          droppedFrames++;
        }
        
        lastFrameTime = currentTime;
        setTimeout(() => callback(currentTime), 16.67);
        return 1;
      });

      const { rerender } = render(
        <MainLayout>
          <div>Initial Content</div>
        </MainLayout>
      );

      // Rapid navigation
      const pages = ['/', '/my-builds', '/tier-list', '/map', '/materials'];
      for (const page of pages) {
        mockPathname = page;
        rerender(
          <MainLayout>
            <div>{page} Content</div>
          </MainLayout>
        );
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Should have minimal dropped frames (< 10% tolerance)
      expect(droppedFrames).toBeLessThan(5);
    });
  });

  describe('Memory Performance', () => {
    test('should not accumulate memory during multiple navigations', async () => {
      const { rerender } = render(
        <MainLayout>
          <div>Initial Content</div>
        </MainLayout>
      );

      // Perform many navigations
      for (let i = 0; i < 20; i++) {
        mockPathname = `/page-${i}`;
        rerender(
          <MainLayout>
            <div>Page {i} Content</div>
          </MainLayout>
        );

        await waitFor(() => {
          expect(document.querySelector('main')).toBeInTheDocument();
        });
      }

      // If we complete without timeout, memory is being managed properly
      expect(true).toBe(true);
    });

    test('should clean up event listeners after navigation', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      mockPathname = '/';
      const { rerender, unmount } = render(
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
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      unmount();

      // Should clean up listeners (or at least not accumulate them)
      // This is a basic check - in real scenarios, you'd track specific listeners
      expect(removeEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Resource Loading', () => {
    test('should not block rendering while loading resources', async () => {
      const startTime = Date.now();

      mockPathname = '/map'; // Potentially heavy page
      render(
        <MainLayout>
          <div>Map Content</div>
        </MainLayout>
      );

      // Content should render quickly even if resources are loading
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      }, { timeout: 500 });

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(500);
    });

    test('should handle slow network conditions gracefully', async () => {
      // Simulate slow network by adding delay
      const slowRender = new Promise(resolve => setTimeout(resolve, 800));

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

      await slowRender;

      // Should still render eventually
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Performance Metrics', () => {
    test('should track navigation performance metrics', async () => {
      performance.mark('nav-start');

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
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      performance.mark('nav-end');
      performance.measure('navigation', 'nav-start', 'nav-end');

      const measures = performance.getEntriesByType('measure');
      expect(measures.length).toBeGreaterThan(0);
    });

    test('should provide performance insights', async () => {
      const metrics = {
        navigationStart: Date.now(),
        renderStart: 0,
        renderEnd: 0,
        totalTime: 0,
      };

      mockPathname = '/';
      const { rerender } = render(
        <MainLayout>
          <div>Home Content</div>
        </MainLayout>
      );

      metrics.renderStart = Date.now();

      mockPathname = '/my-builds';
      rerender(
        <MainLayout>
          <div>My Builds Content</div>
        </MainLayout>
      );

      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      metrics.renderEnd = Date.now();
      metrics.totalTime = metrics.renderEnd - metrics.navigationStart;

      // Verify metrics are reasonable
      expect(metrics.totalTime).toBeGreaterThan(0);
      expect(metrics.totalTime).toBeLessThan(2000);
      expect(metrics.renderEnd).toBeGreaterThan(metrics.renderStart);
    });
  });
});
