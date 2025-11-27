"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export interface UpdateCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  title?: string
  children?: React.ReactNode
  maxHeight?: string
  showScrollbar?: boolean
  headerActions?: React.ReactNode
  /** ARIA role for the card (default: "article") */
  role?: string
  /** ARIA label for the card */
  "aria-label"?: string
  /** ARIA labelledby for the card */
  "aria-labelledby"?: string
}

const UpdateCard = React.forwardRef<HTMLDivElement, UpdateCardProps>(
  ({ 
    className, 
    title, 
    children, 
    maxHeight = "600px", 
    showScrollbar = true,
    headerActions,
    role = "article",
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...props 
  }, ref) => {
    const titleId = React.useId()
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "update-card rounded-2xl border border-white/10 overflow-hidden",
          "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]",
          "shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
          "transition-all duration-300 ease-out",
          "hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-white/20",
          "focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:ring-offset-2 focus-within:ring-offset-[#1a1a2e]",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -4,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ willChange: "transform, opacity" }}
        role={role}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby || (title ? titleId : undefined)}
        {...props}
      >
        {title && (
          <div className="card-header px-6 py-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 
              id={titleId}
              className="card-title text-xl font-semibold text-white flex items-center gap-2"
            >
              {title}
            </h2>
            {headerActions && (
              <div className="card-header-actions">
                {headerActions}
              </div>
            )}
          </div>
        )}
        <div
          className={cn(
            "card-content px-6 py-4 overflow-y-auto",
            showScrollbar && "custom-scrollbar",
            "scroll-smooth"
          )}
          style={{ maxHeight }}
          tabIndex={0}
          role="region"
          aria-label={title ? `${title} content` : "Card content"}
        >
          {children}
        </div>
      </motion.div>
    )
  }
)
UpdateCard.displayName = "UpdateCard"

const UpdateCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "card-header px-6 py-5 border-b border-white/10 bg-white/5",
      className
    )}
    {...props}
  />
))
UpdateCardHeader.displayName = "UpdateCardHeader"

const UpdateCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "card-title text-xl font-semibold text-white flex items-center gap-2",
      className
    )}
    {...props}
  />
))
UpdateCardTitle.displayName = "UpdateCardTitle"

const UpdateCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    maxHeight?: string
    showScrollbar?: boolean
  }
>(({ className, maxHeight = "600px", showScrollbar = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "card-content px-6 py-4 overflow-y-auto",
      showScrollbar && "custom-scrollbar",
      "scroll-smooth",
      className
    )}
    style={{ maxHeight }}
    {...props}
  />
))
UpdateCardContent.displayName = "UpdateCardContent"

export { UpdateCard, UpdateCardHeader, UpdateCardTitle, UpdateCardContent }
