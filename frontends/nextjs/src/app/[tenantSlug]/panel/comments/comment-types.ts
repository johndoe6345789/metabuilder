/**
 * The community board's rows.
 *
 * ProfileComment lives under the pastebin package
 * (entities/pastebin/profile_comment.json), not core -- the route is
 * /{tenant}/{package}/{Entity}, with Entity taken from the schema's own
 * "entity" field in PascalCase, not from the filename.
 */

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export const COMMENTS_URL = `${DBAL_URL}/system/pastebin/ProfileComment`

export interface Comment {
  id: string
  userId: string
  username: string
  content: string
  createdAt: number
}

export interface DbalComment {
  id: string
  authorId: string
  authorUsername: string
  content: string
  createdAt?: number
}

/** One stored row as the board reads it. */
export function toComment(row: DbalComment, now: number = Date.now()): Comment {
  return {
    id: row.id,
    userId: row.authorId,
    username: row.authorUsername,
    content: row.content,
    createdAt: row.createdAt ?? now,
  }
}

/** The row a new comment writes. */
export function toDbalRow(comment: Comment): Record<string, unknown> {
  return {
    id: comment.id,
    // Posting to the shared community board, not a specific user's wall,
    // so this page has no other profile to target.
    profileUserId: comment.userId,
    authorId: comment.userId,
    authorUsername: comment.username,
    content: comment.content,
    createdAt: comment.createdAt,
    tenantId: 'system',
  }
}
