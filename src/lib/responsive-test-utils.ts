/**
 * Responsive Testing Utilities
 * 
 * Utilities for testing responsive behavior across different device sizes
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

export const BREAKPOINTS = {
  mobile: {
    small: 320,
    medium: 375,
    large: 414,
  },
  tablet: {
    small: 768,
    large: 1024,
  },
  desktop: {
    small: 1280,
    large: 1920,
  },
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type DeviceSize = 'small' | 'medium' | 'large';

export interface ViewportConfig {
  width: number;
  height: number;
  deviceType: DeviceType;
  deviceSize: DeviceSize;
  name: string;
}

export const VIEWPORT_CONFIGS: ViewportConfig[] = [
  // Mobile viewports
  { width: 320, height: 568, deviceType: 'mobile', deviceSize: 'small', name: 'iPhone SE' },
  { width: 375, height: 667, deviceType: 'mobile', deviceSize: 'medium', name: 'iPhone 8' },
  { width: 414, height: 896, deviceType: 'mobile', deviceSize: 'large', name: 'iPhone 11 Pro Max' },
  
  // Tablet viewports
  { width: 768, height: 1024, deviceType: 'tablet', deviceSize: 'small', name: 'iPad' },
  { width: 1024, height: 1366, deviceType: 'tablet', deviceSize: 'large', name: 'iPad Pro' },
  
  // Desktop viewports
  { width: 1280, height: 720, deviceType: 'desktop', deviceSize: 'small', name: 'Desktop HD' },
  { width: 1920, height: 1080, deviceType: 'desktop', deviceSize: 'large', name: 'Desktop Full HD' },
];

/**
 * Check if an element meets minimum touch target size (44x44px)
 */
export function checkTouchTargetSize(element: HTMLElement): {
  valid: boolean;
  width: number;
  height: number;
  message: string;
} {
  const rect = element.getBoundingClientRect();
  const minSize = 44;
  const valid = rect.width >= minSize && rect.height >= minSize;
  
  return {
    valid,
    width: rect.width,
    height: rect.height,
    message: valid 
      ? `Touch target size is valid (${rect.width}x${rect.height}px)`
      : `Touch target too small (${rect.width}x${rect.height}px). Minimum is ${minSize}x${minSize}px`,
  };
}

/**
 * Check if text is readable at current viewport
 */
export function checkTextReadability(element: HTMLElement): {
  valid: boolean;
  fontSize: number;
  lineHeight: number;
  message: string;
} {
  const styles = window.getComputedStyle(element);
  const fontSize = parseFloat(styles.fontSize);
  const lineHeight = parseFloat(styles.lineHeight);
  const minFontSize = 16; // Minimum for body text
  
  const valid = fontSize >= minFontSize;
  
  return {
    valid,
    fontSize,
    lineHeight,
    message: valid
      ? `Text is readable (${fontSize}px)`
      : `Text too small (${fontSize}px). Minimum is ${minFontSize}px`,
  };
}

/**
 * Check if element is visible in viewport
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Check for horizontal overflow
 */
export function checkHorizontalOverflow(): {
  hasOverflow: boolean;
  elements: HTMLElement[];
  message: string;
} {
  const bodyWidth = document.body.scrollWidth;
  const viewportWidth = window.innerWidth;
  const hasOverflow = bodyWidth > viewportWidth;
  
  const overflowingElements: HTMLElement[] = [];
  
  if (hasOverflow) {
    document.querySelectorAll('*').forEach((el) => {
      const element = el as HTMLElement;
      const rect = element.getBoundingClientRect();
      if (rect.right > viewportWidth) {
        overflowingElements.push(element);
      }
    });
  }
  
  return {
    hasOverflow,
    elements: overflowingElements,
    message: hasOverflow
      ? `Horizontal overflow detected (${overflowingElements.length} elements)`
      : 'No horizontal overflow',
  };
}

/**
 * Test responsive images
 */
export function checkResponsiveImages(): {
  total: number;
  withSrcset: number;
  withLazyLoad: number;
  issues: string[];
} {
  const images = document.querySelectorAll('img');
  let withSrcset = 0;
  let withLazyLoad = 0;
  const issues: string[] = [];
  
  images.forEach((img, index) => {
    if (img.srcset) withSrcset++;
    if (img.loading === 'lazy') withLazyLoad++;
    
    if (!img.alt) {
      issues.push(`Image ${index + 1} missing alt text`);
    }
    
    if (!img.width || !img.height) {
      issues.push(`Image ${index + 1} missing width/height attributes`);
    }
  });
  
  return {
    total: images.length,
    withSrcset,
    withLazyLoad,
    issues,
  };
}

/**
 * Run comprehensive responsive tests
 */
export function runResponsiveTests(): {
  viewport: {
    width: number;
    height: number;
  };
  touchTargets: ReturnType<typeof checkTouchTargetSize>[];
  textReadability: ReturnType<typeof checkTextReadability>[];
  overflow: ReturnType<typeof checkHorizontalOverflow>;
  images: ReturnType<typeof checkResponsiveImages>;
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
} {
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );
  
  const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
  
  const touchTargets = Array.from(interactiveElements).map((el) =>
    checkTouchTargetSize(el as HTMLElement)
  );
  
  const textReadability = Array.from(textElements)
    .slice(0, 20) // Sample first 20 text elements
    .map((el) => checkTextReadability(el as HTMLElement));
  
  const overflow = checkHorizontalOverflow();
  const images = checkResponsiveImages();
  
  const passed = touchTargets.filter((t) => t.valid).length +
    textReadability.filter((t) => t.valid).length +
    (overflow.hasOverflow ? 0 : 1);
  
  const failed = touchTargets.filter((t) => !t.valid).length +
    textReadability.filter((t) => !t.valid).length +
    (overflow.hasOverflow ? 1 : 0);
  
  const warnings = images.issues.length;
  
  return {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    touchTargets,
    textReadability,
    overflow,
    images,
    summary: {
      passed,
      failed,
      warnings,
    },
  };
}
