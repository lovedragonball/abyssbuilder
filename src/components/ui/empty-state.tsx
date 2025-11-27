"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
    FileQuestion,
    Inbox,
    Search,
    FolderOpen,
    Package,
    Users,
    Star,
    Plus
} from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

// Icon mapping for common empty state scenarios
const iconMap = {
    default: Inbox,
    search: Search,
    folder: FolderOpen,
    package: Package,
    users: Users,
    favorites: Star,
    file: FileQuestion,
} as const

export type EmptyStateIcon = keyof typeof iconMap

// Empty State Component
export interface EmptyStateProps {
    title?: string
    description?: string
    icon?: EmptyStateIcon | React.ReactNode
    action?: {
        label: string
        onClick: () => void
        variant?: "default" | "gradient" | "outline"
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
    illustration?: React.ReactNode
    className?: string
}

export function EmptyState({
    title = "No items found",
    description = "Get started by creating your first item.",
    icon = "default",
    action,
    secondaryAction,
    illustration,
    className
}: EmptyStateProps) {
    // Determine which icon to render
    const IconComponent = typeof icon === "string" && icon in iconMap ? iconMap[icon as EmptyStateIcon] : null
    const iconElement = IconComponent ? <IconComponent className="w-16 h-16" strokeWidth={1.5} /> : icon

    return (
        <motion.div
            className={cn(
                "flex flex-col items-center justify-center p-8 md:p-12 text-center",
                "min-h-[400px]",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Illustration or Icon */}
            <motion.div
                className="mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
            >
                {illustration || (
                    <div className="relative">
                        {/* Glow effect behind icon */}
                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
                        <div className="relative text-muted-foreground/40">
                            {iconElement}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Title */}
            <motion.h3
                className="text-2xl font-semibold text-foreground mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                {title}
            </motion.h3>

            {/* Description */}
            <motion.p
                className="text-muted-foreground max-w-md mb-8 text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                {description}
            </motion.p>

            {/* Actions */}
            {(action || secondaryAction) && (
                <motion.div
                    className="flex flex-col sm:flex-row gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                >
                    {action && (
                        <Button
                            onClick={action.onClick}
                            variant={action.variant || "gradient"}
                            size="lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            onClick={secondaryAction.onClick}
                            variant="outline"
                            size="lg"
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </motion.div>
            )}
        </motion.div>
    )
}

// Compact Empty State - For smaller sections or cards
export interface CompactEmptyStateProps {
    message: string
    icon?: EmptyStateIcon | React.ReactNode
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export function CompactEmptyState({
    message,
    icon = "default",
    action,
    className
}: CompactEmptyStateProps) {
    const IconComponent = typeof icon === "string" && icon in iconMap ? iconMap[icon as EmptyStateIcon] : null
    const iconElement = IconComponent ? <IconComponent className="w-8 h-8" strokeWidth={1.5} /> : icon

    return (
        <motion.div
            className={cn(
                "flex flex-col items-center justify-center p-6 text-center",
                className
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="text-muted-foreground/40 mb-3">
                {iconElement}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                {message}
            </p>
            {action && (
                <Button
                    onClick={action.onClick}
                    variant="outline"
                    size="sm"
                >
                    {action.label}
                </Button>
            )}
        </motion.div>
    )
}

// Empty Search Results Component
export interface EmptySearchResultsProps {
    query: string
    onClear?: () => void
    suggestions?: string[]
    className?: string
}

export function EmptySearchResults({
    query,
    onClear,
    suggestions,
    className
}: EmptySearchResultsProps) {
    return (
        <motion.div
            className={cn(
                "flex flex-col items-center justify-center p-8 text-center",
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-muted/20 blur-2xl rounded-full" />
                <Search className="w-12 h-12 text-muted-foreground/40 relative" strokeWidth={1.5} />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
                No results for "{query}"
            </h3>

            <p className="text-muted-foreground max-w-md mb-6">
                We couldn't find any matches for your search. Try adjusting your search terms.
            </p>

            {suggestions && suggestions.length > 0 && (
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-3">Try searching for:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {suggestions.map((suggestion, index) => (
                            <motion.button
                                key={index}
                                className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {suggestion}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {onClear && (
                <Button onClick={onClear} variant="outline">
                    Clear Search
                </Button>
            )}
        </motion.div>
    )
}

// Empty List Component - For lists with no items
export interface EmptyListProps {
    type: string // e.g., "builds", "teams", "favorites"
    onCreateNew?: () => void
    className?: string
}

export function EmptyList({
    type,
    onCreateNew,
    className
}: EmptyListProps) {
    return (
        <EmptyState
            title={`No ${type} yet`}
            description={`You haven't created any ${type} yet. Get started by creating your first one!`}
            icon="folder"
            action={onCreateNew ? {
                label: `Create ${type.slice(0, -1)}`,
                onClick: onCreateNew,
                variant: "gradient"
            } : undefined}
            className={className}
        />
    )
}
