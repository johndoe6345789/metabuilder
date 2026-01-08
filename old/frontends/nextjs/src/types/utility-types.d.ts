/**
 * Utility types for safer, flexible replacements
 *
 * Use these types for better type safety.
 */

/**
 * Represents a valid JSON value
 * Use this for JSON data
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

/**
 * JSON object type (excludes primitives and arrays)
 */
export type JsonObject = { [key: string]: JsonValue }

/**
 * JSON array type
 */
export type JsonArray = JsonValue[]

/**
 * Represents script interop values
 * Use this for script-to-JS conversions
 */
export type ScriptValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray

/**
 * Generic property bag for metadata and dynamic properties
 * Prefer specific interfaces when structure is known
 */
export type PropertyBag = Record<string, JsonValue>

/**
 * Type-safe record with specific value type
 */
export type TypedRecord<T> = Record<string, T>

/**
 * Unknown error type (for catch blocks)
 */
export type UnknownError = Error | string
