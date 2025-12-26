import { initializePackageSystem } from '@/lib/package-lib/package-loader'

export async function initializePackages() {
  await initializePackageSystem()
}
