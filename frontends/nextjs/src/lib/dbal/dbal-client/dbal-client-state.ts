import type { DBALClient } from '@/lib/dbal-stub'

export const dbalClientState: { instance: DBALClient | null } = {
  instance: null,
}
