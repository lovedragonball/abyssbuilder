'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { skeletonPulse } from '@/lib/animations';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'bg-muted';
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], className)}
      variants={skeletonPulse}
      initial="initial"
      animate="animate"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" variant="text" />
      <Skeleton className="h-4 w-1/2" variant="text" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function SkeletonModCard() {
  return (
    <div className="aspect-square rounded-md border">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export function SkeletonBuildDetail() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-96 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
