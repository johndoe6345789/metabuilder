/**
 * Reading values out of the render context for the declarative vault view.
 *
 * vault-view.json describes the page as data, so every value a node renders
 * arrives as a path or a template string that has to be resolved against the
 * live controller. Kept apart from the renderer so the resolution rules can
 * be read -- and tested -- without a React tree.
 */

export type PathContext = Record<string, unknown>

/** Walks a dotted path, answering undefined rather than throwing. */
export function readPath(context: PathContext, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) return undefined
    return (value as Record<string, unknown>)[key]
  }, context)
}

/**
 * What a {{binding}} becomes in text. Objects, arrays and functions render
 * as nothing at all -- "[object Object]" in the middle of a sentence is
 * worse than a gap.
 */
export function templateValue(value: unknown): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return String(value)
  return ''
}

/** Truthiness for $not/$or/$and, matching the JSON view's own rules. */
export function isTruthy(value: unknown): boolean {
  return (
    value !== undefined &&
    value !== null &&
    value !== false &&
    value !== 0 &&
    value !== ''
  )
}

/** Substitutes every {{path}} in a template string. */
export function fillTemplate(template: string, context: PathContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) =>
    templateValue(readPath(context, path.trim()))
  )
}
