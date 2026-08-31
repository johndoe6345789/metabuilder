import { errorResponse, STATUS } from '@/lib/routing'
import type { NextResponse } from 'next/server'

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH']

export type ParsedBody =
  | { body: Record<string, unknown> | undefined; error?: undefined }
  | { body?: undefined; error: NextResponse }

/** Reads and JSON-parses a mutation's body, if there is one -- GET/DELETE
 *  never carry one, and an empty body is valid (means "no changes"). */
export async function parseMutationBody(
  request: Request,
  method: string
): Promise<ParsedBody> {
  if (!MUTATING_METHODS.includes(method)) return { body: undefined }

  try {
    const text = await request.text()
    if (text.length === 0) return { body: undefined }
    return { body: JSON.parse(text) as Record<string, unknown> }
  } catch {
    return { error: errorResponse('Invalid JSON body', STATUS.BAD_REQUEST) }
  }
}
