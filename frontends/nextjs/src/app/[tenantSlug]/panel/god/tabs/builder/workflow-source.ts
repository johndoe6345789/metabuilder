/**
 * The name under which the tenant's published workflows are offered to a
 * property field, so a prop can ask for them with `source`.
 *
 * A constant rather than a loose string because it has to match in two
 * places that are otherwise unrelated: the block's declared schema
 * (block-props.ts) and the panel that supplies option lists.
 */
export const WORKFLOW_SOURCE = 'workflows'
