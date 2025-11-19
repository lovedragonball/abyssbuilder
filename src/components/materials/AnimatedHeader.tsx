'use client';

import { motion } from 'framer-motion';
import { Package, Pin, PinOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AnimatedHeaderProps {
  showPinnedSidebar: boolean;
  pinnedCount: number;
  onToggleSidebar: () => void;
}

export function AnimatedHeader({ showPinnedSidebar, pinnedCount, onToggleSidebar }: AnimatedHeaderProps) {
  return (
    <motion.div 
      className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-sm"
              animate={{
                scaleY: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold text-white tracking-widest uppercase bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Materials & Forging
              </h1>
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={onToggleSidebar}
              variant="outline"
              className="border-slate-600 hover:border-purple-500 transition-all"
            >
              {showPinnedSidebar ? (
                <PinOff className="w-4 h-4 mr-2" />
              ) : (
                <Pin className="w-4 h-4 mr-2" />
              )}
              <span>{showPinnedSidebar ? 'Hide' : 'Show'} Pinned</span>
              {pinnedCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <Badge className="ml-2 bg-purple-600">
                    {pinnedCount}
                  </Badge>
                </motion.div>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
