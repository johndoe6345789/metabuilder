import { NextResponse } from 'next/server'

import { PERMISSION_LEVELS } from '@/app/levels/levels-data'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawLevel = url.searchParams.get('level')
  const normalizedLevel = rawLevel?.toLowerCase().trim()

  const rawCapabilities = url.searchParams.get('cap')
  const normalizedCapabilities = rawCapabilities
    ? rawCapabilities
        .split(',')
        .map((value) => value.toLowerCase().trim())
        .filter(Boolean)
    : []

  const matchesLevel = (level: typeof PERMISSION_LEVELS[number]) =>
    !normalizedLevel || level.key === normalizedLevel || String(level.id) === normalizedLevel

  const matchesCapabilities = (level: typeof PERMISSION_LEVELS[number]) =>
    normalizedCapabilities.length === 0 ||
    level.capabilities.some((capability) =>
      normalizedCapabilities.some((candidate) => capability.toLowerCase().includes(candidate))
    )

  const filtered = PERMISSION_LEVELS.filter(
    (level) => matchesLevel(level) && matchesCapabilities(level)
  )

  return NextResponse.json({ levels: filtered })
}
