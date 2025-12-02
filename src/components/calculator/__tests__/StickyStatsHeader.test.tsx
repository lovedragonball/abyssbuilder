/**
 * StickyStatsHeader Component Tests
 * 
 * Tests for the sticky header behavior including:
 * - Header stays fixed on scroll (Requirement 1.1)
 * - Backdrop blur and shadow appearance (Requirement 1.2)
 * - Return to normal position on scroll up (Requirement 1.3)
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { StickyStatsHeader } from '../StickyStatsHeader';

// Mock IntersectionObserver with controllable behavior
let mockIntersectionCallback: IntersectionObserverCallback | null = null;
let mockObservedElements: Element[] = [];

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    mockIntersectionCallback = callback;
  }

  observe(element: Element) {
    mockObservedElements.push(element);
  }

  unobserve(element: Element) {
    mockObservedElements = mockObservedElements.filter(el => el !== element);
  }

  disconnect() {
    mockObservedElements = [];
    mockIntersectionCallback = null;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// Helper to simulate intersection changes
const simulateIntersection = (isIntersecting: boolean) => {
  if (mockIntersectionCallback && mockObservedElements.length > 0) {
    const entries: IntersectionObserverEntry[] = mockObservedElements.map(element => ({
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: element.getBoundingClientRect(),
      isIntersecting,
      rootBounds: null,
      target: element,
      time: Date.now(),
    }));
    mockIntersectionCallback(entries, {} as IntersectionObserver);
  }
};

describe('StickyStatsHeader', () => {
  beforeEach(() => {
    // Reset mocks
    mockIntersectionCallback = null;
    mockObservedElements = [];
    
    // Install mock IntersectionObserver
    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Requirement 1.1: Header stays fixed on scroll', () => {
    it('should render with sticky positioning', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Stats Content</div>
        </StickyStatsHeader>
      );

      // Find the sticky container (parent of child content)
      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      expect(stickyContainer).toHaveClass('sticky');
      expect(stickyContainer).toHaveClass('top-0');
    });

    it('should observe sentinel element for scroll detection', () => {
      render(
        <StickyStatsHeader>
          <div>Content</div>
        </StickyStatsHeader>
      );

      // Verify that an element is being observed
      expect(mockObservedElements.length).toBe(1);
    });

    it('should have proper z-index for layering', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      expect(stickyContainer).toHaveClass('z-40');
    });
  });

  describe('Requirement 1.2: Backdrop blur and shadow when scrolled', () => {
    it('should not have scrolled styles initially', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      expect(stickyContainer).toHaveClass('bg-transparent');
      expect(stickyContainer).not.toHaveClass('backdrop-blur-xl');
    });

    it('should apply backdrop blur when scrolled', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      // Simulate scrolling (sentinel no longer intersecting)
      act(() => {
        simulateIntersection(false);
      });

      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      expect(stickyContainer).toHaveClass('backdrop-blur-xl');
    });

    it('should apply shadow when scrolled', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      act(() => {
        simulateIntersection(false);
      });

      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      // Check for shadow class (shadow-[0_4px_20px_rgba(0,0,0,0.3)])
      expect(stickyContainer?.className).toContain('shadow-');
    });

    it('should apply background color when scrolled', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      act(() => {
        simulateIntersection(false);
      });

      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      expect(stickyContainer).toHaveClass('bg-[#1a1a1f]/95');
    });

    it('should apply border when scrolled', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      act(() => {
        simulateIntersection(false);
      });

      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      expect(stickyContainer).toHaveClass('border-b');
      expect(stickyContainer).toHaveClass('border-white/10');
    });
  });

  describe('Requirement 1.3: Return to normal position on scroll up', () => {
    it('should remove scrolled styles when scrolling back to top', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      // First scroll down
      act(() => {
        simulateIntersection(false);
      });

      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      // Verify scrolled state
      expect(stickyContainer).toHaveClass('backdrop-blur-xl');

      // Then scroll back up (sentinel intersecting again)
      act(() => {
        simulateIntersection(true);
      });

      // Verify normal state restored
      expect(stickyContainer).toHaveClass('bg-transparent');
      expect(stickyContainer).not.toHaveClass('backdrop-blur-xl');
    });

    it('should have smooth transition for visual changes', () => {
      render(
        <StickyStatsHeader>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      const childContent = screen.getByTestId('child-content');
      const stickyContainer = childContent.parentElement;
      
      expect(stickyContainer).toHaveClass('transition-all');
      expect(stickyContainer).toHaveClass('duration-200');
    });
  });

  describe('Render prop pattern', () => {
    it('should support render prop for passing isScrolled state', () => {
      const renderFn = jest.fn((isScrolled: boolean) => (
        <div data-testid="render-prop-child" data-scrolled={isScrolled}>
          {isScrolled ? 'Scrolled' : 'Not Scrolled'}
        </div>
      ));

      render(<StickyStatsHeader>{renderFn}</StickyStatsHeader>);

      // Initially not scrolled
      expect(renderFn).toHaveBeenCalledWith(false);
      expect(screen.getByTestId('render-prop-child')).toHaveAttribute('data-scrolled', 'false');

      // Simulate scroll
      act(() => {
        simulateIntersection(false);
      });

      expect(renderFn).toHaveBeenCalledWith(true);
      expect(screen.getByTestId('render-prop-child')).toHaveAttribute('data-scrolled', 'true');
    });
  });

  describe('Direct children with compact prop injection', () => {
    it('should inject compact prop to direct children', () => {
      const ChildComponent = ({ compact }: { compact?: boolean }) => (
        <div data-testid="child-with-compact" data-compact={compact}>
          Content
        </div>
      );

      render(
        <StickyStatsHeader>
          <ChildComponent />
        </StickyStatsHeader>
      );

      // Initially compact should be false
      expect(screen.getByTestId('child-with-compact')).toHaveAttribute('data-compact', 'false');

      // Simulate scroll
      act(() => {
        simulateIntersection(false);
      });

      // Compact should now be true
      expect(screen.getByTestId('child-with-compact')).toHaveAttribute('data-compact', 'true');
    });
  });

  describe('Threshold configuration', () => {
    it('should accept custom threshold prop', () => {
      // This test verifies the component accepts the threshold prop
      // The actual threshold behavior is handled by IntersectionObserver
      render(
        <StickyStatsHeader threshold={100}>
          <div data-testid="child-content">Content</div>
        </StickyStatsHeader>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should disconnect observer on unmount', () => {
      const { unmount } = render(
        <StickyStatsHeader>
          <div>Content</div>
        </StickyStatsHeader>
      );

      expect(mockObservedElements.length).toBe(1);

      unmount();

      // After unmount, observer should be disconnected
      expect(mockObservedElements.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden sentinel element', () => {
      const { container } = render(
        <StickyStatsHeader>
          <div>Content</div>
        </StickyStatsHeader>
      );

      // Find the sentinel element (first child with h-0 class)
      const sentinel = container.querySelector('.h-0');
      expect(sentinel).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
