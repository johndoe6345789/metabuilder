import type { DBALClient } from '@/dbal'

export const dbalClientState: { instance: DBALClient | null } = {
  instance: null,
}
