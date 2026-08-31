import { dbalPost } from '../seed/dbal-writes'
import { SEED_PAGE_CONFIGS } from '../seed/page-configs'
import { trackSeedAttempt } from './track-seed-attempt'
import type { SeedResults } from './types'

export async function seedPageConfigs(results: SeedResults): Promise<void> {
  for (const page of SEED_PAGE_CONFIGS) {
    await trackSeedAttempt(
      results,
      'pages',
      `Created page: ${page.path}`,
      `page ${page.path}`,
      () => dbalPost('PageConfig', page)
    )
  }
}
