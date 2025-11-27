"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface PageTemplateProps {
  children: React.ReactNode
  className?: string
}

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

/**
 * PageTemplate component for consistent page transitions
 * 
 * Usage:
 * ```tsx
 * <PageTemplate>
 *   <PageTemplate.Item>
 *     <h1>Page Title</h1>
 *   </PageTemplate.Item>
 *   <PageTemplate.Item>
 *     <p>Page content</p>
 *   </PageTemplate.Item>
 * </PageTemplate>
 * ```
 */
function PageTemplateRoot({ children, className }: PageTemplateProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface PageTemplateItemProps {
  children: React.ReactNode
  className?: string
}

function PageTemplateItem({ children, className }: PageTemplateItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
PageTemplateItem.displayName = "PageTemplateItem"

export const PageTemplate = Object.assign(PageTemplateRoot, {
  Item: PageTemplateItem,
})
