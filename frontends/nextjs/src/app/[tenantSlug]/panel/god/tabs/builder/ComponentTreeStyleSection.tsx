'use client'

/**
 * Point-and-click styling: which of the tenant's named CSS classes apply to
 * this node. Kept visible, not tucked under "More options" -- unlike
 * identity and accessibility this isn't something that can be inferred, and
 * it's meant to be the main way anyone styles a block.
 */

import type { TreeNode } from './builder-registry'
import { StyleField } from './component-tree-common-props/StyleField'
import s from './ComponentTreeTab.module.scss'

type Props = {
  node: TreeNode
  tenant: string
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeStyleSection({ node, tenant, onChange }: Props) {
  return (
    <div className={s.propTypeGroup}>
      <div className={s.propTypeTitle}>Style</div>
      <StyleField props={node.props} tenant={tenant} onChange={onChange} />
    </div>
  )
}
