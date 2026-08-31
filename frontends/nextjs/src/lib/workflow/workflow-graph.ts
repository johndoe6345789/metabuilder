/**
 * Read and write a workflow's graph as rows.
 *
 * WorkflowNode is one row per step, WorkflowNodeParam one per parameter, and
 * WorkflowEdge one per connection. The in-memory shape the editor and the
 * runner work with is unchanged -- only storage moved, so nothing above this
 * boundary had to learn about rows.
 */

export type { GraphNode, GraphEdges } from './workflow-graph/types'
export { loadGraph } from './workflow-graph/load-graph'
export { saveGraph } from './workflow-graph/save-graph'
