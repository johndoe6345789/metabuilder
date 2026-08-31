import { dbalPost } from '../seed/dbal-writes'
import { SEED_PACKAGES } from '../seed/packages'
import { trackSeedAttempt } from './track-seed-attempt'
import type { SeedResults } from './types'

export async function seedInstalledPackages(
  results: SeedResults
): Promise<void> {
  for (const pkg of SEED_PACKAGES) {
    await trackSeedAttempt(
      results,
      'packages',
      `Created package: ${pkg.packageId}`,
      `package ${pkg.packageId}`,
      () =>
        dbalPost('InstalledPackage', {
          ...pkg,
          installedAt: Math.floor(Date.now() / 1000),
        })
    )
  }
}
