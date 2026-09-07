import type { WorkflowNode } from '@/workflow-editor'
import { writeValue } from './param-value'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Writes each node's row, then its parameter rows.
 *
 * Takes the editor's own WorkflowNode, which is what it has always been
 * handed. The parameter used to be typed as the DBAL row shape coming
 * back the other way -- `parameters` rather than `config`, and a
 * [number, number] position rather than {x, y} -- and reached through a
 * double-unknown cast. So `node.parameters` was undefined on every node
 * and not one parameter row was ever written: a workflow published from
 * the panel had its steps and their order, and nothing telling any of
 * them what to do. Every node also landed at 0,0.
 *
 * Nothing reported it. The writes all succeeded; the step failed later,
 * inside the daemon, on somebody's click.
 *
 * Returns false on the first failed write rather than partially saving.
 */
export async function saveNodes(
  base: string,
  tenant: string,
  workflowId: string,
  nodes: WorkflowNode[]
): Promise<boolean> {
  for (const node of nodes) {
    const nodeId = `${workflowId}__${node.id}`
    const res = await fetch(`${base}/WorkflowNode`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        id: nodeId,
        tenantId: tenant,
        workflowId,
        nodeKey: node.id,
        name: node.name.length > 0 ? node.name : node.id,
        type: node.type,
        // The editor has no typeVersion; the column is the daemon's, and
        // every step it dispatches is version 1.
        typeVersion: 1,
        positionX: node.position.x,
        positionY: node.position.y,
      }),
    })
    if (!res.ok) return false

    if (!(await saveParams(base, tenant, workflowId, nodeId, node.config))) {
      return false
    }
  }
  return true
}

/** One WorkflowNodeParam row per entry in a step's config. */
async function saveParams(
  base: string,
  tenant: string,
  workflowId: string,
  nodeId: string,
  config: Record<string, unknown>
): Promise<boolean> {
  let sortOrder = 0
  for (const [name, raw] of Object.entries(config)) {
    const { valueType, value } = writeValue(raw)
    const p = await fetch(`${base}/WorkflowNodeParam`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        id: `${nodeId}__${name}`,
        tenantId: tenant,
        nodeId,
        workflowId,
        name,
        value,
        valueType,
        // Required by the schema, which also gives it a default of 0 --
        // DBAL checks presence before applying defaults, so leaving it
        // out is a 422 for a field that has one.
        sortOrder,
      }),
    })
    if (!p.ok) return false
    sortOrder += 1
  }
  return true
}
