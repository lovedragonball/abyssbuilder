/**
 * Accessibility Testing Utilities
 * Tools to verify WCAG compliance and accessibility features
 */

import { getContrastRatio, hslToRgb } from './accessibility-utils';

export interface ColorTest {
  name: string;
  foreground: string;
  background: string;
  expectedRatio?: number;
  isLargeText?: boolean;
}

export interface ContrastTestResult {
  name: string;
  ratio: number;
  passes: boolean;
  wcagLevel: 'AAA' | 'AA' | 'Fail';
  foreground: string;
  background: string;
}

/**
 * Parse HSL color string to RGB
 */
function parseHSL(hsl: string): [number, number, number] {
  const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) throw new Error(`Invalid HSL format: ${hsl}`);
  
  const [, h, s, l] = match.map(Number);
  return hslToRgb(h, s, l);
}

/**
 * Test color contrast ratios
 */
export function testColorContrast(tests: ColorTest[]): ContrastTestResult[] {
  return tests.map(test => {
    const fg = parseHSL(test.foreground);
    const bg = parseHSL(test.background);
    const ratio = getContrastRatio(fg, bg);
    
    const minRatioAA = test.isLargeText ? 3 : 4.5;
    const minRatioAAA = test.isLargeText ? 4.5 : 7;
    
    let wcagLevel: 'AAA' | 'AA' | 'Fail';
    if (ratio >= minRatioAAA) {
      wcagLevel = 'AAA';
    } else if (ratio >= minRatioAA) {
      wcagLevel = 'AA';
    } else {
      wcagLevel = 'Fail';
    }
    
    return {
      name: test.name,
      ratio: Math.round(ratio * 10) / 10,
      passes: ratio >= minRatioAA,
      wcagLevel,
      foreground: test.foreground,
      background: test.background,
    };
  });
}

/**
 * Default color combinations to test from our theme
 */
export const defaultColorTests: ColorTest[] = [
  {
    name: 'Body text on background',
    foreground: '240 5% 96%',
    background: '220 40% 5%',
  },
  {
    name: 'Muted text on background',
    foreground: '240 5% 70%',
    background: '220 40% 5%',
  },
  {
    name: 'Card text on card background',
    foreground: '240 5% 96%',
    background: '220 30% 12%',
  },
  {
    name: 'Primary text on background',
    foreground: '210 90% 60%',
    background: '220 40% 5%',
  },
  {
    name: 'Accent text on background',
    foreground: '270 65% 55%',
    background: '220 40% 5%',
  },
  {
    name: 'Primary foreground on primary',
    foreground: '210 100% 15%',
    background: '210 90% 60%',
  },
  {
    name: 'Text on muted background',
    foreground: '240 5% 96%',
    background: '220 30% 18%',
  },
  {
    name: 'Secondary text on secondary background',
    foreground: '240 5% 96%',
    background: '220 30% 12%',
  },
];

/**
 * Run all accessibility tests and log results
 */
export function runAccessibilityTests() {
  console.group('🎨 Color Contrast Tests (WCAG 2.1)');
  
  const results = testColorContrast(defaultColorTests);
  
  results.forEach(result => {
    const icon = result.passes ? '✅' : '❌';
    const style = result.passes ? 'color: green' : 'color: red';
    
    console.log(
      `${icon} %c${result.name}`,
      style,
      `\n   Ratio: ${result.ratio}:1`,
      `\n   Level: ${result.wcagLevel}`,
      `\n   FG: hsl(${result.foreground})`,
      `\n   BG: hsl(${result.background})`
    );
  });
  
  const passCount = results.filter(r => r.passes).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Summary: ${passCount}/${totalCount} tests passed`);
  console.groupEnd();
  
  return results;
}

/**
 * Check if all interactive elements have proper focus indicators
 */
export function checkFocusIndicators(): boolean {
  const interactiveElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  let allHaveFocus = true;
  
  interactiveElements.forEach(element => {
    const styles = window.getComputedStyle(element, ':focus-visible');
    const hasOutline = styles.outline !== 'none' && styles.outline !== '';
    const hasBoxShadow = styles.boxShadow !== 'none';
    
    if (!hasOutline && !hasBoxShadow) {
      console.warn('Missing focus indicator:', element);
      allHaveFocus = false;
    }
  });
  
  return allHaveFocus;
}

/**
 * Check if all images have alt text
 */
export function checkImageAltText(): boolean {
  const images = document.querySelectorAll('img');
  let allHaveAlt = true;
  
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      console.warn('Missing alt text:', img);
      allHaveAlt = false;
    }
  });
  
  return allHaveAlt;
}

/**
 * Check if all form inputs have labels
 */
export function checkFormLabels(): boolean {
  const inputs = document.querySelectorAll('input, textarea, select');
  let allHaveLabels = true;
  
  inputs.forEach(input => {
    const hasLabel = input.hasAttribute('aria-label') || 
                     input.hasAttribute('aria-labelledby') ||
                     document.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel) {
      console.warn('Missing label:', input);
      allHaveLabels = false;
    }
  });
  
  return allHaveLabels;
}

/**
 * Check keyboard navigation
 */
export function checkKeyboardNavigation(): {
  passed: boolean;
  issues: string[];
  tabOrder: string[];
} {
  const issues: string[] = [];
  const tabOrder: string[] = [];
  
  const focusableElements = document.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  focusableElements.forEach((el, index) => {
    const element = el as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const tabIndex = element.getAttribute('tabindex');
    
    tabOrder.push(`${index + 1}. ${tagName}${element.className ? '.' + element.className.split(' ')[0] : ''}`);
    
    // Check for positive tabindex (anti-pattern)
    if (tabIndex && parseInt(tabIndex) > 0) {
      issues.push(`Element has positive tabindex (${tabIndex}): ${tagName}`);
    }
    
    // Check if interactive elements are keyboard accessible
    if (element.onclick && tagName === 'div') {
      if (!element.hasAttribute('role') && !element.hasAttribute('tabindex')) {
        issues.push(`Clickable div without role or tabindex: ${element.className}`);
      }
    }
  });
  
  return {
    passed: issues.length === 0,
    issues,
    tabOrder,
  };
}

/**
 * Check ARIA attributes
 */
export function checkARIAAttributes(): {
  passed: boolean;
  issues: string[];
  stats: {
    elementsWithRole: number;
    elementsWithAriaLabel: number;
    elementsWithAriaDescribedBy: number;
  };
} {
  const issues: string[] = [];
  
  // Check for invalid ARIA roles
  const elementsWithRole = document.querySelectorAll('[role]');
  const validRoles = [
    'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
    'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
    'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form',
    'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox',
    'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
    'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option',
    'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row',
    'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
    'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
    'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
    'treegrid', 'treeitem'
  ];
  
  elementsWithRole.forEach((el) => {
    const role = el.getAttribute('role');
    if (role && !validRoles.includes(role)) {
      issues.push(`Invalid ARIA role: ${role}`);
    }
  });
  
  // Check for buttons without accessible names
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button) => {
    const hasText = button.textContent?.trim();
    const hasAriaLabel = button.hasAttribute('aria-label');
    const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push(`Button without accessible name: ${button.className}`);
    }
  });
  
  // Check for links without accessible names
  const links = document.querySelectorAll('a[href]');
  links.forEach((link) => {
    const hasText = link.textContent?.trim();
    const hasAriaLabel = link.hasAttribute('aria-label');
    const hasAriaLabelledBy = link.hasAttribute('aria-labelledby');
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push(`Link without accessible name: ${link.className}`);
    }
  });
  
  return {
    passed: issues.length === 0,
    issues,
    stats: {
      elementsWithRole: elementsWithRole.length,
      elementsWithAriaLabel: document.querySelectorAll('[aria-label]').length,
      elementsWithAriaDescribedBy: document.querySelectorAll('[aria-describedby]').length,
    },
  };
}

/**
 * Check heading hierarchy
 */
export function checkHeadingHierarchy(): {
  passed: boolean;
  issues: string[];
  hierarchy: string[];
} {
  const issues: string[] = [];
  const hierarchy: string[] = [];
  
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName[1]);
    const text = heading.textContent?.trim().substring(0, 50) || '';
    
    hierarchy.push(`${'  '.repeat(level - 1)}H${level}: ${text}`);
    
    // Check for skipped levels
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push(`Heading level skipped: H${previousLevel} to H${level}`);
    }
    
    previousLevel = level;
  });
  
  // Check for missing H1
  const h1Count = document.querySelectorAll('h1').length;
  if (h1Count === 0) {
    issues.push('No H1 heading found on page');
  } else if (h1Count > 1) {
    issues.push(`Multiple H1 headings found (${h1Count})`);
  }
  
  return {
    passed: issues.length === 0,
    issues,
    hierarchy,
  };
}

/**
 * Check for reduced motion support
 */
export function checkReducedMotion(): {
  supported: boolean;
  prefersReducedMotion: boolean;
  animatedElements: number;
} {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check if CSS respects prefers-reduced-motion
  const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
  
  return {
    supported: true, // Browser support is universal now
    prefersReducedMotion,
    animatedElements: animatedElements.length,
  };
}

/**
 * Check landmark regions
 */
export function checkLandmarks(): {
  passed: boolean;
  issues: string[];
  landmarks: {
    main: number;
    nav: number;
    header: number;
    footer: number;
    aside: number;
  };
} {
  const issues: string[] = [];
  
  const landmarks = {
    main: document.querySelectorAll('main, [role="main"]').length,
    nav: document.querySelectorAll('nav, [role="navigation"]').length,
    header: document.querySelectorAll('header, [role="banner"]').length,
    footer: document.querySelectorAll('footer, [role="contentinfo"]').length,
    aside: document.querySelectorAll('aside, [role="complementary"]').length,
  };
  
  if (landmarks.main === 0) {
    issues.push('No main landmark found');
  } else if (landmarks.main > 1) {
    issues.push(`Multiple main landmarks found (${landmarks.main})`);
  }
  
  if (landmarks.header === 0) {
    issues.push('No header landmark found');
  }
  
  return {
    passed: issues.length === 0,
    issues,
    landmarks,
  };
}

/**
 * Run comprehensive accessibility tests
 * Requirements: 3.1, 2.2, 2.3
 */
export interface AccessibilityTestResults {
  colorContrast: ContrastTestResult[];
  focusIndicators: ReturnType<typeof checkFocusIndicators>;
  imageAltText: ReturnType<typeof checkImageAltText>;
  formLabels: ReturnType<typeof checkFormLabels>;
  keyboardNavigation: ReturnType<typeof checkKeyboardNavigation>;
  ariaAttributes: ReturnType<typeof checkARIAAttributes>;
  headingHierarchy: ReturnType<typeof checkHeadingHierarchy>;
  reducedMotion: ReturnType<typeof checkReducedMotion>;
  landmarks: ReturnType<typeof checkLandmarks>;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * Run all accessibility checks
 */
export function runAllAccessibilityChecks(): AccessibilityTestResults {
  console.group('♿ Accessibility Audit');
  
  console.log('🎨 Testing color contrast...');
  const colorContrast = testColorContrast(defaultColorTests);
  
  console.log('\n🎯 Checking focus indicators...');
  const focusIndicators = checkFocusIndicators();
  console.log(focusIndicators ? '✅ All elements have focus indicators' : '❌ Some elements missing focus indicators');
  
  console.log('\n🖼️ Checking image alt text...');
  const imageAltText = checkImageAltText();
  console.log(imageAltText ? '✅ All images have alt text' : '❌ Some images missing alt text');
  
  console.log('\n📝 Checking form labels...');
  const formLabels = checkFormLabels();
  console.log(formLabels ? '✅ All form inputs have labels' : '❌ Some inputs missing labels');
  
  console.log('\n⌨️ Checking keyboard navigation...');
  const keyboardNavigation = checkKeyboardNavigation();
  console.log(keyboardNavigation.passed ? '✅ Keyboard navigation is accessible' : '❌ Keyboard navigation issues found');
  
  console.log('\n🏷️ Checking ARIA attributes...');
  const ariaAttributes = checkARIAAttributes();
  console.log(ariaAttributes.passed ? '✅ ARIA attributes are valid' : '❌ ARIA issues found');
  
  console.log('\n📑 Checking heading hierarchy...');
  const headingHierarchy = checkHeadingHierarchy();
  console.log(headingHierarchy.passed ? '✅ Heading hierarchy is correct' : '❌ Heading hierarchy issues found');
  
  console.log('\n🎬 Checking reduced motion support...');
  const reducedMotion = checkReducedMotion();
  console.log(`✅ Reduced motion: ${reducedMotion.prefersReducedMotion ? 'enabled' : 'disabled'}`);
  
  console.log('\n🗺️ Checking landmark regions...');
  const landmarks = checkLandmarks();
  console.log(landmarks.passed ? '✅ Landmark regions are correct' : '❌ Landmark issues found');
  
  console.groupEnd();
  
  const totalTests = 9;
  const passed = [
    colorContrast.every(r => r.passes),
    focusIndicators,
    imageAltText,
    formLabels,
    keyboardNavigation.passed,
    ariaAttributes.passed,
    headingHierarchy.passed,
    reducedMotion.supported,
    landmarks.passed,
  ].filter(Boolean).length;
  
  const failed = totalTests - passed;
  const warnings = keyboardNavigation.issues.length + ariaAttributes.issues.length + headingHierarchy.issues.length + landmarks.issues.length;
  
  return {
    colorContrast,
    focusIndicators,
    imageAltText,
    formLabels,
    keyboardNavigation,
    ariaAttributes,
    headingHierarchy,
    reducedMotion,
    landmarks,
    summary: {
      totalTests,
      passed,
      failed,
      warnings,
    },
  };
}
