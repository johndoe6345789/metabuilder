/**
 * Coerce a value parsed from a JSON request body into a string.
 *
 * Request bodies are narrowed to Record<string, unknown>, so their fields are
 * `unknown` and String() accepts them happily - including objects and arrays,
 * which stringify to "[object Object]" and get persisted as if they were real
 * values. Anything that is not already a primitive returns the fallback
 * instead, so a malformed field reads as absent rather than as junk text.
 *
 * @param value - The value to coerce, typically an unknown field off a body.
 * @param fallback - Returned when the value is absent or not a primitive.
 * @returns The value as a string, or the fallback.
 */
export function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return fallback
}
