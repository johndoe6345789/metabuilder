import { initializePackageSystem } from '@/lib/packages/loader/package-loader'

export async function initializePackages() {
  await initializePackageSystem()
}
