/**
 * One thing a visitor sent through a form on a published page.
 *
 * Nothing in the product ever read these rows: forms write them, the
 * backup exports them and a workflow can be triggered by them, but a
 * founder had no way to see a single message their own site collected.
 * This is the shape that view needs.
 */

/** A submission as the data layer hands it over, before any parsing. */
export interface RawSubmission {
  id?: unknown
  formName?: unknown
  path?: unknown
  data?: unknown
  workflow?: unknown
  status?: unknown
  createdAt?: unknown
}

export interface Submission {
  id: string
  /** The form's name, as the page's Form block set it. */
  formName: string
  /** The page it was sent from. */
  path: string
  /** What the visitor actually filled in. */
  data: Record<string, string>
  /** 'handled' once the founder has dealt with it. */
  status: string
  /** Milliseconds, or null when the row carries no readable time. */
  receivedAt: number | null
}

const text = (raw: unknown, fallback = ''): string =>
  typeof raw === 'string' && raw !== '' ? raw : fallback

/**
 * The answers, however the adapter spelled them.
 *
 * `data` goes out as an object and can come back as the JSON text it was
 * stored as -- the same shape mismatch that made PageConfig.level arrive
 * as "3" and gate at 0. Anything unreadable is an empty form rather than
 * a crash: a message with no fields still tells the founder someone wrote.
 */
export function parseAnswers(raw: unknown): Record<string, string> {
  const source = typeof raw === 'string' ? safeJson(raw) : raw
  if (source === null || typeof source !== 'object') return {}
  return Object.fromEntries(
    Object.entries(source as Record<string, unknown>).map(([k, v]) => [
      k,
      typeof v === 'string' ? v : JSON.stringify(v),
    ])
  )
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * When it arrived, in milliseconds.
 *
 * Forms stamp seconds (`Math.floor(Date.now() / 1000)`), and an adapter
 * may hand that back as a string. A value already in milliseconds is
 * left alone, so a row written by anything else still reads correctly.
 */
export function parseReceivedAt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return n < 1e12 ? Math.round(n * 1000) : Math.round(n)
}

export function parseSubmission(raw: RawSubmission): Submission {
  return {
    id: text(raw.id),
    formName: text(raw.formName, 'Unnamed form'),
    path: text(raw.path, '/'),
    data: parseAnswers(raw.data),
    status: text(raw.status, 'new'),
    receivedAt: parseReceivedAt(raw.createdAt),
  }
}

/** Every field name used across these submissions, in a stable order. */
export function answerColumns(rows: Submission[]): string[] {
  return [...new Set(rows.flatMap(r => Object.keys(r.data)))].sort()
}
