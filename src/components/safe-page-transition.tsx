'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface SafePageTransitionProps {
  children: ReactNode
  fallback?: ReactNode
}

interface SafePageTransitionState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

/**
 * SafePageTransition - Error Boundary Component
 * 
 * Wraps PageTransition to catch and handle errors from Framer Motion animations.
 * Provides fallback UI when animations fail and includes recovery mechanisms.
 * 
 * Features:
 * - Error boundary for animation errors
 * - Fallback UI without animations
 * - Error logging for debugging
 * - Automatic recovery mechanism
 * - Error count tracking to prevent infinite loops
 */
class SafePageTransition extends Component<SafePageTransitionProps, SafePageTransitionState> {
  private resetTimeout: NodeJS.Timeout | null = null
  private readonly MAX_ERROR_COUNT = 3
  private readonly RESET_DELAY = 5000 // 5 seconds

  constructor(props: SafePageTransitionProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<SafePageTransitionState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('SafePageTransition caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })

    // Update error info in state and handle recovery flow
    this.setState(prevState => {
      const nextErrorCount = prevState.errorCount + 1

      if (nextErrorCount < this.MAX_ERROR_COUNT) {
        this.scheduleRecovery()
      } else {
        if (this.resetTimeout) {
          clearTimeout(this.resetTimeout)
          this.resetTimeout = null
        }
        console.warn(
          `SafePageTransition: Maximum error count (${this.MAX_ERROR_COUNT}) reached. ` +
          'Automatic recovery disabled. Manual page refresh may be required.'
        )
      }

      return {
        errorInfo,
        errorCount: nextErrorCount
      }
    })
  }

  componentWillUnmount(): void {
    // Clean up timeout on unmount
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
    }
  }

  componentDidUpdate(prevProps: SafePageTransitionProps): void {
    // If children change while in error state and we haven't reached the max error limit,
    // try rendering again to allow recovery attempts.
    if (
      this.state.hasError &&
      this.state.errorCount < this.MAX_ERROR_COUNT &&
      prevProps.children !== this.props.children
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      })
    }
  }

  /**
   * Schedule automatic recovery after a delay
   */
  private scheduleRecovery = (): void => {
    // Clear any existing timeout
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
    }

    // Schedule recovery
    this.resetTimeout = setTimeout(() => {
      console.log('SafePageTransition: Attempting automatic recovery...')
      this.resetErrorBoundary()
    }, this.RESET_DELAY)
  }

  /**
   * Reset error boundary state to attempt recovery
   */
  private resetErrorBoundary = (): void => {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
      this.resetTimeout = null
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  /**
   * Manual recovery handler for user-triggered reset
   */
  private handleManualReset = (): void => {
    console.log('SafePageTransition: Manual recovery triggered')
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
      this.resetTimeout = null
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    })
  }

  /**
   * Handle user-triggered page refresh in a test-friendly way
   */
  private handleRefresh = (): void => {
    const testReload = (window as any).__SAFE_PAGE_RELOAD__
    if (typeof testReload === 'function') {
      testReload()
      return
    }

    if (typeof window.location?.reload === 'function') {
      window.location.reload()
    }
  }

  render(): ReactNode {
    const { hasError, error, errorCount } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Page Transition Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  {error?.message || 'An error occurred during page transition.'}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mb-4">
                  An error occurred during page transition.
                </p>
                
                {errorCount < this.MAX_ERROR_COUNT ? (
                  <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                    Automatic recovery will be attempted in {this.RESET_DELAY / 1000} seconds...
                  </p>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                    Multiple errors detected. Please refresh the page manually.
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={this.handleManualReset}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={this.handleRefresh}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>

                {process.env.NODE_ENV === 'development' && error && (
                  <details className="mt-4">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                      Error Details (Development Only)
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto p-2 bg-red-100 dark:bg-red-900/30 rounded">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // No error, render children normally
    return children
  }
}

export default SafePageTransition
