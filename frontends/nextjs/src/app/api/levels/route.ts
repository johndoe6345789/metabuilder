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
        .map(value => value.toLowerCase().trim())
        .filter(Boolean)
    : []

  const matchesLevel = (level: (typeof PERMISSION_LEVELS)[number]) =>
    !normalizedLevel || level.key === normalizedLevel || String(level.id) === normalizedLevel

  const matchesCapabilities = (level: (typeof PERMISSION_LEVELS)[number]) =>
    normalizedCapabilities.length === 0 ||
    level.capabilities.some(capability =>
      normalizedCapabilities.some(candidate => capability.toLowerCase().includes(candidate))
    )

  const filtered = PERMISSION_LEVELS.filter(
    level => matchesLevel(level) && matchesCapabilities(level)
  )

  return NextResponse.json({ levels: filtered })
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { level?: string | number; note?: string }
    const normalized =
      typeof payload.level === 'string'
        ? payload.level.toLowerCase().trim()
        : typeof payload.level === 'number'
          ? String(payload.level)
          : undefined

    const matched = normalized
      ? (PERMISSION_LEVELS.find(
          level => level.key === normalized || String(level.id) === normalized
        ) ?? null)
      : null

    console.info('Levels API feedback', { level: normalized, note: payload.note })

    return NextResponse.json({
      acknowledged: true,
      level: matched,
    })
  } catch (error) {
    console.error('Failed to handle level feedback', error)
    return NextResponse.json({ acknowledged: false, error: 'Invalid payload' }, { status: 400 })
  }
}
