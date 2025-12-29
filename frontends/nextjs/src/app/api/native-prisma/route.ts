import { NextResponse } from 'next/server'

import { prisma } from '@/lib/config/prisma'
import { buildNativePrismaSql, isAuthorized } from '@/lib/native-prisma-bridge'

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json().catch(() => ({}))
  const sql = typeof payload.sql === 'string' ? payload.sql.trim() : ''
  const params = Array.isArray(payload.params) ? payload.params : []
  const type = payload.type === 'nonquery' ? 'nonquery' : 'query'

  if (!sql) {
    return NextResponse.json({ error: '`sql` is required' }, { status: 400 })
  }

  let query
  try {
    query = buildNativePrismaSql(sql, params)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid SQL payload' },
      { status: 400 }
    )
  }

  try {
    if (type === 'query') {
      const rows = await prisma.$queryRaw(query)
      return NextResponse.json({ rows })
    }

    const affected = await prisma.$executeRaw(query)
    return NextResponse.json({ affected })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Native Prisma execution failed' },
      { status: 500 }
    )
  }
}
