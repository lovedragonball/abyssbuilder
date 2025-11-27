"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useRipple } from "@/hooks/use-ripple"

const enhancedCardVariants = cva(
  "rounded-lg transition-all duration-normal relative",
  {
    variants: {
      variant: {
        default: "bg-card border border-border",
        elevated: "bg-card shadow-elevated",
        glass: "glass-card",
        bordered: "bg-card border-2 border-primary/20",
      },
      hoverEffect: {
        none: "",
        lift: "hover:shadow-elevated-lg hover:-translate-y-1",
        glow: "hover:shadow-glow",
        scale: "hover:scale-[1.02]",
      },
    },
    defaultVariants: {
      variant: "default",
      hoverEffect: "none",
    },
  }
)

export interface EnhancedCardProps
  extends Omit<HTMLMotionProps<"div">, "children">,
  VariantProps<typeof enhancedCardVariants> {
  children?: React.ReactNode
  accentColor?: string
  accentGradient?: boolean
  clickable?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, hoverEffect, accentColor, accentGradient = false, clickable = false, children, onClick, ...props }, ref) => {
    const { createRipple, ripples } = useRipple();

    const accentStyle = accentColor
      ? {
        borderTopColor: accentColor,
        borderTopWidth: "3px",
      }
      : {}

    const accentGradientStyle = accentGradient
      ? {
        borderImage: "linear-gradient(90deg, hsl(210, 90%, 60%) 0%, hsl(270, 65%, 55%) 100%) 1",
        borderImageSlice: "1 0 0 0",
      }
      : {}

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (clickable) {
        createRipple(e);
      }
      onClick?.(e as any);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const syntheticEvent = {
          ...e,
          clientX: 0,
          clientY: 0,
          currentTarget: e.currentTarget,
        } as any;
        handleClick(syntheticEvent);
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          enhancedCardVariants({ variant, hoverEffect }),
          className,
          clickable && "cursor-pointer"
        )}
        style={{ ...accentStyle, ...accentGradientStyle }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? "button" : undefined}
        {...props}
      >
        {children}
        {clickable && ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </motion.div>
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xl sm:text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-6 pt-0", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
}
