/**
 * POST /api/setup
 * Alias for /api/bootstrap — seeds database with default data.
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { POST as bootstrap } from '@/app/api/bootstrap/route'

export async function POST(request: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET
  const authHeader = request.headers.get('Authorization')
  if (
    setupSecret === undefined ||
    setupSecret === '' ||
    authHeader !== `Bearer ${setupSecret}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return bootstrap(request)
}
