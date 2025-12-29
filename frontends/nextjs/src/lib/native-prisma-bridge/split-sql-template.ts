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

  const hasQuestionMarks = sql.includes('?')

  if (params.length === 0 && !hasQuestionMarks) {
    return { strings: [sql], values: [] }
  }

  if (!hasQuestionMarks) {
    throw new Error('Native Prisma bridge parameter mismatch')
  }

  const questionSegments = sql.split('?')
  if (questionSegments.length !== params.length + 1) {
    throw new Error('Native Prisma bridge parameter mismatch')
  }
  return { strings: questionSegments, values: params }
}
