import { z } from 'zod'

/** User-related schemas. */
export const UserSchemas = {
  /** User role */
  role: z.enum(['public', 'user', 'moderator', 'admin', 'god', 'supergod']),

  /** User level (0-5) */
  level: z.number().int().min(0).max(5),

  /** Username format */
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      'Username must start with letter, contain only letters, numbers, underscores, hyphens'
    ),

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
