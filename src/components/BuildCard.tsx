"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Eye, Edit, Trash2, Bookmark, BookmarkCheck } from "lucide-react"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface BuildCardProps {
  id: string
  buildName: string
  description?: string
  itemName: string
  itemImage: string
  itemType: string
  createdAt: string
  updatedAt: string
  stats?: Array<{ label: string; value: string | number; icon?: React.ReactNode }>
  isBookmarked?: boolean
  isSelected?: boolean
  showCheckbox?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onBookmark?: (id: string) => void
  onSelect?: (id: string, checked: boolean) => void
  className?: string
}

export const BuildCard = React.forwardRef<HTMLDivElement, BuildCardProps>(
  (
    {
      id,
      buildName,
      description,
      itemName,
      itemImage,
      itemType,
      createdAt,
      updatedAt,
      stats = [],
      isBookmarked = false,
      isSelected = false,
      showCheckbox = false,
      onView,
      onEdit,
      onDelete,
      onBookmark,
      onSelect,
      className,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [bookmarked, setBookmarked] = React.useState(isBookmarked)

    const handleBookmark = (e: React.MouseEvent) => {
      e.stopPropagation()
      setBookmarked(!bookmarked)
      onBookmark?.(id)
    }

    return (
      <TooltipProvider>
        <EnhancedCard
          ref={ref}
          variant="elevated"
          hoverEffect="lift"
          accentGradient
          className={cn(
            "group cursor-pointer transition-all overflow-visible hover:z-30",
            isSelected && "border-primary ring-2 ring-primary/20",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onView?.(id)}
        >
          {/* Character Thumbnail with Gradient Overlay */}
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            <Image
              src={itemImage}
              alt={itemName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-t-lg"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-t-lg" />

            {/* Checkbox for Selection */}
            {showCheckbox && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-50">
                <Checkbox
                  id={`build-checkbox-${id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    onSelect?.(id, checked as boolean)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/90 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary min-h-[44px] min-w-[44px] sm:min-h-[20px] sm:min-w-[20px] h-5 w-5"
                />
              </div>
            )}

            {/* Bookmark Button */}
            <motion.div
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50"
              initial={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-9 sm:w-9 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/10 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                onClick={handleBookmark}
              >
                <AnimatePresence mode="wait">
                  {bookmarked ? (
                    <motion.div
                      key="bookmarked"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BookmarkCheck className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="unbookmarked"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Bookmark className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Build Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <h3 className="text-white font-bold text-base sm:text-lg line-clamp-1 mb-1">
                {buildName}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm">{itemName}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-white/10 backdrop-blur-sm text-white/90 border border-white/20">
                {itemType}
              </span>
            </div>

            {/* Hover Reveal Actions */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-1 z-40 flex-nowrap rounded-t-lg pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 min-h-0 min-w-0 shrink-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 pointer-events-auto z-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          onView?.(id)
                        }}
                      >
                        <Eye className="h-4 w-4 text-white" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Build</p>
                    </TooltipContent>
                  </Tooltip>

                  {onEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 min-h-0 min-w-0 shrink-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 pointer-events-auto z-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(id)
                          }}
                        >
                          <Edit className="h-4 w-4 text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Build</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {onDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 min-h-0 min-w-0 shrink-0 rounded-full bg-white/10 hover:bg-destructive/80 border border-white/20 pointer-events-auto z-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Build</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card Content */}
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            {/* Description */}
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}

            {/* Stat Badges */}
            {stats.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {stats.map((stat, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors min-h-[32px]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {stat.icon && (
                          <span className="text-primary text-sm">{stat.icon}</span>
                        )}
                        <span className="text-xs font-medium text-primary">
                          {stat.value}
                        </span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{stat.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground space-y-0.5 pt-2 border-t border-border/50">
              <p>Created: {new Date(createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </EnhancedCard>
      </TooltipProvider>
    )
  }
)

BuildCard.displayName = "BuildCard"
