import { NextResponse } from 'next/server'

import { PERMISSION_LEVELS } from '@/app/levels/levels-data'

export async function GET() {
  const summary = PERMISSION_LEVELS.map((level) => ({
    key: level.key,
    title: level.title,
    capabilityCount: level.capabilities.length,
    taglineLength: level.tagline.length,
  }))

  return NextResponse.json({
    totalLevels: PERMISSION_LEVELS.length,
    summary,
  })
}
