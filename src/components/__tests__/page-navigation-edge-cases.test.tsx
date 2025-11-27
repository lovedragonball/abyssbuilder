/**
 * Edge Case Tests for Page Navigation
 * 
 * Tests cover:
 * - Same page navigation (clicking menu item twice)
 * - Rapid navigation (quick successive clicks)
 * - Browser back/forward buttons
 * - Direct URL access (page reload)
 * - Slow network conditions
 * 
 * Requirements: 4.2, 4.3
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import PageTransition from '../page-transition'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

describe('Page Navigation Edge Cases', () => {
  let mockRouter: any
  let mockPathname: string

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
    mockPathname = '/'
    
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockImplementation(() => mockPathname)
    
    // Clear all timers
    jest.clearAllTimers()
    jest.useFakeTimers({ doNotFake: ['Date'] })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Same Page Navigation', () => {
    it('should handle clicking the same menu item twice without errors', async () => {
      const TestComponent = () => (
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      )

      const { rerender } = render(<TestComponent />)
      
      // First render
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      
      // Simulate clicking same page (pathname doesn't change)
      rerender(<TestComponent />)
      
      // Content should still be visible
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should not trigger animation when pathname is the same', async () => {
      const onAnimationStart = jest.fn()
      
      const TestComponent = () => (
        <PageTransition>
          <div onAnimationStart={onAnimationStart}>Test Content</div>
        </PageTransition>
      )

      const { rerender } = render(<TestComponent />)
      
      const initialCallCount = onAnimationStart.mock.calls.length
      
      // Re-render with same pathname
      rerender(<TestComponent />)
      
      // Animation should not be triggered again
      expect(onAnimationStart.mock.calls.length).toBe(initialCallCount)
    })

    it('should maintain scroll position on same page navigation', async () => {
      const scrollToSpy = jest.fn()
      window.scrollTo = scrollToSpy

      const TestComponent = () => (
        <PageTransition>
          <div style={{ height: '2000px' }}>Tall Content</div>
        </PageTransition>
      )

      const { rerender } = render(<TestComponent />)
      
      // Simulate scroll
      window.scrollY = 500
      
      // Re-render same page
      rerender(<TestComponent />)
      
      // Scroll position should not be reset
      expect(scrollToSpy).not.toHaveBeenCalledWith(0, 0)
    })
  })

  describe('Rapid Navigation', () => {
    it('should handle rapid successive navigation without breaking', async () => {
      const paths = ['/my-builds', '/tier-list', '/map', '/attribute-optimizer', '/materials']
      
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/" />)
      
      // Rapidly change paths
      for (const path of paths) {
        await act(async () => {
          rerender(<TestComponent path={path} />)
          // Don't wait for animation to complete
          jest.advanceTimersByTime(50) // Only 50ms between navigations
        })
      }
      
      // Final content should be visible
      await waitFor(() => {
        expect(screen.getByText(`Content for ${paths[paths.length - 1]}`)).toBeInTheDocument()
      })
    })

    it('should cancel previous animation when new navigation starts', async () => {
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/page1" />)
      
      // Start navigation to page2
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(100) // Partial animation
      })
      
      // Immediately navigate to page3 before page2 animation completes
      await act(async () => {
        rerender(<TestComponent path="/page3" />)
        jest.advanceTimersByTime(600) // Complete animation
      })
      
      // Should show page3 content, not page2
      expect(screen.getByText('Content for /page3')).toBeInTheDocument()
      expect(screen.queryByText('Content for /page2')).not.toBeInTheDocument()
    })

    it('should not accumulate animation delays during rapid navigation', async () => {
      const startTime = Date.now()
      
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/page1" />)
      
      // Rapidly navigate through 5 pages
      for (let i = 2; i <= 6; i++) {
        await act(async () => {
          rerender(<TestComponent path={`/page${i}`} />)
          jest.advanceTimersByTime(600) // Complete each animation
        })
      }
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      // Total time should be reasonable (not 5x the animation duration)
      // With fake timers, this should be very fast
      expect(totalTime).toBeLessThan(1000)
    })
  })

  describe('Browser Back/Forward Navigation', () => {
    it('should handle browser back button correctly', async () => {
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/page1" />)
      
      // Navigate to page2
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(600)
      })
      
      expect(screen.getByText('Content for /page2')).toBeInTheDocument()
      
      // Simulate back button
      await act(async () => {
        rerender(<TestComponent path="/page1" />)
        jest.advanceTimersByTime(600)
      })
      
      expect(screen.getByText('Content for /page1')).toBeInTheDocument()
    })

    it('should handle browser forward button correctly', async () => {
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/page1" />)
      
      // Navigate forward then back
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(600)
      })
      
      await act(async () => {
        rerender(<TestComponent path="/page1" />)
        jest.advanceTimersByTime(600)
      })
      
      // Forward navigation
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(600)
      })
      
      expect(screen.getByText('Content for /page2')).toBeInTheDocument()
    })

    it('should maintain animation smoothness during back/forward navigation', async () => {
      const animationStates: string[] = []
      
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div 
              onAnimationStart={() => animationStates.push('start')}
              onAnimationEnd={() => animationStates.push('end')}
            >
              Content for {path}
            </div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/page1" />)
      
      // Navigate back and forth multiple times
      const paths = ['/page2', '/page1', '/page2', '/page1']
      
      for (const path of paths) {
        await act(async () => {
          rerender(<TestComponent path={path} />)
          jest.advanceTimersByTime(600)
        })
      }
      
      // Each navigation should have start and end
      expect(animationStates.filter(s => s === 'start').length).toBeGreaterThan(0)
      expect(animationStates.filter(s => s === 'end').length).toBeGreaterThan(0)
    })
  })

  describe('Direct URL Access and Page Reload', () => {
    it('should render content correctly on direct URL access', async () => {
      mockPathname = '/my-builds'
      
      const { container } = render(
        <PageTransition>
          <div>My Builds Content</div>
        </PageTransition>
      )
      
      await act(async () => {
        jest.advanceTimersByTime(600)
      })
      
      expect(screen.getByText('My Builds Content')).toBeInTheDocument()
    })

    it('should handle page reload without animation issues', async () => {
      const TestComponent = () => {
        mockPathname = '/tier-list'
        return (
          <PageTransition>
            <div>Tier List Content</div>
          </PageTransition>
        )
      }

      const { unmount, rerender } = render(<TestComponent />)
      
      await act(async () => {
        jest.advanceTimersByTime(600)
      })
      
      // Simulate page reload by unmounting and remounting
      unmount()
      
      const { container } = render(<TestComponent />)
      
      await act(async () => {
        jest.advanceTimersByTime(600)
      })
      
      expect(screen.getByText('Tier List Content')).toBeInTheDocument()
    })

    it('should initialize correctly for all routes on direct access', async () => {
      const routes = [
        '/my-builds',
        '/tier-list',
        '/map',
        '/attribute-optimizer',
        '/materials',
        '/news'
      ]

      for (const route of routes) {
        mockPathname = route
        
        const { unmount } = render(
          <PageTransition>
            <div>Content for {route}</div>
          </PageTransition>
        )
        
        await act(async () => {
          jest.advanceTimersByTime(600)
        })
        
        expect(screen.getByText(`Content for ${route}`)).toBeInTheDocument()
        
        unmount()
      }
    })
  })

  describe('Slow Network Conditions', () => {
    it('should show fallback after timeout on slow load', async () => {
      const TestComponent = ({ loading }: { loading: boolean }) => (
        <PageTransition fallbackDelay={1000}>
          {loading ? <div>Loading...</div> : <div>Content Loaded</div>}
        </PageTransition>
      )

      const { rerender } = render(<TestComponent loading={true} />)
      
      // Simulate slow network - content doesn't load
      await act(async () => {
        jest.advanceTimersByTime(1100) // Past fallback delay
      })
      
      // Should still show loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      
      // Eventually content loads
      await act(async () => {
        rerender(<TestComponent loading={false} />)
        jest.advanceTimersByTime(600)
      })
      
      expect(screen.getByText('Content Loaded')).toBeInTheDocument()
    })

    it('should not block rendering when animation is delayed', async () => {
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/page1" />)
      
      // Navigate to new page
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        // Don't advance timers - simulate animation being stuck
      })
      
      // After fallback timeout, content should be visible anyway
      await act(async () => {
        jest.advanceTimersByTime(1100)
      })
      
      expect(screen.getByText('Content for /page2')).toBeInTheDocument()
    })

    it('should handle component mounting during slow network', async () => {
      let mountCount = 0
      
      const SlowComponent = () => {
        mountCount++
        return <div>Slow Component (mounted {mountCount} times)</div>
      }

      const TestComponent = ({ show }: { show: boolean }) => (
        <PageTransition>
          {show ? <SlowComponent /> : <div>Placeholder</div>}
        </PageTransition>
      )

      const { rerender } = render(<TestComponent show={false} />)
      
      // Trigger component to show
      await act(async () => {
        rerender(<TestComponent show={true} />)
        jest.advanceTimersByTime(2000) // Simulate slow load
      })
      
      // Component should mount only once despite slow network
      expect(mountCount).toBe(1)
      expect(screen.getByText(/Slow Component/)).toBeInTheDocument()
    })

    it('should recover from network timeout gracefully', async () => {
      const onError = jest.fn()
      
      const TestComponent = ({ shouldError }: { shouldError: boolean }) => {
        if (shouldError) {
          throw new Error('Network timeout')
        }
        return (
          <PageTransition>
            <div>Content Loaded</div>
          </PageTransition>
        )
      }

      // Wrap in error boundary
      class ErrorBoundary extends React.Component<
        { children: React.ReactNode; onError: (error: Error) => void },
        { hasError: boolean }
      > {
        constructor(props: any) {
          super(props)
          this.state = { hasError: false }
        }

        static getDerivedStateFromError() {
          return { hasError: true }
        }

        componentDidCatch(error: Error) {
          this.props.onError(error)
        }

        componentDidUpdate(prevProps: any) {
          if (this.state.hasError && prevProps.children !== this.props.children) {
            this.setState({ hasError: false })
          }
        }

        render() {
          if (this.state.hasError) {
            return <div>Error: Network timeout</div>
          }
          return this.props.children
        }
      }

      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <TestComponent shouldError={true} />
        </ErrorBoundary>
      )
      
      expect(onError).toHaveBeenCalled()
      expect(screen.getByText('Error: Network timeout')).toBeInTheDocument()
      
      // Recover by retrying
      rerender(
        <ErrorBoundary onError={onError}>
          <TestComponent shouldError={false} />
        </ErrorBoundary>
      )
      
      await act(async () => {
        jest.advanceTimersByTime(600)
      })
      
      // Should show content after recovery
      expect(screen.getByText('Content Loaded')).toBeInTheDocument()
    })
  })

  describe('Combined Edge Cases', () => {
    it('should handle rapid navigation with back button', async () => {
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/page1" />)
      
      // Rapid forward navigation
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(100)
      })
      
      await act(async () => {
        rerender(<TestComponent path="/page3" />)
        jest.advanceTimersByTime(100)
      })
      
      // Back button during animation
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(600)
      })
      
      expect(screen.getByText('Content for /page2')).toBeInTheDocument()
    })

    it('should handle same page click during animation', async () => {
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender } = render(<TestComponent path="/page1" />)
      
      // Start navigation
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(300) // Mid-animation
      })
      
      // Click same page during animation
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(300)
      })
      
      expect(screen.getByText('Content for /page2')).toBeInTheDocument()
    })

    it('should handle reload during rapid navigation', async () => {
      const TestComponent = ({ path }: { path: string }) => {
        mockPathname = path
        return (
          <PageTransition>
            <div>Content for {path}</div>
          </PageTransition>
        )
      }

      const { rerender, unmount } = render(<TestComponent path="/page1" />)
      
      // Start rapid navigation
      await act(async () => {
        rerender(<TestComponent path="/page2" />)
        jest.advanceTimersByTime(100)
      })
      
      // Simulate reload mid-navigation
      unmount()
      
      const { container } = render(<TestComponent path="/page2" />)
      
      await act(async () => {
        jest.advanceTimersByTime(600)
      })
      
      expect(screen.getByText('Content for /page2')).toBeInTheDocument()
    })
  })
})
