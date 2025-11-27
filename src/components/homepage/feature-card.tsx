'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  accentColor?: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  accentColor = 'hsl(210, 90%, 60%)',
  className,
}: FeatureCardProps) {
  return (
    <Link href={href} className="block group">
      <motion.div
        className={cn(
          'relative h-full p-4 sm:p-6 rounded-xl',
          'glass-card',
          'border border-white/10',
          'transition-all duration-300',
          'hover:border-white/20',
          'active:scale-95',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{
          y: -8,
          transition: { duration: 0.3, ease: 'easeOut' },
        }}
        style={{
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
        }}
      >
        {/* Border glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${accentColor}40, inset 0 0 20px ${accentColor}20`,
          }}
        />

        {/* Icon with gradient background */}
        <motion.div
          className="relative mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}80 100%)`,
            boxShadow: `0 4px 12px ${accentColor}40`,
          }}
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.3, ease: 'easeOut' },
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{
              x: '100%',
              transition: { duration: 0.6, ease: 'easeInOut' },
            }}
          />
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
            {description}
          </p>

          {/* Arrow indicator */}
          <div className="flex items-center text-xs sm:text-sm font-medium text-primary/80 group-hover:text-primary transition-colors duration-300">
            <span>Learn more</span>
            <ArrowRight className="ml-1.5 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Hover shadow enhancement */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          }}
        />
      </motion.div>
    </Link>
  );
}
