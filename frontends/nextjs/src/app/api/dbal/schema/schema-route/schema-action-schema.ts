import { z } from '@/lib/validation'

/** Schema operation request validation. */
export const SchemaActionSchema = z.object({
  action: z.enum(['scan', 'generate', 'approve', 'reject']),
  id: z.string().min(1).max(128).optional(),
})
