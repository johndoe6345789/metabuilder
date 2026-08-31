import { dbalUpsert, seedPageTree } from '../seed/dbal-writes'
import { DEMO_SITE_PAGE_CONFIGS } from '../seed/demo-pages'
import { trackSeedAttempt } from './track-seed-attempt'
import type { SeedResults } from './types'

export async function seedDemoPages(results: SeedResults): Promise<void> {
  for (const page of DEMO_SITE_PAGE_CONFIGS) {
    const { tree, ...row } = page as Record<string, unknown> & {
      tree?: Record<string, unknown>
    }

    await trackSeedAttempt(
      results,
      'pages',
      `Upserted demo page: ${page.path}`,
      `demo page ${page.path}`,
      async () => {
        const treeId =
          tree === undefined
            ? null
            : await seedPageTree(
                String(row.id),
                String(row.title ?? row.path),
                tree
              )
        return dbalUpsert('PageConfig', page.id, { ...row, pageTreeId: treeId })
      }
    )
  }
}
