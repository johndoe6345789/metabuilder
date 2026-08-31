'use client'

/**
 * The properties every node has, whatever its type -- identity, styling and
 * accessibility -- in the spirit of a VB6 property sheet: select a control in
 * the tree, edit its attributes here.
 *
 * These map to real DOM attributes and are applied centrally by renderNode
 * (see COMMON_PROP_KEYS in blocks/common-attrs), so they work on every
 * block type rather than only the handful with bespoke editors.
 */

import { useId, useState } from 'react'
import type { TreeNode } from './builder-registry'
import { PropSection } from './component-tree-common-props/PropSection'
import { IdentityFields } from './component-tree-common-props/IdentityFields'
import { StyleField } from './component-tree-common-props/StyleField'
import { A11yFields } from './component-tree-common-props/A11yFields'
import s from './ComponentTreeTab.module.scss'

type Section = 'identity' | 'style' | 'a11y'

type Props = {
  node: TreeNode
  tenant: string
  duplicateId: boolean
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeCommonProps({
  node,
  tenant,
  duplicateId,
  onChange,
}: Props) {
  const [open, setOpen] = useState<Section | null>('identity')
  const uid = useId()
  const p = node.props

  const toggle = (key: Section) => () => {
    setOpen(open === key ? null : key)
  }

  return (
    <div className={s.propSections}>
      <PropSection
        id={`${uid}-identity`}
        label="Identity"
        isOpen={open === 'identity'}
        onToggle={toggle('identity')}
      >
        <IdentityFields
          props={p}
          duplicateId={duplicateId}
          onChange={onChange}
        />
      </PropSection>

      <PropSection
        id={`${uid}-style`}
        label="Style"
        isOpen={open === 'style'}
        onToggle={toggle('style')}
      >
        <StyleField props={p} tenant={tenant} onChange={onChange} />
      </PropSection>

      <PropSection
        id={`${uid}-a11y`}
        label="Accessibility"
        isOpen={open === 'a11y'}
        onToggle={toggle('a11y')}
      >
        <A11yFields props={p} onChange={onChange} />
      </PropSection>
    </div>
  )
}
