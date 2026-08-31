import { z } from 'zod'

/** Common reusable schemas. */
export const CommonSchemas = {
  /** UUID or CUID identifier */
  id: z.string().min(1).max(64),

  /** Slug format (lowercase, alphanumeric, hyphens) */
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),

  /** Non-empty string */
  nonEmptyString: z.string().min(1),

  /** Optional trimmed string */
  optionalString: z.string().optional(),

  /** Positive integer */
  positiveInt: z.number().int().positive(),

  /** Non-negative integer */
  nonNegativeInt: z.number().int().nonnegative(),

  /** Timestamp (BigInt as number or string) */
  timestamp: z.union([
    z.number(),
    z.bigint(),
    z.string().transform(s => BigInt(s)),
  ]),

  /** Boolean that accepts string 'true'/'false' */
  booleanLike: z.union([
    z.boolean(),
    z.literal('true').transform(() => true),
    z.literal('false').transform(() => false),
  ]),

  /** Email address */
  email: z.string().email(),

  /** URL */
  url: z.string().url(),

  /** JSON string (validates it's valid JSON) */
  jsonString: z.string().refine(s => {
    try {
      JSON.parse(s)
      return true
    } catch {
      return false
    }
  }, 'Invalid JSON string'),

  /** Pagination params */
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    perPage: z.coerce.number().int().positive().max(100).default(20),
  }),
}
