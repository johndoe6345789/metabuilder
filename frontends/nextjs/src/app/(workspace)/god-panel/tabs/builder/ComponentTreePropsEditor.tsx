'use client'

import { Button, TextField, Typography } from '@/m3'
import type { TreeNode } from './builder-registry'
import s from './ComponentTreeTab.module.scss'

const propText = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'
    ? String(value)
    : fallback

type Props = {
  node: TreeNode
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreePropsEditor({ node, onChange }: Props) {
  const p = node.props
  if (node.type === 'heading' || node.type === 'text') {
    return (
      <TextField
        size="small"
        fullWidth
        label="Text"
        value={propText(p.text)}
        onChange={event => {
          onChange({ text: event.target.value })
        }}
      />
    )
  }
  if (node.type === 'button') {
    return (
      <div className={s.propCol}>
        <TextField
          size="small"
          fullWidth
          label="Label"
          value={propText(p.label)}
          onChange={event => {
            onChange({ label: event.target.value })
          }}
        />
        <Button
          size="small"
          variant={p.runWorkflow ? 'contained' : 'outlined'}
          onClick={() => {
            onChange({ runWorkflow: !p.runWorkflow })
          }}
        >
          {p.runWorkflow ? '✓ Runs workflow on click' : '⚡ Wire workflow on click'}
        </Button>
      </div>
    )
  }
  if (node.type === 'container') {
    return (
      <div className={s.propRow}>
        <Button
          size="small"
          variant={p.direction === 'row' ? 'contained' : 'outlined'}
          onClick={() => {
            onChange({ direction: 'row' })
          }}
        >
          Row
        </Button>
        <Button
          size="small"
          variant={p.direction !== 'row' ? 'contained' : 'outlined'}
          onClick={() => {
            onChange({ direction: 'column' })
          }}
        >
          Column
        </Button>
        <TextField
          size="small"
          label="Gap"
          value={propText(p.gap, '12')}
          onChange={event => {
            onChange({ gap: Number(event.target.value) || 0 })
          }}
        />
      </div>
    )
  }
  return (
    <Typography variant="body2" color="text.secondary">
      No editable properties.
    </Typography>
  )
}
