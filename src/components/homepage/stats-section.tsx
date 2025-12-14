'use client';

import React, { useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
}

export interface StatsSectionProps {
  stats: StatItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });

    return unsubscribe;
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className={cn(
        'relative p-4 sm:p-6 rounded-xl',
        'glass-card',
        'border border-white/10',
        'hover:border-white/20',
        'transition-all duration-300',
        'group',
        'active:scale-95'
      )}
    >
      {/* Gradient glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon with pulse animation */}
        {/* Icon - removed infinite pulse animation for GPU performance */}
        <div
          className="mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-primary/10"
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>

        {/* Stat value with gradient text */}
        <div className="mb-1.5 sm:mb-2">
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
          </span>
        </div>

        {/* Label */}
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {stat.label}
        </p>

        {/* Trend indicator (optional) */}
        {stat.trend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={cn(
              'mt-2 text-xs font-medium',
              stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
            )}
          >
            {stat.trend === 'up' ? '↑' : '↓'} Trending
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function StatsSection({
  stats,
  title = 'By the Numbers',
  subtitle = 'Join thousands of players building their perfect characters',
  className,
}: StatsSectionProps) {
  return (
    <section className={cn('relative py-12 sm:py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
            <span className="gradient-text">{title}</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            {subtitle}
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>

      {/* Background decoration - reduced size for GPU performance */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-2xl" />
      </div>
    </section>
  );
}
