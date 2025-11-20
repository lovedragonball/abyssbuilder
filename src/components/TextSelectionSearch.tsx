'use client';

import { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Calculates the optimal position for the floating button relative to selected text.
 *
 * Strategy:
 * 1. Get the bounding rectangle of the selected text using Selection API
 * 2. Position the button at the top-right of the selection
 * 3. Add small offset (8px right, 4px up) for visual spacing
 * 4. Convert viewport coordinates to document coordinates so absolute positioning stays aligned while scrolling
 *
 * @returns {x, y} coordinates in document space, or null if no valid selection
 */
const getSelectionPosition = (): { x: number; y: number } | null => {
  const selection = window.getSelection();
  
  // Check if we have a valid selection
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  // Get the range (the actual selected content)
  const range = selection.getRangeAt(0);
  
  // getBoundingClientRect() returns DOMRect with viewport-relative coordinates
  const rect = range.getBoundingClientRect();
  
  // Check if selection is visible in viewport
  if (rect.width === 0 && rect.height === 0) {
    return null;
  }

  const scrollX = window.scrollX ?? window.pageXOffset;
  const scrollY = window.scrollY ?? window.pageYOffset;

  // Position button at top-right of selection with small offset
  // rect.right/top = viewport coordinates, add scroll to convert to document coordinates
  return {
    x: rect.right + scrollX + 8,  // 8px to the right of selection
    y: rect.top + scrollY - 4,    // 4px above selection
  };
};

export function TextSelectionSearch() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const pos = getSelectionPosition();
        if (pos) {
          setPosition(pos);
          setSelectedText(text);
        }
      } else {
        if (!isHoveringButton) {
          setPosition(null);
          setSelectedText('');
        }
      }
    };

    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(updatePosition, 10);
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      // Don't hide if clicking on the button itself
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }
      
      // Don't hide immediately if hovering button
      if (isHoveringButton) {
        return;
      }
      
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // Hide button when clicking anywhere else
      hideTimeoutRef.current = setTimeout(() => {
        if (!isHoveringButton) {
          setPosition(null);
          setSelectedText('');
        }
      }, 100);
    };
    
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      // If selection is cleared, hide button after delay
      if (!text || text.length === 0) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        
        hideTimeoutRef.current = setTimeout(() => {
          if (!isHoveringButton) {
            setPosition(null);
            setSelectedText('');
          }
        }, 150);
      }
    };
    
    // Listen for selection events
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isHoveringButton]);

  const handleSearch = () => {
    if (selectedText) {
      // Find search input on the page
      const searchInputs = document.querySelectorAll<HTMLInputElement>(
        'input[type="text"], input[type="search"], input[placeholder*="search" i], input[placeholder*="ค้นหา" i]'
      );
      
      let searchInput: HTMLInputElement | null = null;
      
      // Try to find the most relevant search input
      for (const input of Array.from(searchInputs)) {
        const placeholder = input.placeholder?.toLowerCase() || '';
        if (placeholder.includes('search') || placeholder.includes('ค้นหา')) {
          searchInput = input;
          break;
        }
      }
      
      // If no search-specific input found, use the first text input
      if (!searchInput && searchInputs.length > 0) {
        searchInput = searchInputs[0];
      }
      
      if (searchInput) {
        // Set the value
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(searchInput, selectedText);
        } else {
          searchInput.value = selectedText;
        }
        
        // Trigger React events
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
        
        const changeEvent = new Event('change', { bubbles: true });
        searchInput.dispatchEvent(changeEvent);
        
        // Focus the input
        searchInput.focus();
        
        // Scroll into view if needed
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Don't clear selection immediately - let it fade naturally
      setPosition(null);
      setSelectedText('');
    }
  };

  if (!position) return null;

  return (
    <div
      ref={buttonRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10000,
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsHoveringButton(true)}
      onMouseLeave={() => setIsHoveringButton(false)}
    >
      <Button
        size="sm"
        onClick={handleSearch}
        className="h-8 gap-2 shadow-lg bg-primary hover:bg-primary/90 animate-in fade-in zoom-in-95 duration-200"
      >
        <Search className="w-3.5 h-3.5" />
        Search
      </Button>
    </div>
  );
}
