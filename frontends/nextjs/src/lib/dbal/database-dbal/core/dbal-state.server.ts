import type { DBALClient as StubDBALClient } from '@/lib/dbal-stub'
import type { DBALClient as RealDBALClient } from '@/dbal/ts/src'

export const dbalState: {
  client: StubDBALClient | RealDBALClient | null
  initialized: boolean
} = {
  client: null,
  initialized: false,
}
