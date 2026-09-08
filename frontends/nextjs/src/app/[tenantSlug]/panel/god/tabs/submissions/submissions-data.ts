/** Reading the messages a tenant's forms collected, and marking them. */

import { readList } from '@/lib/db/read-list'
import { parseSubmission, type Submission } from './submission-row'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

const url = (tenant: string): string =>
  `${DBAL}/${tenant}/core/FormSubmission`

/**
 * Why a read failed, in terms a founder can act on.
 *
 * A 404 or 422 here does not mean "no messages": it means the data layer
 * has no FormSubmission entity, so every form on every published page is
 * being refused as it is submitted. That is invisible from the page --
 * the visitor sees a generic "could not send" -- and it looked exactly
 * like an empty inbox from here, which is why it needs saying outright.
 */
export function readFailure(status: number): string {
  if (status === 404 || status === 422) {
    return (
      `The data layer does not have a FormSubmission entity (HTTP ${status}). ` +
      'Until it does, forms on published pages cannot store anything.'
    )
  }
  if (status === 401 || status === 403) {
    return `Not allowed to read this community's messages (HTTP ${status}).`
  }
  return `Could not read messages (HTTP ${status}).`
}

/** Newest first: a founder wants what arrived while they were away. */
function newestFirst(rows: Submission[]): Submission[] {
  return [...rows].sort((a, b) => (b.receivedAt ?? 0) - (a.receivedAt ?? 0))
}

/**
 * Every message this tenant's forms collected.
 *
 * Throws rather than answering an empty list: an inbox that cannot be
 * read looks exactly like one with nothing in it, and the difference is
 * the whole point of opening it.
 */
export async function fetchSubmissions(
  tenant: string
): Promise<Submission[]> {
  const res = await fetch(`${url(tenant)}?limit=500`, {
    credentials: 'include',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(readFailure(res.status))
  const rows = readList<Record<string, unknown>>(await res.json())
  return newestFirst(rows.map(parseSubmission))
}

/**
 * Marks one message handled, or puts it back.
 *
 * `status` is a privileged field -- forms deliberately never set it, so
 * an anonymous submission cannot arrive pre-marked -- which makes this
 * the only place it is ever written.
 */
export async function setSubmissionStatus(
  tenant: string,
  id: string,
  status: string
): Promise<void> {
  const res = await fetch(`${url(tenant)}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
