/**
 * Which credential each node will use.
 *
 * Only the reference is bound -- the id and the name the workflow
 * declared. Nothing loads secret material here, and nothing needs to:
 * no consumer reads `credentialBindings` yet, so a context carrying real
 * secrets would be a decrypted secret sitting in memory for no reader.
 * When an executor does need one, it should fetch it at the point of use
 * against the run's own tenant, not receive it pre-loaded from here.
 */

import type { CredentialRef, WorkflowDefinition } from '@metabuilder/workflow'

/** The node-to-credential map for this workflow. */
export function bindCredentials(
  workflow: Pick<WorkflowDefinition, 'credentials'>
): Map<string, CredentialRef> {
  const bindings = new Map<string, CredentialRef>()
  for (const binding of workflow.credentials) {
    bindings.set(binding.nodeId, {
      id: binding.credentialId,
      name: binding.credentialName,
    })
  }
  return bindings
}
