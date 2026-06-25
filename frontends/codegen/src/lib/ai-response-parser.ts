/**
 * AI response parsing and Zod validation helper.
 */
import { z } from 'zod'
import { toast } from '@/components/ui/sonner'

export const parseAndValidateJson = <T,>(
  result: string,
  schema: z.ZodType<T>,
  context: string,
  toastMessage: string,
): T | null => {
  let parsed: unknown
  try {
    parsed = JSON.parse(result)
  } catch (error) {
    console.error('AI response JSON parse failed', {
      context,
      error:
        error instanceof Error
          ? error.message
          : String(error),
      rawResponse: result,
    })
    toast.error(toastMessage)
    return null
  }
  const validation = schema.safeParse(parsed)
  if (!validation.success) {
    console.error('AI response validation failed', {
      context,
      issues: validation.error.issues,
      rawResponse: parsed,
    })
    toast.error(toastMessage)
    return null
  }
  return validation.data
}
