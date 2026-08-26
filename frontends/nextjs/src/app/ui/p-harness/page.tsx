'use client'
// TEMPORARY harness. Delete after use.
import { useState } from 'react'
import { ComponentTreePropsEditor } from '@/app/[tenantSlug]/panel/god/tabs/builder/ComponentTreePropsEditor'
import type { TreeNode } from '@/components/blocks/block-registry'

const TYPES = ['button', 'm3.alert', 'm3.tooltip', 'image', 'container', 'm3.spinner']

export default function PHarness() {
  const [type, setType] = useState('button')
  const [node, setNode] = useState<TreeNode>({ id: 'n1', type: 'button', props: {}, children: [] })
  return (
    <div style={{ padding: 16, width: 380 }}>
      <select
        id="type-picker"
        value={type}
        onChange={e => { setType(e.target.value); setNode({ id: 'n1', type: e.target.value, props: {}, children: [] }) }}
      >
        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <ComponentTreePropsEditor
        node={node}
        tenant="system"
        duplicateId={false}
        onChange={patch => { setNode(n => ({ ...n, props: { ...n.props, ...patch } })) }}
      />
      <pre id="out" style={{fontSize:11}}>{JSON.stringify(node.props)}</pre>
    </div>
  )
}
