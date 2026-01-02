import { loadPackage } from './load-package'

export async function packageExists(packageId: string): Promise<boolean> {
  const pkg = await loadPackage(packageId)
  return pkg !== null
}
