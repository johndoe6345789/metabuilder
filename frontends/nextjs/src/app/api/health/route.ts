import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { PERMISSION_LEVELS } from '@/app/levels/levels-data'

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    levelCount: PERMISSION_LEVELS.length,
    timestamp: new Date().toISOString(),
  })
}
