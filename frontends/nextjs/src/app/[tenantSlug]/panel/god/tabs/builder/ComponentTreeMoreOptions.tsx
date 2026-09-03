'use client'

/**
 * Everything that already has a sensible default and rarely needs a human's
 * attention: id/name/test-id (auto-filled, see auto-identity.ts),
 * accessibility labels (which that same auto-fill can also draw on), and
 * any of the block's own fields beyond the one primary field shown
 * prominently above (see ComponentTreePrimaryField). Collapsed by default
 * so the panel opens on the field that actually matters.
 */

import { useId, useState } from 'react'
import type { TreeNode } from './builder-registry'
import { PropSection } from './component-tree-common-props/PropSection'
import { IdentityFields } from './component-tree-common-props/IdentityFields'
import { A11yFields } from './component-tree-common-props/A11yFields'
import { ComponentTreeAutoProps } from './ComponentTreeAutoProps'
import { primaryFieldName } from './primary-field'

type Props = {
  node: TreeNode
  duplicateId: boolean
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeMoreOptions({
  node,
  duplicateId,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const uid = useId()

  return (
    <PropSection
      id={`${uid}-more`}
      label="More options"
      isOpen={open}
      onToggle={() => {
        setOpen(o => !o)
      }}
    >
      <A11yFields props={node.props} onChange={onChange} />
      <IdentityFields
        props={node.props}
        duplicateId={duplicateId}
        onChange={onChange}
      />
      <ComponentTreeAutoProps
        node={node}
        onChange={onChange}
        excludeField={primaryFieldName(node.type)}
      />
    </PropSection>
  )
}
