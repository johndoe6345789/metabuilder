/**
 * Load JSON package (stub)
 */

export interface JSONPackage {
  id: string
  components: unknown[]
  metadata: unknown
}

export async function loadJSONPackage(packageId: string): Promise<JSONPackage | null> {
  // TODO: Implement JSON package loading
  return null
}
