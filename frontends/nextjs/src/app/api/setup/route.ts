/**
 * POST /api/setup
 * Alias for /api/bootstrap — seeds database with default data.
 */

import type { NextRequest } from 'next/server'
import { POST as bootstrap } from '@/app/api/bootstrap/route'

export async function POST(request: NextRequest) {
  return bootstrap(request)
}
