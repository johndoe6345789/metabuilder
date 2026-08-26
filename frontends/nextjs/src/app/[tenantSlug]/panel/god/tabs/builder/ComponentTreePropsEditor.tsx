'use client'

/**
 * The selected node's properties: the ones every node has, then the ones its
 * own type defines.
 *
 * There used to be a hand-written editor per type here, for ten of the
 * thirty-seven types. They are gone: each block declares its properties in
 * block-props.ts, and one editor renders that declaration. The bespoke
 * editors had already drifted from what the blocks read -- a button's
 * variant and an image's corner radius were rendered but not editable --
 * which is what two sources of truth do.
 */

import type { TreeNode } from './builder-registry'
import { ComponentTreeCommonProps } from './ComponentTreeCommonProps'
import { ComponentTreeAutoProps } from './ComponentTreeAutoProps'
import s from './ComponentTreeTab.module.scss'

type Props = {
  node: TreeNode
  tenant: string
  duplicateId: boolean
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreePropsEditor({
  node,
  tenant,
  duplicateId,
  onChange,
}: Props) {
  return (
    <>
      <ComponentTreeCommonProps
        node={node}
        tenant={tenant}
        duplicateId={duplicateId}
        onChange={onChange}
      />
      <div className={s.propTypeGroup}>
        <div className={s.propTypeTitle}>{node.type}</div>
        <ComponentTreeAutoProps node={node} onChange={onChange} />
      </div>
    </>
  )
}
