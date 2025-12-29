import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function requireDBALApiKey(request: NextRequest): NextResponse | null {
  const expectedKey = process.env.DBAL_API_KEY
  if (!expectedKey) {
    return null
  }

  const providedKey =
    request.headers.get('x-dbal-api-key') ||
    request.headers.get('authorization')?.split('Bearer ')[1] ||
    ''

  if (providedKey !== expectedKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  return null
}
