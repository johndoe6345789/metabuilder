/**
 * `${name}` and `${event.data.name}`, resolved against a run's values.
 *
 * Every runnable step's help text tells a founder to write these -- "use
 * it as ${that name}", "what triggered this, e.g. ${event.data.name}" --
 * and nothing in this repo had ever resolved one. The daemon does it
 * server-side; a dry run has to do the same or every step reads the
 * literal text "${event.data.name}" as its value.
 */

const REFERENCE = /\$\{([^}]*)\}/g

/** A dotted path into nested values: `event.data.name`. */
export function resolvePath(
  path: string,
  values: Record<string, unknown>
): unknown {
  const parts = path.trim().split('.').filter(Boolean)
  if (parts.length === 0) return undefined
  let current: unknown = values
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

const asText = (value: unknown): string => {
  if (value === undefined || value === null) return ''
  return typeof value === 'string' ? value : JSON.stringify(value)
}

/**
 * One string.
 *
 * A string that is nothing but a single reference keeps the referenced
 * value's own type -- a row, a number, a list -- because `${rows}` handed
 * to a step that wants rows must not arrive as the text "[object
 * Object]". Anything else is text with the references spliced in.
 */
export function interpolateText(
  text: string,
  values: Record<string, unknown>
): unknown {
  const whole = /^\$\{([^}]*)\}$/.exec(text)
  if (whole !== null) return resolvePath(whole[1], values)
  return text.replace(REFERENCE, (_m, path: string) =>
    asText(resolvePath(path, values))
  )
}

/** The same, through objects and arrays -- a step's `data` and `filter`. */
export function interpolate(
  value: unknown,
  values: Record<string, unknown>
): unknown {
  if (typeof value === 'string') return interpolateText(value, values)
  if (Array.isArray(value)) return value.map(v => interpolate(v, values))
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        interpolate(v, values),
      ])
    )
  }
  return value
}

/** interpolate(), for somewhere only a string makes sense. */
export function interpolateString(
  value: unknown,
  values: Record<string, unknown>
): string {
  return asText(interpolate(value, values))
}
