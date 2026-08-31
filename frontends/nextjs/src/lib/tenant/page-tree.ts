/**
 * Read and write a page tree as rows.
 *
 * A tree is PageTree (identity) + PageTreeNode (shape, via parentId and
 * sortOrder) + PageTreeProp (one row per property). Two requests reassemble
 * one: all nodes for the tree, all props for the tree. Both carry treeId
 * precisely so neither needs a join the data layer cannot do.
 */

export type { TreeNodeShape } from './page-tree/types'
export { propValueType } from './page-tree/prop-value'
export { loadTree } from './page-tree/load-tree'
export { saveTree } from './page-tree/save-tree'
