import { getAdapter } from '../dbal-client'

export async function deleteComponentNode(nodeId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('ComponentNode', nodeId)
}
