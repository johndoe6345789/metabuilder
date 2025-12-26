import { NextResponse } from 'next/server'

import { PERMISSION_LEVELS } from '@/app/levels/levels-data'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawLevel = url.searchParams.get('level')
  const normalized = rawLevel?.toLowerCase().trim()
  const filtered = normalized
    ? PERMISSION_LEVELS.filter(
        (level) => level.key === normalized || String(level.id) === normalized
      )
    : PERMISSION_LEVELS

  return NextResponse.json({ levels: filtered })
}
