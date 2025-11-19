'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CategoryCardProps {
  category: string;
  icon: string;
  itemCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CategoryCard({ 
  category, 
  icon, 
  itemCount, 
  isExpanded, 
  onToggle, 
  children 
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
    >
      <motion.button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-purple-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
            )}
          </motion.div>
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
            {category}
          </h3>
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            {itemCount} items
          </Badge>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-slate-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
