"use client"

import * as React from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ProgressIndicatorProps {
  progress: number
  label?: string
  variant?: 'linear' | 'circular'
  showPercentage?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ 
    progress, 
    label, 
    variant = 'linear', 
    showPercentage = true, 
    className,
    size = 'md'
  }, ref) => {
    // Clamp progress between 0 and 100
    const clampedProgress = Math.min(Math.max(progress, 0), 100)
    
    // Smooth animation for progress
    const springProgress = useSpring(clampedProgress, {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001
    })
    
    // Animated counter for percentage
    const [displayProgress, setDisplayProgress] = React.useState(0)
    
    React.useEffect(() => {
      const unsubscribe = springProgress.on("change", (latest) => {
        setDisplayProgress(Math.round(latest))
      })
      return () => unsubscribe()
    }, [springProgress])
    
    React.useEffect(() => {
      springProgress.set(clampedProgress)
    }, [clampedProgress, springProgress])

    if (variant === 'circular') {
      const sizeMap = {
        sm: { size: 60, strokeWidth: 4, fontSize: 'text-xs' },
        md: { size: 80, strokeWidth: 6, fontSize: 'text-sm' },
        lg: { size: 120, strokeWidth: 8, fontSize: 'text-lg' }
      }
      
      const { size: circleSize, strokeWidth, fontSize } = sizeMap[size]
      const radius = (circleSize - strokeWidth) / 2
      const circumference = 2 * Math.PI * radius
      const offset = useTransform(springProgress, [0, 100], [circumference, 0])

      return (
        <div ref={ref} className={cn("flex flex-col items-center gap-2", className)}>
          <div className="relative" style={{ width: circleSize, height: circleSize }}>
            <svg
              width={circleSize}
              height={circleSize}
              className="transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                fill="none"
              />
              
              {/* Progress circle with gradient */}
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(210, 90%, 60%)" />
                  <stop offset="100%" stopColor="hsl(270, 65%, 55%)" />
                </linearGradient>
              </defs>
              
              <motion.circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="url(#progress-gradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: offset }}
              />
            </svg>
            
            {/* Center percentage */}
            {showPercentage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className={cn("font-bold gradient-text", fontSize)}
                  key={displayProgress}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {displayProgress}%
                </motion.span>
              </div>
            )}
          </div>
          
          {label && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
        </div>
      )
    }

    // Linear variant
    const heightMap = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    }

    return (
      <div ref={ref} className={cn("w-full space-y-2", className)}>
        {(label || showPercentage) && (
          <div className="flex items-center justify-between text-sm">
            {label && <span className="text-muted-foreground">{label}</span>}
            {showPercentage && (
              <motion.span
                className="font-medium gradient-text"
                key={displayProgress}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {displayProgress}%
              </motion.span>
            )}
          </div>
        )}
        
        <div className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted",
          heightMap[size]
        )}>
          {/* Gradient progress bar */}
          <motion.div
            className="h-full rounded-full gradient-primary relative overflow-hidden"
            style={{
              width: useTransform(springProgress, (v) => `${v}%`)
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>
      </div>
    )
  }
)

ProgressIndicator.displayName = "ProgressIndicator"

export { ProgressIndicator }
