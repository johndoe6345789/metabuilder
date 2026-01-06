/**
 * Load JSON package (stub)
 */

export interface JSONPackage {
  id: string
  components: unknown[]
  metadata: unknown
}

export function loadJSONPackage(_packageId: string): JSONPackage | null {
  // TODO: Implement JSON package loading
  return null
}
