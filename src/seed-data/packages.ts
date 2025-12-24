import { initializePackageSystem } from '@/lib/package-loader'

export async function initializePackages() {
  await initializePackageSystem()
}
