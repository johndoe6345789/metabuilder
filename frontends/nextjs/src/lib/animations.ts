/**
 * Animation Utilities for Phase 5.3 - Animations & Transitions
 *
 * Provides animation classnames, durations, and timing functions
 * for consistent motion throughout the application.
 *
 * Key Features:
 * - Predefined animation durations (fast, normal, slow)
 * - CSS class names for common animations
 * - Motion detection (prefers-reduced-motion)
 * - Animation composition helpers
 */

/**
 * Animation duration presets
 */
export const ANIMATION_DURATIONS = {
  // Fast: Use for quick feedback (0.1-0.2s)
  fast: 100,
  fastMs: '0.1s',

  // Normal: Default for most animations (0.2-0.3s)
  normal: 200,
  normalMs: '0.2s',

  // Slow: Use for page transitions and major UX events (0.3-0.5s)
  slow: 300,
  slowMs: '0.3s',

  // Extra slow: Use for loading states and long operations (0.5-1s)
  extraSlow: 500,
  extraSlowMs: '0.5s',
} as const

/**
 * Timing functions for different animation types
 */
export const ANIMATION_TIMINGS = {
  // Linear: No acceleration
  linear: 'linear',

  // Ease-in: Starts slow, ends fast (for exits/collapses)
  easeIn: 'ease-in',

  // Ease-out: Starts fast, ends slow (for entrances/expands)
  easeOut: 'ease-out',

  // Ease-in-out: Slow at both ends (for state changes)
  easeInOut: 'ease-in-out',

  // Custom cubic-bezier for Material Design entrance
  entrance: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

  // Custom cubic-bezier for Material Design exit
  exit: 'cubic-bezier(0.4, 0.0, 1, 1)',

  // Smooth material motion
  material: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const

/**
 * CSS class names for common animations
 * Apply to elements to get predefined animation effects
 */
export const ANIMATION_CLASSES = {
  // Entrance animations
  fadeIn: 'animate-fade-in',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  scaleIn: 'animate-scale-in',
  zoomIn: 'animate-zoom-in',

  // Exit animations
  fadeOut: 'animate-fade-out',
  slideOutLeft: 'animate-slide-out-left',
  slideOutRight: 'animate-slide-out-right',
  slideOutUp: 'animate-slide-out-up',
  slideOutDown: 'animate-slide-out-down',
  scaleOut: 'animate-scale-out',

  // Looping animations
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  shimmer: 'animate-shimmer',

  // Interactive animations
  buttonHover: 'animate-button-hover',
  hoverScale: 'animate-hover-scale',
  hoverLift: 'animate-hover-lift',

  // Loading animations
  loadingDots: 'animate-loading-dots',
  loadingBar: 'animate-loading-bar',
  loadingSpinner: 'animate-loading-spinner',

  // Page transitions
  pageTransition: 'page-transition',
  pageEnter: 'animate-page-enter',
  pageExit: 'animate-page-exit',

  // Empty state
  emptyStateFadeIn: 'empty-state-animated',
  iconBounce: 'animate-icon-bounce',

  // Stagger/List
  staggerList: 'animate-stagger-list',
  listItemSlide: 'list-item-animated',
} as const

/**
 * Check if user prefers reduced motion
 * @returns true if prefers-reduced-motion is set to reduce
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Wrapper to safely apply animations while respecting user preferences
 * @param animationClass - Class name to apply when animations are allowed
 * @param fallbackClass - Optional class to apply when motion is reduced
 * @returns Animation class or fallback
 */
export function getAnimationClass(
  animationClass: string,
  fallbackClass?: string
): string {
  if (prefersReducedMotion()) {
    return fallbackClass ?? ''
  }
  return animationClass
}

/**
 * Generate inline animation style object
 * Useful for dynamic animations where CSS classes aren't enough
 */
export interface AnimationStyleOptions {
  duration?: number | string
  timing?: string
  delay?: number | string
  iterationCount?: number | 'infinite'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}

export function getAnimationStyle(
  animationName: string,
  options: AnimationStyleOptions = {}
): React.CSSProperties {
  const {
    duration = ANIMATION_DURATIONS.normalMs,
    timing = ANIMATION_TIMINGS.easeInOut,
    delay = '0s',
    iterationCount = 1,
    fillMode = 'forwards',
    direction = 'normal',
  } = options

  const durationStr = typeof duration === 'number' ? `${duration}ms` : duration
  const delayStr = typeof delay === 'number' ? `${delay}ms` : delay

  return {
    animation: `${animationName} ${durationStr} ${timing} ${delayStr} ${iterationCount} ${direction}`,
    animationFillMode: fillMode,
  }
}

/**
 * Create staggered animation delays for lists
 * Returns a CSS style object for nth-child selector
 */
export function getStaggeredDelay(
  itemIndex: number,
  baseDelay: number = 50
): number {
  return itemIndex * baseDelay
}

/**
 * Page transition helper - apply animation on mount/unmount
 */
export function getPageTransitionClass(isEntering: boolean): string {
  if (prefersReducedMotion()) return ''
  return isEntering ? ANIMATION_CLASSES.pageEnter : ANIMATION_CLASSES.pageExit
}

/**
 * Motion-safe wrapper for animations
 * Disables animations if user prefers reduced motion
 */
export function withMotionSafety(
  shouldAnimate: boolean,
  animationClass: string,
  fallbackClass?: string
): string {
  if (!shouldAnimate || prefersReducedMotion()) {
    return fallbackClass ?? ''
  }
  return animationClass
}

/**
 * Get duration value for delays or timeouts
 * Returns milliseconds
 */
export function getAnimationDuration(
  preset: keyof typeof ANIMATION_DURATIONS
): number {
  const key = preset as keyof typeof ANIMATION_DURATIONS
  const value = ANIMATION_DURATIONS[key]
  return typeof value === 'number' ? value : parseInt(String(value), 10)
}

/**
 * Common animation delay constants (in ms)
 */
export const ANIMATION_DELAYS = {
  none: 0,
  veryFast: 50,
  fast: 100,
  normal: 150,
  slow: 200,
  verySlow: 300,
} as const

/**
 * Accessible animation configurations
 * Ready-to-use animation options that respect preferences
 */
export const ACCESSIBLE_ANIMATIONS = {
  fadeIn: {
    className: ANIMATION_CLASSES.fadeIn,
    duration: ANIMATION_DURATIONS.normal,
    timing: ANIMATION_TIMINGS.easeOut,
  },
  slideUp: {
    className: ANIMATION_CLASSES.slideInUp,
    duration: ANIMATION_DURATIONS.normal,
    timing: ANIMATION_TIMINGS.easeOut,
  },
  slideDown: {
    className: ANIMATION_CLASSES.slideInDown,
    duration: ANIMATION_DURATIONS.normal,
    timing: ANIMATION_TIMINGS.easeOut,
  },
  scaleIn: {
    className: ANIMATION_CLASSES.scaleIn,
    duration: ANIMATION_DURATIONS.normal,
    timing: ANIMATION_TIMINGS.easeOut,
  },
  pageTransition: {
    className: ANIMATION_CLASSES.pageTransition,
    duration: ANIMATION_DURATIONS.slow,
    timing: ANIMATION_TIMINGS.easeInOut,
  },
} as const

/**
 * Loading animation helpers
 */
export const LOADING_ANIMATIONS = {
  spinner: {
    className: ANIMATION_CLASSES.loadingSpinner,
    duration: 800,
    timing: ANIMATION_TIMINGS.linear,
  },
  dots: {
    className: ANIMATION_CLASSES.loadingDots,
    duration: 1400,
    timing: ANIMATION_TIMINGS.easeInOut,
  },
  pulse: {
    className: ANIMATION_CLASSES.pulse,
    duration: 2000,
    timing: ANIMATION_TIMINGS.easeInOut,
  },
  bar: {
    className: ANIMATION_CLASSES.loadingBar,
    duration: 1500,
    timing: ANIMATION_TIMINGS.easeInOut,
  },
} as const
