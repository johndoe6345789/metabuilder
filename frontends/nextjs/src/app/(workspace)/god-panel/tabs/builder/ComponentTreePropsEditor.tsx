'use client'

import { Typography } from '@/m3'
import type { TreeNode } from './builder-registry'
import { ComponentTreeButtonProps } from './ComponentTreeButtonProps'
import { ComponentTreeContainerProps } from './ComponentTreeContainerProps'
import { ComponentTreeTextProps } from './ComponentTreeTextProps'

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
      <ComponentTreeTextProps
        value={propText(p.text)}
        onChange={text => {
          onChange({ text })
        }}
      />
    )
  }
  if (node.type === 'button') {
    return (
      <ComponentTreeButtonProps
        label={propText(p.label)}
        runWorkflow={Boolean(p.runWorkflow)}
        onChange={onChange}
      />
    )
  }
  if (node.type === 'container') {
    return (
      <ComponentTreeContainerProps
        direction={typeof p.direction === 'string' ? p.direction : undefined}
        gap={propText(p.gap, '12')}
        onChange={onChange}
      />
    )
  }
  return (
    <Typography variant="body2" color="text.secondary">
      No editable properties.
    </Typography>
  )
}
