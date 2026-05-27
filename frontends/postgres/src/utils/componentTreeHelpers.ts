/**
 * Pure helper functions for the component tree renderer.
 * No React imports — safe to unit-test without a DOM.
 */

export type RenderContext = {
  data?: Record<string, any>;
  actions?: Record<string, (...args: any[]) => any>;
  handlers?: Record<string, (...args: any[]) => any>;
  state?: Record<string, any>;
};

/** Walk a dot-notation path (with optional [n] array indexing). */
export function resolvePath(root: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    const arrayMatch = key.match(/(.+)\[(\d+)\]/);
    if (arrayMatch && arrayMatch[1] && arrayMatch[2]) {
      return current
        ?.[arrayMatch[1]]
        ?.[Number.parseInt(arrayMatch[2], 10)];
    }
    return current?.[key];
  }, root);
}

/**
 * Get a nested value from the render context.
 * Falls back to context.data when a direct lookup misses.
 */
export function getNestedValue(obj: any, path: string): any {
  const direct = resolvePath(obj, path);
  if (direct === undefined && obj?.data !== undefined) {
    return resolvePath(obj.data, path);
  }
  return direct;
}

/** Replace {{path}} template tokens with live context values. */
export function interpolateValue(
  value: any,
  context: RenderContext,
): any {
  if (typeof value !== 'string') return value;

  const templateMatch = value.match(/^{{(.+)}}$/);
  if (templateMatch && templateMatch[1]) {
    return getNestedValue(context, templateMatch[1].trim());
  }

  return value.replace(/{{(.+?)}}/g, (_, path) => {
    const val = getNestedValue(context, path.trim());
    return val !== undefined ? String(val) : '';
  });
}

/**
 * Evaluate a simple condition string against the context.
 * Only truthy / boolean checks are supported.
 */
export function evaluateCondition(
  condition: string,
  context: RenderContext,
): boolean {
  try {
    const value = getNestedValue(context, condition);
    return typeof value === 'boolean' ? value : Boolean(value);
  } catch {
    return false;
  }
}
