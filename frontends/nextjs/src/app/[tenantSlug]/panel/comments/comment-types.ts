/**
 * The community board's rows.
 *
 * ProfileComment lives under the pastebin package
 * (entities/pastebin/profile_comment.json), not core -- the route is
 * /{tenant}/{package}/{Entity}, with Entity taken from the schema's own
 * "entity" field in PascalCase, not from the filename.
 */

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/**
 * The board belongs to the community whose page it is.
 *
 * This was the constant `/system/pastebin/ProfileComment`, and every new
 * row carried `tenantId: 'system'` -- so every community on the instance
 * posted into, and read, one shared board. A founder's members saw
 * strangers' comments as their own community's, and the founder could
 * delete them. The same hardcoded `system` as the theme, CSS, SMTP,
 * schema and stream-app screens.
 */
export const commentsUrl = (tenant: string): string =>
  `${DBAL_URL}/${tenant}/pastebin/ProfileComment`

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

/** The row a new comment writes, in the community it was written in. */
export function toDbalRow(
  comment: Comment,
  tenant: string
): Record<string, unknown> {
  return {
    id: comment.id,
    // Posting to the shared community board, not a specific user's wall,
    // so this page has no other profile to target.
    profileUserId: comment.userId,
    authorId: comment.userId,
    authorUsername: comment.username,
    content: comment.content,
    createdAt: comment.createdAt,
    tenantId: tenant,
  }
}
