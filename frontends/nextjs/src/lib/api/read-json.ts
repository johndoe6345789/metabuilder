/**
 * Read JSON from request body with type casting
 * @param request - The incoming request object
 * @returns Parsed JSON body cast to type T
 */
export async function readJson<T = unknown>(request: Request): Promise<T> {
  return await request.json() as T
}
