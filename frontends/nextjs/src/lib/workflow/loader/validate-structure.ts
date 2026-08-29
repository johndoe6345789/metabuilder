/**
 * The structural rules a workflow must satisfy before it can run.
 *
 * Each throws on the first thing wrong, which is what the loader wants --
 * it catches and reports one failure. Split out so the rules can be
 * exercised directly, without a loader, a cache or a promise.
 */

import type { WorkflowDefinition } from '@metabuilder/workflow'

/** Nodes and connections exist, and there is at least one node. */
export function validateWorkflowStructure(workflow: WorkflowDefinition): void {
  if (!Array.isArray(workflow.nodes)) {
    throw new Error('Workflow must have nodes array')
  }
  if (typeof workflow.connections !== 'object') {
    throw new Error('Workflow must have connections object')
  }
  if (workflow.nodes.length === 0) {
    throw new Error('Workflow must have at least one node')
  }
}

/** Every node is complete, and no id or name is used twice. */
export function validateNodes(workflow: WorkflowDefinition): void {
  const ids = new Set<string>()
  const names = new Set<string>()

  for (const node of workflow.nodes) {
    if (node.id.length === 0) throw new Error('Node must have id')
    if (node.name.length === 0) {
      throw new Error(`Node ${node.id} must have name`)
    }
    if (node.nodeType.length === 0) {
      throw new Error(`Node ${node.id} must have nodeType`)
    }
    if (ids.has(node.id)) throw new Error(`Duplicate node id: ${node.id}`)
    ids.add(node.id)
    if (names.has(node.name)) {
      throw new Error(`Duplicate node name: ${node.name}`)
    }
    names.add(node.name)
  }
}

/** Every connection names nodes that exist. */
export function validateConnections(workflow: WorkflowDefinition): void {
  const ids = new Set(workflow.nodes.map(n => n.id))

  for (const [sourceId, outputs] of Object.entries(workflow.connections)) {
    if (!ids.has(sourceId)) {
      throw new Error(`Connection source node not found: ${sourceId}`)
    }
    for (const indices of Object.values(outputs)) {
      for (const targets of Object.values(indices)) {
        for (const target of targets) {
          if (target.node.length > 0 && !ids.has(target.node)) {
            throw new Error(`Connection target node not found: ${target.node}`)
          }
        }
      }
    }
  }
}

/**
 * The isolation rules: a workflow belongs to a tenant, and none of its
 * variables outlive the run that reads them.
 */
export function validateMultiTenant(workflow: WorkflowDefinition): void {
  if (workflow.tenantId.length === 0) {
    throw new Error('Workflow must have tenantId for multi-tenant safety')
  }
  for (const [name, definition] of Object.entries(workflow.variables)) {
    if (definition.scope === 'global') {
      throw new Error(
        `Variable ${name} has global scope. ` +
          'Only workflow/execution scope allowed.'
      )
    }
  }
}

/** Every rule, in the order the loader applies them. */
export function validateAll(workflow: WorkflowDefinition): void {
  validateWorkflowStructure(workflow)
  validateNodes(workflow)
  validateConnections(workflow)
  validateMultiTenant(workflow)
}
