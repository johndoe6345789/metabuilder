/**
 * Close the DBAL adapter connection
 */

import { getAdapter } from './get-adapter'

export async function closeAdapter(): Promise<void> {
  const adapter = getAdapter()
  await adapter.close()
}
