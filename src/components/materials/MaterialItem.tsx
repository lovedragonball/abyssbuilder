'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Pin, PinOff } from 'lucide-react';

interface MaterialItemProps {
  name: string;
  category: string;
  displayName: string;
  imagePath: string;
  craftable: boolean;
  pinned: boolean;
  onClick: () => void;
  onTogglePin?: () => void;
  index: number;
}

export function MaterialItem({
  name,
  category,
  displayName,
  imagePath,
  craftable,
  pinned,
  onClick,
  onTogglePin,
  index,
}: MaterialItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, type: 'spring', stiffness: 300 }}
      className="relative"
    >
      <motion.button
        onClick={onClick}
        className="w-full bg-slate-800/50 border-2 border-slate-600 rounded-lg p-3 transition-all group cursor-pointer"
        whileHover={{ 
          scale: 1.05, 
          borderColor: 'rgb(168, 85, 247)',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="aspect-square relative bg-slate-900 rounded overflow-hidden mb-2">
          <Image
            src={imagePath}
            alt={displayName}
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
          />
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-xs text-slate-300 text-center line-clamp-2 group-hover:text-purple-300 transition-colors">
          {displayName}
        </p>
      </motion.button>

      {craftable && onTogglePin && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            pinned
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-slate-800/80 text-slate-400 hover:bg-purple-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.2, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          title={pinned ? 'Unpin' : 'Pin'}
        >
          {pinned ? (
            <Pin className="w-3.5 h-3.5" />
          ) : (
            <PinOff className="w-3.5 h-3.5" />
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
