'use client'

/**
 * The selected node's properties, ordered so the one decision that matters
 * comes first: its own primary field (see ComponentTreePrimaryField), then
 * point-and-click styling, then everything else -- identity, accessibility,
 * and the block's secondary settings -- tucked under one disclosure since
 * those are either auto-inferred already or rarely touched.
 *
 * There used to be a hand-written editor per type here, for ten of the
 * thirty-seven types. They are gone: each block declares its properties in
 * block-props.ts, and this editor renders that declaration. The bespoke
 * editors had already drifted from what the blocks read -- a button's
 * variant and an image's corner radius were rendered but not editable --
 * which is what two sources of truth do.
 */

import type { TreeNode } from './builder-registry'
import { ComponentTreePrimaryField } from './ComponentTreePrimaryField'
import { ComponentTreeStyleSection } from './ComponentTreeStyleSection'
import { ComponentTreeMoreOptions } from './ComponentTreeMoreOptions'
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
    <div className={s.propCol}>
      <ComponentTreePrimaryField node={node} onChange={onChange} />
      <ComponentTreeStyleSection
        node={node}
        tenant={tenant}
        onChange={onChange}
      />
      <ComponentTreeMoreOptions
        node={node}
        duplicateId={duplicateId}
        onChange={onChange}
      />
    </div>
  )
}
