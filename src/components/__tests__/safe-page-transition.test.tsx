/**
 * Comprehensive Tests for SafePageTransition Error Boundary
 * 
 * Test Coverage:
 * - Error boundary functionality
 * - Fallback UI rendering
 * - Error logging
 * - Automatic recovery mechanism
 * - Manual recovery
 * - Error count tracking
 * - Custom fallback support
 * - Component lifecycle
 * 
 * Requirements Coverage:
 * - 3.2: AnimatePresence SHALL have proper error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SafePageTransition from '../safe-page-transition';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error from child component');
  }
  return <div>Working Component</div>;
};

describe('SafePageTransition', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    
    // Suppress console.error in tests (React logs errors from error boundaries)
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <SafePageTransition>
          <div>Test Content</div>
        </SafePageTransition>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should pass through multiple children', () => {
      render(
        <SafePageTransition>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </SafePageTransition>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should render complex component trees', () => {
      render(
        <SafePageTransition>
          <div>
            <header>Header</header>
            <main>
              <article>Article Content</article>
            </main>
            <footer>Footer</footer>
          </div>
        </SafePageTransition>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Article Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Functionality', () => {
    it('should catch errors from child components', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Should show error UI instead of crashing
      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();
    });

    it('should display error message in fallback UI', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      expect(screen.getByText(/Test error from child component/i)).toBeInTheDocument();
    });

    it('should log error details to console', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('SafePageTransition caught an error:'),
        expect.objectContaining({
          error: 'Test error from child component',
          timestamp: expect.any(String),
        })
      );
    });

    it('should include component stack in error log', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      expect(console.error).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should handle errors during rendering', () => {
      const ErrorComponent = () => {
        throw new Error('Render error');
      };

      render(
        <SafePageTransition>
          <ErrorComponent />
        </SafePageTransition>
      );

      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();
    });

    it('should handle errors during lifecycle methods', () => {
      class ErrorLifecycle extends React.Component {
        componentDidMount() {
          throw new Error('Lifecycle error');
        }
        render() {
          return <div>Content</div>;
        }
      }

      render(
        <SafePageTransition>
          <ErrorLifecycle />
        </SafePageTransition>
      );

      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should render default fallback UI on error', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();
      expect(screen.getByText(/Test error from child component/i)).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom Error Message</div>;

      render(
        <SafePageTransition fallback={customFallback}>
          <ThrowError />
        </SafePageTransition>
      );

      expect(screen.getByText('Custom Error Message')).toBeInTheDocument();
      expect(screen.queryByText('Page Transition Error')).not.toBeInTheDocument();
    });

    it('should show Try Again button in default fallback', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should show Refresh Page button in default fallback', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    });

    it('should display error icon in fallback UI', () => {
      const { container } = render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Automatic Recovery', () => {
    it('should schedule automatic recovery after error', () => {
      const { rerender } = render(
        <SafePageTransition>
          <ThrowError shouldThrow={true} />
        </SafePageTransition>
      );

      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();
      expect(screen.getByText(/Automatic recovery will be attempted/i)).toBeInTheDocument();
    });

    it('should attempt recovery after 5 seconds', () => {
      let shouldThrow = true;
      
      const { rerender } = render(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();

      // Fix the error
      shouldThrow = false;

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      rerender(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Attempting automatic recovery')
      );
    });

    it('should clear recovery timeout on unmount', () => {
      const { unmount } = render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      unmount();

      // Should not crash or log errors
      jest.advanceTimersByTime(10000);
    });

    it('should not schedule recovery after max error count', () => {
      const { rerender } = render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Trigger multiple errors by re-rendering
      for (let i = 0; i < 3; i++) {
        rerender(
          <SafePageTransition>
            <ThrowError />
          </SafePageTransition>
        );
      }

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Maximum error count')
      );
      expect(screen.getByText(/Please refresh the page manually/i)).toBeInTheDocument();
    });
  });

  describe('Manual Recovery', () => {
    it('should reset error state when Try Again is clicked', () => {
      let shouldThrow = true;

      const { rerender } = render(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();

      // Fix the error
      shouldThrow = false;

      // Click Try Again
      fireEvent.click(screen.getByText('Try Again'));

      rerender(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Manual recovery triggered')
      );
    });

    it('should reset error count on manual recovery', () => {
      let shouldThrow = true;

      const { rerender } = render(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      // Trigger error
      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();

      // Fix error and manually recover
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try Again'));

      rerender(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      // Error count should be reset
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Manual recovery triggered')
      );
    });

    it('should reload page when Refresh Page is clicked', () => {
      const reloadSpy = jest.fn();
      (window as any).__SAFE_PAGE_RELOAD__ = reloadSpy;

      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      fireEvent.click(screen.getByText('Refresh Page'));

      expect(reloadSpy).toHaveBeenCalled();
      delete (window as any).__SAFE_PAGE_RELOAD__;
    });
  });

  describe('Error Count Tracking', () => {
    it('should track number of errors', () => {
      const { rerender } = render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // First error
      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();

      // Trigger more errors
      rerender(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      rerender(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Should show warning after max errors
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Maximum error count')
      );
    });

    it('should disable automatic recovery after max errors', () => {
      const { rerender } = render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Trigger max errors
      for (let i = 0; i < 3; i++) {
        rerender(
          <SafePageTransition>
            <ThrowError />
          </SafePageTransition>
        );
      }

      expect(screen.getByText(/Please refresh the page manually/i)).toBeInTheDocument();
      expect(screen.queryByText(/Automatic recovery will be attempted/i)).not.toBeInTheDocument();
    });

    it('should have max error count of 3', () => {
      const { rerender } = render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Trigger exactly 3 errors
      for (let i = 0; i < 3; i++) {
        rerender(
          <SafePageTransition>
            <ThrowError />
          </SafePageTransition>
        );
      }

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Maximum error count (3)')
      );
    });
  });

  describe('Development Mode Features', () => {
    it('should show error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should show error stack in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { container } = render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      const details = container.querySelector('details');
      expect(details).toBeInTheDocument();

      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize with no error state', () => {
      render(
        <SafePageTransition>
          <div>Content</div>
        </SafePageTransition>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.queryByText('Page Transition Error')).not.toBeInTheDocument();
    });

    it('should transition from error to normal state', () => {
      let shouldThrow = true;

      const { rerender } = render(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();

      // Fix error
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try Again'));

      rerender(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      expect(screen.getByText('Working Component')).toBeInTheDocument();
    });

    it('should handle multiple error-recovery cycles', () => {
      let shouldThrow = true;

      const { rerender } = render(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );

      // First error
      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();

      // Recover
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try Again'));
      rerender(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );
      expect(screen.getByText('Working Component')).toBeInTheDocument();

      // Second error
      shouldThrow = true;
      rerender(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );
      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();

      // Recover again
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try Again'));
      rerender(
        <SafePageTransition>
          <ThrowError shouldThrow={shouldThrow} />
        </SafePageTransition>
      );
      expect(screen.getByText('Working Component')).toBeInTheDocument();
    });
  });

  describe('Requirements Coverage', () => {
    it('Requirement 3.2: SHALL have proper error handling for AnimatePresence', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Should catch error and show fallback
      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();
      
      // Should log error
      expect(console.error).toHaveBeenCalled();
      
      // Should provide recovery options
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    });

    it('Requirement 3.2: SHALL provide fallback UI when animation fails', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Should render fallback instead of crashing
      expect(screen.getByText('Page Transition Error')).toBeInTheDocument();
      expect(screen.getByText(/An error occurred during page transition/i)).toBeInTheDocument();
    });

    it('Requirement 3.2: SHALL include error logging for debugging', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Should log detailed error information
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('SafePageTransition caught an error:'),
        expect.objectContaining({
          error: expect.any(String),
          stack: expect.any(String),
          componentStack: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it('Requirement 3.2: SHALL include recovery mechanism', () => {
      render(
        <SafePageTransition>
          <ThrowError />
        </SafePageTransition>
      );

      // Should provide automatic recovery
      expect(screen.getByText(/Automatic recovery will be attempted/i)).toBeInTheDocument();
      
      // Should provide manual recovery
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});
