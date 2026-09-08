/** The three calls the community board makes to the data layer. */

import { readList } from '@/lib/db/read-list'
import {
  commentsUrl,
  toComment,
  toDbalRow,
  type Comment,
  type DbalComment,
} from './comment-types'

/** Every comment on the board, or null when it cannot be reached. */
export async function fetchComments(
  tenant: string
): Promise<Comment[] | null> {
  try {
    const res = await fetch(commentsUrl(tenant), {
      credentials: 'include',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return readList<DbalComment>(await res.json()).map(row => toComment(row))
  } catch {
    return null
  }
}

/** True when the comment was stored. */
export async function postComment(
  tenant: string,
  comment: Comment
): Promise<boolean> {
  try {
    const res = await fetch(commentsUrl(tenant), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(toDbalRow(comment, tenant)),
    })
    return res.ok
  } catch {
    return false
  }
}

/** True when the comment was removed. */
export async function deleteComment(
  tenant: string,
  id: string
): Promise<boolean> {
  try {
    const res = await fetch(`${commentsUrl(tenant)}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}
