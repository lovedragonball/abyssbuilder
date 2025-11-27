/**
 * Animation Testing Utilities
 * 
 * Utilities for testing animations and interactions
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

export interface FrameRateResult {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frames: number;
  duration: number;
  droppedFrames: number;
  performance: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface AnimationTestResult {
  element: string;
  animationName: string;
  duration: number;
  fps: FrameRateResult;
  passed: boolean;
  issues: string[];
}

export interface InteractionTestResult {
  element: string;
  interactionType: 'hover' | 'click' | 'focus';
  hasVisualFeedback: boolean;
  responseTime: number;
  passed: boolean;
  issues: string[];
}

/**
 * Measure frame rate during animation
 */
export async function measureFrameRate(
  callback: () => void,
  duration: number = 1000
): Promise<FrameRateResult> {
  const frames: number[] = [];
  let lastTime = performance.now();
  let animationId: number;
  let startTime = performance.now();

  return new Promise((resolve) => {
    const measureFrame = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      const fps = 1000 / delta;
      frames.push(fps);
      lastTime = currentTime;

      if (currentTime - startTime < duration) {
        animationId = requestAnimationFrame(measureFrame);
      } else {
        cancelAnimationFrame(animationId);

        const averageFPS = frames.reduce((a, b) => a + b, 0) / frames.length;
        const minFPS = Math.min(...frames);
        const maxFPS = Math.max(...frames);
        const droppedFrames = frames.filter((fps) => fps < 55).length;

        let performance: FrameRateResult['performance'];
        if (averageFPS >= 58) performance = 'excellent';
        else if (averageFPS >= 50) performance = 'good';
        else if (averageFPS >= 40) performance = 'fair';
        else performance = 'poor';

        resolve({
          averageFPS,
          minFPS,
          maxFPS,
          frames: frames.length,
          duration: currentTime - startTime,
          droppedFrames,
          performance,
        });
      }
    };

    callback();
    animationId = requestAnimationFrame(measureFrame);
  });
}

/**
 * Test if element has hover state
 */
export function testHoverState(element: HTMLElement): {
  hasHoverState: boolean;
  properties: string[];
} {
  const beforeStyles = window.getComputedStyle(element);
  const beforeProps = {
    backgroundColor: beforeStyles.backgroundColor,
    color: beforeStyles.color,
    transform: beforeStyles.transform,
    opacity: beforeStyles.opacity,
    boxShadow: beforeStyles.boxShadow,
  };

  // Simulate hover
  element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

  // Wait a frame
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const afterStyles = window.getComputedStyle(element);
      const changedProperties: string[] = [];

      if (afterStyles.backgroundColor !== beforeProps.backgroundColor) {
        changedProperties.push('backgroundColor');
      }
      if (afterStyles.color !== beforeProps.color) {
        changedProperties.push('color');
      }
      if (afterStyles.transform !== beforeProps.transform) {
        changedProperties.push('transform');
      }
      if (afterStyles.opacity !== beforeProps.opacity) {
        changedProperties.push('opacity');
      }
      if (afterStyles.boxShadow !== beforeProps.boxShadow) {
        changedProperties.push('boxShadow');
      }

      // Clean up
      element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      resolve({
        hasHoverState: changedProperties.length > 0,
        properties: changedProperties,
      });
    });
  }) as any;
}

/**
 * Test click feedback
 */
export async function testClickFeedback(element: HTMLElement): Promise<{
  hasFeedback: boolean;
  responseTime: number;
  feedbackType: string[];
}> {
  const startTime = performance.now();
  const feedbackTypes: string[] = [];

  const beforeStyles = window.getComputedStyle(element);

  // Simulate click
  element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const afterStyles = window.getComputedStyle(element);
      const responseTime = performance.now() - startTime;

      if (afterStyles.transform !== beforeStyles.transform) {
        feedbackTypes.push('transform');
      }
      if (afterStyles.opacity !== beforeStyles.opacity) {
        feedbackTypes.push('opacity');
      }
      if (afterStyles.boxShadow !== beforeStyles.boxShadow) {
        feedbackTypes.push('shadow');
      }

      // Check for ripple effect (common pattern)
      const hasRipple = element.querySelector('[class*="ripple"]') !== null;
      if (hasRipple) {
        feedbackTypes.push('ripple');
      }

      // Clean up
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      resolve({
        hasFeedback: feedbackTypes.length > 0,
        responseTime,
        feedbackType: feedbackTypes,
      });
    });
  });
}

/**
 * Test loading states
 */
export function testLoadingStates(): {
  skeletonLoaders: number;
  progressIndicators: number;
  spinners: number;
  total: number;
} {
  const skeletonLoaders = document.querySelectorAll(
    '[class*="skeleton"], [data-skeleton]'
  ).length;

  const progressIndicators = document.querySelectorAll(
    '[role="progressbar"], progress, [class*="progress"]'
  ).length;

  const spinners = document.querySelectorAll(
    '[class*="spinner"], [class*="loading"]'
  ).length;

  return {
    skeletonLoaders,
    progressIndicators,
    spinners,
    total: skeletonLoaders + progressIndicators + spinners,
  };
}

/**
 * Test page transitions
 */
export function testPageTransitions(): {
  hasTransitions: boolean;
  transitionElements: number;
  transitionProperties: string[];
} {
  const elementsWithTransition = document.querySelectorAll('[class*="transition"]');
  const transitionProperties = new Set<string>();

  elementsWithTransition.forEach((el) => {
    const styles = window.getComputedStyle(el);
    const transition = styles.transition;
    if (transition && transition !== 'none') {
      // Parse transition properties
      const props = transition.split(',').map((t) => t.trim().split(' ')[0]);
      props.forEach((prop) => transitionProperties.add(prop));
    }
  });

  return {
    hasTransitions: elementsWithTransition.length > 0,
    transitionElements: elementsWithTransition.length,
    transitionProperties: Array.from(transitionProperties),
  };
}

/**
 * Test animation performance
 */
export async function testAnimationPerformance(
  selector: string
): Promise<AnimationTestResult> {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) {
    return {
      element: selector,
      animationName: 'N/A',
      duration: 0,
      fps: {
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        frames: 0,
        duration: 0,
        droppedFrames: 0,
        performance: 'poor',
      },
      passed: false,
      issues: ['Element not found'],
    };
  }

  const styles = window.getComputedStyle(element);
  const animationName = styles.animationName;
  const animationDuration = parseFloat(styles.animationDuration) * 1000;

  const issues: string[] = [];

  // Check if animation uses GPU-accelerated properties
  const transform = styles.transform;
  const opacity = styles.opacity;

  if (transform === 'none' && opacity === '1') {
    issues.push('Animation may not use GPU-accelerated properties');
  }

  // Measure FPS
  const fps = await measureFrameRate(() => {
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = '';
    }, 10);
  }, Math.min(animationDuration || 1000, 2000));

  if (fps.averageFPS < 55) {
    issues.push(`Low FPS: ${fps.averageFPS.toFixed(1)}`);
  }

  if (fps.droppedFrames > fps.frames * 0.1) {
    issues.push(`High dropped frames: ${fps.droppedFrames}`);
  }

  return {
    element: selector,
    animationName,
    duration: animationDuration,
    fps,
    passed: fps.averageFPS >= 55 && issues.length === 0,
    issues,
  };
}

/**
 * Test all interactive elements
 */
export async function testAllInteractions(): Promise<{
  total: number;
  tested: number;
  passed: number;
  failed: number;
  results: InteractionTestResult[];
}> {
  const interactiveElements = document.querySelectorAll(
    'button, a, input, [role="button"], [tabindex="0"]'
  );

  const results: InteractionTestResult[] = [];

  for (const el of Array.from(interactiveElements).slice(0, 20)) {
    const element = el as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // Test hover
    const hoverResult = await testHoverState(element);

    // Test click
    const clickResult = await testClickFeedback(element);

    const issues: string[] = [];
    if (!hoverResult.hasHoverState) {
      issues.push('No hover state detected');
    }
    if (!clickResult.hasFeedback) {
      issues.push('No click feedback detected');
    }
    if (clickResult.responseTime > 100) {
      issues.push(`Slow response time: ${clickResult.responseTime.toFixed(0)}ms`);
    }

    results.push({
      element: `${tagName}${element.className ? '.' + element.className.split(' ')[0] : ''}`,
      interactionType: 'hover',
      hasVisualFeedback: hoverResult.hasHoverState,
      responseTime: 0,
      passed: hoverResult.hasHoverState,
      issues: hoverResult.hasHoverState ? [] : ['No hover state'],
    });

    results.push({
      element: `${tagName}${element.className ? '.' + element.className.split(' ')[0] : ''}`,
      interactionType: 'click',
      hasVisualFeedback: clickResult.hasFeedback,
      responseTime: clickResult.responseTime,
      passed: clickResult.hasFeedback && clickResult.responseTime <= 100,
      issues,
    });
  }

  return {
    total: interactiveElements.length,
    tested: results.length / 2,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    results,
  };
}

/**
 * Run comprehensive animation tests
 */
export async function runAnimationTests(): Promise<{
  frameRate: FrameRateResult;
  interactions: Awaited<ReturnType<typeof testAllInteractions>>;
  loadingStates: ReturnType<typeof testLoadingStates>;
  pageTransitions: ReturnType<typeof testPageTransitions>;
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}> {
  // Test overall frame rate
  const frameRate = await measureFrameRate(() => {
    // Trigger some animations
    document.body.style.transform = 'translateX(0)';
  }, 2000);

  const interactions = await testAllInteractions();
  const loadingStates = testLoadingStates();
  const pageTransitions = testPageTransitions();

  const passed =
    (frameRate.averageFPS >= 55 ? 1 : 0) +
    interactions.passed +
    (loadingStates.total > 0 ? 1 : 0) +
    (pageTransitions.hasTransitions ? 1 : 0);

  const failed =
    (frameRate.averageFPS < 55 ? 1 : 0) +
    interactions.failed +
    (loadingStates.total === 0 ? 1 : 0) +
    (!pageTransitions.hasTransitions ? 1 : 0);

  return {
    frameRate,
    interactions,
    loadingStates,
    pageTransitions,
    summary: {
      passed,
      failed,
      warnings: 0,
    },
  };
}
