"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, XCircle } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

// Shake animation keyframes for form validation errors
const shakeAnimation = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
}

// Error State Component - For full page or section errors
export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  illustration?: React.ReactNode
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading this content. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  illustration,
  className
}: ErrorStateProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Illustration or default icon */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {illustration || (
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
            <XCircle className="w-20 h-20 text-destructive relative" strokeWidth={1.5} />
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-xl font-semibold text-foreground mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {title}
      </motion.h3>

      {/* Message */}
      <motion.p
        className="text-muted-foreground max-w-md mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {message}
      </motion.p>

      {/* Retry Button */}
      {onRetry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Button onClick={onRetry} variant="default" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

// Inline Error Message Component - For form fields and inline errors
export interface InlineErrorProps {
  message: string
  icon?: React.ReactNode
  className?: string
  shake?: boolean
}

export function InlineError({
  message,
  icon,
  className,
  shake = false
}: InlineErrorProps) {
  return (
    <motion.div
      className={cn(
        "flex items-start gap-2 text-sm text-destructive mt-1.5",
        className
      )}
      initial="initial"
      animate={shake ? "shake" : "initial"}
      variants={shakeAnimation}
    >
      {icon || <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
      <span>{message}</span>
    </motion.div>
  )
}

// Form Field Error Wrapper - Adds shake animation to form fields
export interface FormFieldErrorProps {
  children: React.ReactNode
  error?: string
  showError?: boolean
  className?: string
}

export function FormFieldError({
  children,
  error,
  showError = false,
  className
}: FormFieldErrorProps) {
  const [shouldShake, setShouldShake] = React.useState(false)

  React.useEffect(() => {
    if (showError && error) {
      setShouldShake(true)
      const timer = setTimeout(() => setShouldShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [showError, error])

  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial="initial"
        animate={shouldShake ? "shake" : "initial"}
        variants={shakeAnimation}
      >
        {children}
      </motion.div>
      {showError && error && (
        <InlineError message={error} shake={shouldShake} />
      )}
    </div>
  )
}

// Error Badge Component - For displaying error counts or status
export interface ErrorBadgeProps {
  count?: number
  label?: string
  className?: string
}

export function ErrorBadge({
  count,
  label = "Error",
  className
}: ErrorBadgeProps) {
  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-destructive/10 text-destructive text-xs font-medium",
        "border border-destructive/20",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <AlertCircle className="w-3 h-3" />
      <span>
        {count !== undefined ? `${count} ${label}${count !== 1 ? 's' : ''}` : label}
      </span>
    </motion.div>
  )
}
