import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  const sql = typeof payload.sql === 'string' ? payload.sql : ''
  const params = Array.isArray(payload.params) ? payload.params : []
  const type = payload.type === 'nonquery' ? 'nonquery' : 'query'

  try {
    if (type === 'query') {
      const rows = await prisma.$queryRawUnsafe(sql, ...params)
      return NextResponse.json({ rows })
    }

    const affected = await prisma.$executeRawUnsafe(sql, ...params)
    return NextResponse.json({ affected })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
