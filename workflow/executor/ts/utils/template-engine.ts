/**
 * Template Engine for workflow variable interpolation
 * Supports {{ variable }} syntax with deep object access
 */

export interface TemplateContext {
  context?: Record<string, any>;
  state?: Record<string, any>;
  json?: Record<string, any>;
  env?: Record<string, any>;
  steps?: Record<string, any>;
  utils?: Record<string, any>;
  workflow?: {
    variables?: Record<string, any>;
    [key: string]: any;
  };
}

/**
 * Interpolate template string with context variables
 * Supports: {{ $context.variable }}, {{ $json.field }}, {{ $env.VAR }}, {{ $workflow.variables.name }}
 */
export function interpolateTemplate(template: any, context: TemplateContext): any {
  // Handle non-string values
  if (template === null || template === undefined) {
    return template;
  }

  if (typeof template === 'object' && !Array.isArray(template)) {
    // Recursively process objects
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(template)) {
      result[key] = interpolateTemplate(value, context);
    }
    return result;
  }

  if (Array.isArray(template)) {
    // Recursively process arrays
    return template.map((item) => interpolateTemplate(item, context));
  }

  if (typeof template !== 'string') {
    return template;
  }

  // Process string templates
  return template.replace(/\{\{(.*?)\}\}/g, (match, expression) => {
    try {
      return String(evaluateExpression(expression.trim(), context));
    } catch (error) {
      console.warn(`Failed to interpolate ${match}:`, error);
      return match; // Return original if evaluation fails
    }
  });
}

/**
 * Evaluate a template expression and return result
 * Supports: $context.var, $json.field, $env.VAR, $steps.nodeId.output, $workflow.variables.name
 */
export function evaluateTemplate(expression: string, context: TemplateContext): any {
  return evaluateExpression(expression, context);
}

/**
 * Evaluate an expression with context
 */
function evaluateExpression(expression: string, context: TemplateContext): any {
  // Handle special variables
  if (expression.startsWith('$context.')) {
    return getNestedValue(context.context || {}, expression.substring(9));
  }

  if (expression.startsWith('$json.')) {
    return getNestedValue(context.json || {}, expression.substring(6));
  }

  if (expression.startsWith('$env.')) {
    return getNestedValue(context.env || {}, expression.substring(5));
  }

  if (expression.startsWith('$steps.')) {
    return getNestedValue(context.steps || {}, expression.substring(7));
  }

  if (expression.startsWith('$workflow.')) {
    return getNestedValue(context.workflow || {}, expression.substring(10));
  }

  if (expression.startsWith('$utils.')) {
    return callUtility(expression.substring(7), context.utils || {});
  }

  // Handle direct variable names
  if (expression.startsWith('$')) {
    const varName = expression.substring(1);
    return (
      context.context?.[varName] ??
      context.json?.[varName] ??
      context.env?.[varName] ??
      context.steps?.[varName] ??
      context.workflow?.[varName] ??
      undefined
    );
  }

  // Handle literals
  if (expression === 'true') return true;
  if (expression === 'false') return false;
  if (expression === 'null') return null;
  if (expression === 'undefined') return undefined;

  // Try numeric
  const num = Number(expression);
  if (!isNaN(num) && expression !== '') {
    return num;
  }

  // Try JSON parse for objects/arrays
  try {
    return JSON.parse(expression);
  } catch {
    // Not JSON, return as string
  }

  // Return string literal
  if ((expression.startsWith('"') && expression.endsWith('"')) || (expression.startsWith("'") && expression.endsWith("'"))) {
    return expression.slice(1, -1);
  }

  return expression;
}

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue({ user: { name: 'John' } }, 'user.name') => 'John'
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    // Handle array indexing like "array[0]"
    const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [, fieldName, index] = arrayMatch;
      current = current[fieldName]?.[parseInt(index)];
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Call utility function
 */
function callUtility(expression: string, utils: Record<string, any>): any {
  const match = expression.match(/(\w+)\((.*)\)/);
  if (!match) {
    return utils[expression];
  }

  const [, fnName, argsStr] = match;
  const fn = utils[fnName];

  if (typeof fn !== 'function') {
    throw new Error(`Utility function not found: ${fnName}`);
  }

  // Parse arguments (simple comma-separated)
  const args = argsStr
    .split(',')
    .map((arg) => arg.trim())
    .map((arg) => {
      // Try to evaluate each argument
      try {
        return JSON.parse(arg);
      } catch {
        return arg;
      }
    });

  return fn(...args);
}

/**
 * Build common utility functions for templates
 */
export function buildDefaultUtilities(): Record<string, any> {
  return {
    flatten: (obj: any) => flattenObject(obj),
    pick: (obj: any, keys: string[]) => {
      const result: Record<string, any> = {};
      for (const key of keys) {
        result[key] = obj[key];
      }
      return result;
    },
    omit: (obj: any, keys: string[]) => {
      const result = { ...obj };
      for (const key of keys) {
        delete result[key];
      }
      return result;
    },
    merge: (...objs: any[]) => Object.assign({}, ...objs),
    keys: (obj: any) => Object.keys(obj),
    values: (obj: any) => Object.values(obj),
    entries: (obj: any) => Object.entries(obj),
    length: (val: any) => (Array.isArray(val) || typeof val === 'string' ? val.length : 0),
    first: (arr: any[]) => arr?.[0],
    last: (arr: any[]) => arr?.[arr.length - 1],
    reverse: (arr: any[]) => [...arr].reverse(),
    sort: (arr: any[]) => [...arr].sort(),
    unique: (arr: any[]) => [...new Set(arr)],
    join: (arr: any[], sep: string) => arr.join(sep),
    split: (str: string, sep: string) => str.split(sep),
    uppercase: (str: string) => str.toUpperCase(),
    lowercase: (str: string) => str.toLowerCase(),
    trim: (str: string) => str.trim(),
    replace: (str: string, search: string, replace: string) => str.replace(search, replace),
    includes: (str: string, search: string) => str.includes(search),
    startsWith: (str: string, prefix: string) => str.startsWith(prefix),
    endsWith: (str: string, suffix: string) => str.endsWith(suffix),
    now: () => new Date().toISOString(),
    timestamp: () => Date.now()
  };
}

/**
 * Flatten nested object to dot notation
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
