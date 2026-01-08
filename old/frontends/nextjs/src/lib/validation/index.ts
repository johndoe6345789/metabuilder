/**
 * Zod validation utilities for packages
 * 
 * Provides standardized validation patterns for package data, API requests,
 * and configuration validation.
 * 
 * Usage:
 * ```ts
 * import { z } from 'zod'
 * import { validateRequest, createPackageValidator } from '@/lib/validation'
 * 
 * // Define your schema
 * const MyDataSchema = z.object({
 *   name: z.string().min(1),
 *   count: z.number().int().positive(),
 * })
 * 
 * // In API route
 * const result = await validateRequest(request, MyDataSchema)
 * if (!result.success) {
 *   return Errors.validationError(result.error)
 * }
 * const data = result.data
 * ```
 */
import { z, type ZodError, type ZodSchema, type ZodIssue } from 'zod'

export { z }

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ValidationError }

export interface ValidationError {
  issues: Array<{
    path: string
    message: string
    code: string
  }>
}

/**
 * Format Zod errors into a standardized format
 */
export function formatZodError(error: ZodError): ValidationError {
  return {
    issues: error.issues.map((issue: ZodIssue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  }
}

/**
 * Validate data against a Zod schema
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: formatZodError(result.error) }
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json() as unknown
    return validate(schema, body)
  } catch {
    return {
      success: false,
      error: { issues: [{ path: '', message: 'Invalid JSON body', code: 'invalid_json' }] },
    }
  }
}

// Common reusable schemas
export const CommonSchemas = {
  /** UUID or CUID identifier */
  id: z.string().min(1).max(64),
  
  /** Slug format (lowercase, alphanumeric, hyphens) */
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  
  /** Non-empty string */
  nonEmptyString: z.string().min(1),
  
  /** Optional trimmed string */
  optionalString: z.string().optional(),
  
  /** Positive integer */
  positiveInt: z.number().int().positive(),
  
  /** Non-negative integer */
  nonNegativeInt: z.number().int().nonnegative(),
  
  /** Timestamp (BigInt as number or string) */
  timestamp: z.union([z.number(), z.bigint(), z.string().transform(s => BigInt(s))]),
  
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
  jsonString: z.string().refine((s) => {
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

// Package-related schemas
export const PackageSchemas = {
  /** Package ID format */
  packageId: z.string().regex(/^[a-z][a-z0-9_]*$/, 'Package ID must start with letter, contain only lowercase letters, numbers, underscores'),
  
  /** Semantic version */
  version: z.string().regex(/^\d+\.\d+\.\d+(-[\w.]+)?$/, 'Invalid semantic version'),
  
  /** Package metadata */
  metadata: z.object({
    packageId: z.string(),
    name: z.string(),
    version: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    category: z.string().optional(),
    minLevel: z.number().int().min(0).max(5).optional(),
    exports: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
  }),
  
  /** Package config for installation */
  installConfig: z.object({
    packageId: z.string(),
    enabled: z.boolean().default(true),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
}

// User-related schemas
export const UserSchemas = {
  /** User role */
  role: z.enum(['public', 'user', 'moderator', 'admin', 'god', 'supergod']),
  
  /** User level (0-5) */
  level: z.number().int().min(0).max(5),
  
  /** Username format */
  username: z.string().min(3).max(32).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, 
    'Username must start with letter, contain only letters, numbers, underscores, hyphens'),
  
  /** Password (minimum requirements) */
  password: z.string().min(8).max(128),
  
  /** Create user payload */
  createUser: z.object({
    username: z.string().min(3).max(32),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['user', 'moderator', 'admin']).default('user'),
  }),
  
  /** Update user payload */
  updateUser: z.object({
    email: z.string().email().optional(),
    profilePicture: z.string().url().optional(),
    bio: z.string().max(500).optional(),
  }),
}

/**
 * Create a package-specific validator factory
 * 
 * Usage in package:
 * ```ts
 * const validate = createPackageValidator('my_package')
 * const result = validate(MySchema, data)
 * ```
 */
export function createPackageValidator(packageId: string) {
  return function <T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    const result = validate(schema, data)
    if (!result.success) {
      // Add package context to errors
      result.error.issues = result.error.issues.map(issue => ({
        ...issue,
        path: `${packageId}.${issue.path}`,
      }))
    }
    return result
  }
}
