// TODO: Implement JSON package loading
export interface JSONComponent {
  type: string
  props?: Record<string, any>
  name?: string
  render?: any
}
export const loadJsonPackage = async (packageId: string) => null
