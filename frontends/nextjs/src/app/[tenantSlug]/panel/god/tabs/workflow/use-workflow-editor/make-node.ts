import {
  generateNodeId,
  type NodeType,
  type Position,
  type WorkflowNode,
} from '@/workflow-editor'

/** A new node of @p nt, placed at @p position. */
export function makeNode(nt: NodeType, position: Position): WorkflowNode {
  return {
    id: generateNodeId(),
    type: nt.type,
    name: nt.name,
    position,
    config: { ...nt.defaultConfig },
    inputs: nt.inputs,
    outputs: nt.outputs,
  }
}

/** Roughly a node's height and width, for laying one out below the last. */
const STEP_DOWN = 110
const FIRST = { x: 80, y: 60 }

/**
 * Where to put a step added without a pointer.
 *
 * Dropping says where; clicking does not, so they stack down the canvas in
 * the order they were added -- which is also the order they will usually
 * be wired in, so the arrows come out short and straight rather than
 * crossing back over themselves.
 */
export function nextStepPosition(count: number): Position {
  return { x: FIRST.x, y: FIRST.y + count * STEP_DOWN }
}
