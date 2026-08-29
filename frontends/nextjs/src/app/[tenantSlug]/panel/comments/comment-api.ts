/** The three calls the community board makes to the data layer. */

import { readList } from '@/lib/db/read-list'
import {
  COMMENTS_URL,
  toComment,
  toDbalRow,
  type Comment,
  type DbalComment,
} from './comment-types'

/** Every comment on the board, or null when it cannot be reached. */
export async function fetchComments(): Promise<Comment[] | null> {
  try {
    const res = await fetch(COMMENTS_URL, {
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
export async function postComment(comment: Comment): Promise<boolean> {
  try {
    const res = await fetch(COMMENTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(toDbalRow(comment)),
    })
    return res.ok
  } catch {
    return false
  }
}

/** True when the comment was removed. */
export async function deleteComment(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${COMMENTS_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}
