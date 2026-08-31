import { z } from 'zod'

/** Package-related schemas. */
export const PackageSchemas = {
  /** Package ID format */
  packageId: z
    .string()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Package ID must start with letter, contain only lowercase letters, numbers, underscores'
    ),

  /** Semantic version */
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+(-[\w.]+)?$/, 'Invalid semantic version'),

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
