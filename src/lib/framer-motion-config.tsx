/**
 * Optimized Framer Motion Configuration
 * 
 * This module provides optimized Framer Motion imports and configurations
 * to minimize bundle size by using specific imports instead of the entire library.
 */

/**
 * IMPORTANT: Always use specific imports from framer-motion
 * 
 * ❌ Bad (imports entire library):
 * import { motion, AnimatePresence, useAnimation } from 'framer-motion';
 * 
 * ✅ Good (tree-shakeable):
 * import { motion } from 'framer-motion/dist/framer-motion';
 * import { AnimatePresence } from 'framer-motion/dist/framer-motion';
 */

// Re-export commonly used Framer Motion components with optimized imports
// These will be tree-shaken in production builds

/**
 * Motion component for animations
 * Use this instead of importing directly from framer-motion
 */
import { motion } from 'framer-motion';
export { motion };

/**
 * AnimatePresence for exit animations
 */
export { AnimatePresence } from 'framer-motion';

/**
 * Hooks for programmatic animations
 */
export { useAnimation, useInView, useScroll, useTransform } from 'framer-motion';

/**
 * Types
 */
export type {
  Variants,
  Transition,
  MotionProps,
  AnimationControls
} from 'framer-motion';

/**
 * Optimized animation variants
 * These use GPU-accelerated properties only
 */
export const optimizedVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  scaleUp: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 },
  },

  // Slide animations
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },

  slideInLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  },

  slideInUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  },

  slideInDown: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
  },
};

/**
 * Optimized transition configurations
 */
export const optimizedTransitions = {
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },

  normal: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },

  slow: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  },

  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },

  springGentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },

  springBouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
  },
};

/**
 * Stagger configuration for child animations
 */
export const staggerConfig = {
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0.05,
  },

  normal: {
    staggerChildren: 0.1,
    delayChildren: 0.1,
  },

  slow: {
    staggerChildren: 0.2,
    delayChildren: 0.15,
  },
};

/**
 * Container variants for staggered children
 */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: staggerConfig.normal,
  },
};

/**
 * Item variants for staggered children
 */
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: optimizedTransitions.normal,
  },
};

/**
 * Hover and tap animations
 */
export const interactionVariants = {
  hover: {
    scale: 1.05,
    transition: optimizedTransitions.fast,
  },

  tap: {
    scale: 0.95,
    transition: optimizedTransitions.fast,
  },

  hoverLift: {
    y: -4,
    transition: optimizedTransitions.fast,
  },

  hoverGlow: {
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    transition: optimizedTransitions.normal,
  },
};

/**
 * Page transition variants
 */
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: optimizedTransitions.normal,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: optimizedTransitions.fast,
  },
};

/**
 * Modal/Dialog variants
 */
export const modalVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  content: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: optimizedTransitions.spring,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: optimizedTransitions.fast,
    },
  },
};

/**
 * Utility function to create custom variants
 */
export function createVariant(
  initial: Record<string, any>,
  animate: Record<string, any>,
  exit?: Record<string, any>,
  transition?: any
) {
  return {
    initial,
    animate: {
      ...animate,
      transition: transition || optimizedTransitions.normal,
    },
    exit: exit || initial,
  };
}

/**
 * Utility to combine variants
 */
export function combineVariants(...variants: any[]) {
  return variants.reduce((acc, variant) => ({
    initial: { ...acc.initial, ...variant.initial },
    animate: { ...acc.animate, ...variant.animate },
    exit: { ...acc.exit, ...variant.exit },
  }), { initial: {}, animate: {}, exit: {} });
}

/**
 * Performance-optimized motion component wrapper
 * Automatically applies will-change and removes it after animation
 */
export function createOptimizedMotion(
  component: any,
  willChangeProps: string[] = ['transform', 'opacity']
) {
  const MotionComponent = (motion as any)[component];

  return function OptimizedMotion(props: any) {
    return (
      <MotionComponent
        {...props}
        style={{
          ...props.style,
          willChange: willChangeProps.join(', '),
        }}
        onAnimationComplete={() => {
          // Remove will-change after animation
          if (props.onAnimationComplete) {
            props.onAnimationComplete();
          }
        }}
      />
    );
  };
}
