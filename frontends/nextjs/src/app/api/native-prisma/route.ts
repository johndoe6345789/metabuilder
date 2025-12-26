import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

const AUTH_TOKEN_HEADER = 'x-dbal-native-prisma-token'
const AUTHORIZATION_HEADER = 'authorization'
const BRIDGE_SECRET = process.env.DBAL_NATIVE_PRISMA_TOKEN?.trim() ?? ''

function isAuthorized(request: Request) {
  if (!BRIDGE_SECRET) {
    return true
  }

  const token = request.headers.get(AUTH_TOKEN_HEADER)
  if (token === BRIDGE_SECRET) {
    return true
  }

  const authorization = request.headers.get(AUTHORIZATION_HEADER)
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const bearer = authorization.slice(7).trim()
    if (bearer === BRIDGE_SECRET) {
      return true
    }
  }

  return false
}

function toTemplateStrings(parts: string[]): TemplateStringsArray {
  const strings = [...parts]
  const template = strings as unknown as TemplateStringsArray
  Object.defineProperty(template, 'raw', {
    value: [...strings],
    enumerable: false,
  })
  return template
}

function buildNativePrismaSql(sql: string, params: unknown[]): Prisma.Sql {
  const placeholderPattern = /\$(\d+)/g
  const segments: string[] = []
  const values: unknown[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null = null

  while ((match = placeholderPattern.exec(sql)) !== null) {
    const index = Number(match[1])
    if (!Number.isFinite(index) || index < 1 || index > params.length) {
      throw new Error('Native Prisma bridge placeholder out of range')
    }
    segments.push(sql.slice(lastIndex, match.index))
    values.push(params[index - 1])
    lastIndex = match.index + match[0].length
  }

  if (values.length > 0) {
    segments.push(sql.slice(lastIndex))
    return Prisma.sql(toTemplateStrings(segments), ...values)
  }

  if (params.length === 0) {
    return Prisma.sql(toTemplateStrings([sql]))
  }

  const questionSegments = sql.split('?')
  if (questionSegments.length !== params.length + 1) {
    throw new Error('Native Prisma bridge parameter mismatch')
  }
  return Prisma.sql(toTemplateStrings(questionSegments), ...params)
}

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

  let query: Prisma.Sql
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
