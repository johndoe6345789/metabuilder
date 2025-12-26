import { Prisma } from '@prisma/client'

export const AUTH_TOKEN_HEADER = 'x-dbal-native-prisma-token'
export const AUTHORIZATION_HEADER = 'authorization'

export function getBridgeSecret(): string {
  return process.env.DBAL_NATIVE_PRISMA_TOKEN?.trim() ?? ''
}

export function isAuthorized(request: { headers: { get(name: string): string | null } }): boolean {
  const secret = getBridgeSecret()
  if (!secret) {
    return true
  }

  const token = request.headers.get(AUTH_TOKEN_HEADER)
  if (token === secret) {
    return true
  }

  const authorization = request.headers.get(AUTHORIZATION_HEADER)
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const bearer = authorization.slice(7).trim()
    if (bearer === secret) {
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

export function splitSqlTemplate(sql: string, params: unknown[]) {
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
    return { strings: segments, values }
  }

  if (params.length === 0) {
    return { strings: [sql], values: [] }
  }

  const questionSegments = sql.split('?')
  if (questionSegments.length !== params.length + 1) {
    throw new Error('Native Prisma bridge parameter mismatch')
  }
  return { strings: questionSegments, values: params }
}

export function buildNativePrismaSql(sql: string, params: unknown[]): Prisma.Sql {
  const { strings, values } = splitSqlTemplate(sql, params)
  return Prisma.sql(toTemplateStrings(strings), ...values)
}
