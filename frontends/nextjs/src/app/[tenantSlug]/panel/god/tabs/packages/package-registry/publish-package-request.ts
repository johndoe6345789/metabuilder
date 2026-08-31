const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/** POST to create a new GodPackage, or PUT to update one that already
 *  published -- kept apart from the hook so the request shape can be
 *  exercised without mounting a component. */
export function publishPackageRequest(
  payload: Record<string, unknown>,
  publishedId: string | null,
  tenant: string
): Promise<Response> {
  if (publishedId != null) {
    return fetch(`${DBAL}/${tenant}/core/GodPackage/${publishedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })
  }
  return fetch(`${DBAL}/${tenant}/core/GodPackage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, createdAt: Date.now() }),
    signal: AbortSignal.timeout(8000),
  })
}
