/**
 * Error boundary for News Updates Section
 * Catches and handles errors gracefully during rendering
 */

"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface NewsErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  locale?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ 
  error, 
  resetError,
  locale = "en" 
}: { 
  error: Error | null
  resetError: () => void
  locale?: string
}) {
  const translations = {
    en: {
      title: "Something went wrong",
      message: "We encountered an error while loading the news updates.",
      retry: "Try Again",
      details: "Error details"
    },
    th: {
      title: "เกิดข้อผิดพลาด",
      message: "เราพบข้อผิดพลาดขณะโหลดข่าวสารและการอัปเดต",
      retry: "ลองอีกครั้ง",
      details: "รายละเอียดข้อผิดพลาด"
    }
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-12 px-6 text-center",
        "rounded-2xl border border-red-500/20",
        "bg-gradient-to-br from-red-900/10 to-red-800/10"
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{t.title}</h3>
      <p className="text-sm text-gray-400 mb-4">{t.message}</p>
      
      {error && (
        <details className="mb-4 text-left w-full max-w-md">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
            {t.details}
          </summary>
          <pre className="mt-2 text-xs text-red-400 bg-black/20 p-3 rounded overflow-auto max-h-32">
            {error.message}
          </pre>
        </details>
      )}

      <Button
        onClick={resetError}
        variant="outline"
        size="sm"
        className="text-red-400 border-red-400/50 hover:bg-red-500/10"
      >
        {t.retry}
      </Button>
    </div>
  )
}

/**
 * Error Boundary Component for News Updates Section
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * @example
 * ```tsx
 * <NewsErrorBoundary>
 *   <NewsUpdatesSection patchData={patchData} />
 * </NewsErrorBoundary>
 * ```
 */
export class NewsErrorBoundary extends React.Component<
  NewsErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: NewsErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('NewsErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback or default error UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          locale={this.props.locale}
        />
      )
    }

    return this.props.children
  }
}
