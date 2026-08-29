/** What to tell someone whose workflow failed validation. */

import type { ValidationError } from '@metabuilder/workflow'

const MAX_SUGGESTIONS = 5

const SUGGESTIONS: Record<string, string> = {
  MISSING_REQUIRED_FIELD: 'Add the missing parameter to the node.',
  INVALID_NODE_TYPE: 'Use a valid node type from the registry.',
  INVALID_CONNECTION_TARGET_NODE: 'Ensure target node exists in workflow.',
  TYPE_MISMATCH: 'Change parameter type to match definition.',
  MISSING_TENANT_ID: 'Workflow must belong to a tenant.',
  TIMEOUT_TOO_SHORT: 'Increase timeout for more reliable execution.',
  DUPLICATE_NODE_NAME: 'Use unique names for all nodes.',
  CIRCULAR_DEPENDENCY: 'Remove circular connections between nodes.',
}

export function suggestionFor(error: ValidationError): string {
  return (
    SUGGESTIONS[error.code.toUpperCase()] ?? 'Fix this validation issue and retry.'
  )
}

/** The distinct advice for a batch of errors, capped so it stays readable. */
export function recoverySuggestions(errors: ValidationError[]): string[] {
  const suggestions = new Set<string>()
  for (const error of errors) {
    suggestions.add(suggestionFor(error))
  }
  return [...suggestions].slice(0, MAX_SUGGESTIONS)
}
