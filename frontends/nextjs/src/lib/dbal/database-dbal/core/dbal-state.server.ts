import type { DBALClient } from '@/lib/dbal-stub'

export const dbalState: {
  client: DBALClient | null
  initialized: boolean
} = {
  client: null,
  initialized: false,
}
