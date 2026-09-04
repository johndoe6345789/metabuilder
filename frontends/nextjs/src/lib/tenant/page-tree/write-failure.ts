/**
 * Why a row write was refused, in the server's own words.
 *
 * DBAL answers a rejected write with a JSON body naming the offending
 * fields. That body is the entire diagnosis -- "sortOrder: Field is
 * required" says exactly what to fix, where a bare false says only that
 * something, somewhere, went wrong. Anything that writes rows returns one
 * of these instead of a boolean so the reason survives to the screen.
 */
export async function describeFailure(
  entity: string,
  res: Response
): Promise<string> {
  const detail = await res.text().catch(() => '')
  const fields = readFieldErrors(detail)
  const because = fields.length > 0 ? fields.join('; ') : trimmed(detail)
  return because.length > 0
    ? `${entity} rejected (${res.status}): ${because}`
    : `${entity} rejected (${res.status})`
}

/** DBAL nests its validation detail, and sometimes double-encodes it. */
function readFieldErrors(body: string): string[] {
  for (const text of [body, unwrapNested(body)]) {
    try {
      const parsed = JSON.parse(text) as {
        fields?: { field?: string; message?: string }[]
      }
      const fields = parsed.fields ?? []
      if (fields.length > 0) {
        return fields.map(f => `${f.field ?? '?'}: ${f.message ?? 'invalid'}`)
      }
    } catch {
      // Not JSON at this level; fall through to the next reading.
    }
  }
  return []
}

/** `{"error":"{\"fields\":[...]}"}` -- the useful part is the inner string. */
function unwrapNested(body: string): string {
  try {
    const outer = JSON.parse(body) as { error?: unknown }
    return typeof outer.error === 'string' ? outer.error : ''
  } catch {
    return ''
  }
}

function trimmed(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim()
  return flat.length > 200 ? `${flat.slice(0, 200)}…` : flat
}
