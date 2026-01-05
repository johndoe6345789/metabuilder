/**
 * Read JSON from request (stub)
 */

export async function readJson<T = unknown>(request: Request): Promise<T> {
  // TODO: Implement JSON reading with validation
  return await request.json() as T
}
