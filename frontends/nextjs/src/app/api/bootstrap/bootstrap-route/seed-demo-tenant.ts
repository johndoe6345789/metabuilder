import { dbalUpsert } from '../seed/dbal-writes'
import { DEMO_SITE_TENANT } from '../seed/demo-tenant'
import { trackSeedAttempt } from './track-seed-attempt'
import type { SeedResults } from './types'

export async function seedDemoTenant(results: SeedResults): Promise<void> {
  await trackSeedAttempt(
    results,
    'pages',
    'Created demo tenant: demo-site',
    'demo tenant',
    () => dbalUpsert('Tenant', DEMO_SITE_TENANT.id, DEMO_SITE_TENANT)
  )
}
