/**
 * Which DBAL operation a REST request means.
 *
 * Split out of routing/index.ts: this is the front door of the versioned API
 * and the mapping is pure, but it sat inside a 460-line module and had no
 * test.
 */

export type Operation =
  'list' | 'read' | 'create' | 'update' | 'delete' | 'action' | 'unknown'

/**
 * A custom action wins over everything: POST /posts/123/like is an action,
 * not an update of 123. Otherwise an id means the request is about one
 * record and its absence means the collection. Anything else -- a DELETE
 * with no id, a PUT to a collection -- is deliberately 'unknown' rather than
 * guessed at.
 */
export function operationFor(
  method: string,
  id?: string,
  action?: string
): Operation {
  if (action !== undefined && action.length > 0) return 'action'

  if (id !== undefined && id.length > 0) {
    if (method === 'GET') return 'read'
    if (method === 'PUT' || method === 'PATCH') return 'update'
    if (method === 'DELETE') return 'delete'
    return 'unknown'
  }

  if (method === 'GET') return 'list'
  if (method === 'POST') return 'create'
  return 'unknown'
}
