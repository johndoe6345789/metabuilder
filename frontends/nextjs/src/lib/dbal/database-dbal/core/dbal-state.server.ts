import type { DBALClient } from '@/dbal'

export const dbalState: {
  client: DBALClient | null
  initialized: boolean
} = {
  client: null,
  initialized: false,
}
