'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export default function MobileMenu({ isOpen, onClose, items }: MobileMenuProps) {
  const pathname = usePathname();
  const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Close menu with Escape key
  useKeyboardShortcut('Escape', onClose, { enabled: isOpen });

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setTimeout(() => {
      setRipplePosition(null);
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200 
            }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Menu</h2>
                <button
                  onClick={handleCloseClick}
                  className="relative p-3 rounded-full hover:bg-background-elevated transition-colors overflow-hidden"
                  aria-label="Close menu"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <X className="w-6 h-6 text-foreground relative z-10" />
                  
                  {/* Ripple effect */}
                  {ripplePosition && (
                    <motion.span
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute rounded-full bg-primary/30"
                      style={{
                        left: ripplePosition.x,
                        top: ripplePosition.y,
                        width: '20px',
                        height: '20px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <motion.ul 
                  className="space-y-2"
                  initial="closed"
                  animate="open"
                  variants={{
                    open: {
                      transition: {
                        staggerChildren: 0.07,
                        delayChildren: 0.1,
                      },
                    },
                    closed: {
                      transition: {
                        staggerChildren: 0.05,
                        staggerDirection: -1,
                      },
                    },
                  }}
                >
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <motion.li
                        key={item.href}
                        variants={{
                          open: {
                            y: 0,
                            opacity: 1,
                            transition: {
                              y: { stiffness: 1000, velocity: -100 },
                            },
                          },
                          closed: {
                            y: 50,
                            opacity: 0,
                            transition: {
                              y: { stiffness: 1000 },
                            },
                          },
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                            isActive
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'hover:bg-background-elevated text-muted-foreground hover:text-foreground'
                          }`}
                          style={{ minHeight: '44px' }}
                        >
                          <Icon 
                            className={`w-6 h-6 transition-all duration-300 ${
                              isActive 
                                ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                                : ''
                            }`}
                          />
                          <span className="text-base font-medium">{item.label}</span>
                          
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="ml-auto w-2 h-2 rounded-full bg-primary shadow-glow-sm"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  AbyssBuilder © 2025
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
