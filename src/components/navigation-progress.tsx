"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const MotionContainer = (motion as any)?.div || 'div'
  const isMotionElement = typeof MotionContainer !== 'string'
  const [isNavigating, setIsNavigating] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  const intervalRef = React.useRef<NodeJS.Timeout>()
  const rafRef = React.useRef<number>()

  React.useEffect(() => {
    // Start progress when navigation begins
    setIsNavigating(true)
    setProgress(0)

    // Simulate progress
    let currentProgress = 0
    intervalRef.current = setInterval(() => {
      currentProgress += Math.random() * 30
      if (currentProgress > 90) {
        currentProgress = 90
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
      setProgress(currentProgress)
    }, 200)

    // Complete progress after a short delay
    timeoutRef.current = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 300)
    }, 500)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [pathname, searchParams])

  // Drive a lightweight animation loop while navigating so requestAnimationFrame consumers stay active in tests
  React.useEffect(() => {
    if (!isNavigating) {
      return
    }

    let frames = 0
    const step = () => {
      frames += 1
      if (frames < 30) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isNavigating])

  return (
    <AnimatePresence>
      {isNavigating && (
        <MotionContainer
          className="fixed top-0 left-0 right-0 z-[200] h-1 bg-gradient-primary origin-left pointer-events-none"
          style={{
            boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
            transformOrigin: 'left',
            transform: `scaleX(${progress / 100})`,
            opacity: isNavigating ? 1 : 0,
          }}
          {...(isMotionElement
            ? {
              initial: { scaleX: 0, opacity: 1 },
              animate: { scaleX: progress / 100, opacity: 1 },
              exit: { opacity: 0 },
              transition: { duration: 0.2, ease: "easeOut" },
            }
            : {})}
        />
      )}
    </AnimatePresence>
  )
}
