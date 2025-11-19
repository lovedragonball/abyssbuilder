'use client';

import { motion } from 'framer-motion';
import { Search, X, Filter, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalItems: number;
  filteredItems: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  totalItems,
  filteredItems,
  onExpandAll,
  onCollapseAll,
}: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search materials, weapons, or items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-slate-800 border-slate-600 focus:border-purple-500 text-white placeholder:text-slate-400"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3">
          {/* Stats Counter */}
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">
              {filteredItems}
            </span>
            <span className="text-sm text-slate-400">
              / {totalItems}
            </span>
          </motion.div>

          {/* Expand/Collapse Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onExpandAll}
              variant="outline"
              size="sm"
              className="border-slate-600 hover:border-purple-500"
            >
              Expand All
            </Button>
            <Button
              onClick={onCollapseAll}
              variant="outline"
              size="sm"
              className="border-slate-600 hover:border-purple-500"
            >
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Active Search Indicator */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 flex items-center gap-2"
        >
          <Filter className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-slate-300">
            Searching for:
          </span>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/50">
            "{searchQuery}"
          </Badge>
          <span className="text-sm text-slate-400">
            ({filteredItems} results)
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
