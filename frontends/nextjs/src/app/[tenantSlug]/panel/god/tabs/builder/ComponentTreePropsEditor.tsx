'use client'

import { TextField, Typography } from '@/m3'
import type { TreeNode } from './builder-registry'
import { ComponentTreeCommonProps } from './ComponentTreeCommonProps'
import { ComponentTreeButtonProps } from './ComponentTreeButtonProps'
import { ComponentTreeContainerProps } from './ComponentTreeContainerProps'
import { ComponentTreeTextProps } from './ComponentTreeTextProps'
import { ComponentTreeImageProps } from './ComponentTreeImageProps'
import { ComponentTreeAvatarProps } from './ComponentTreeAvatarProps'
import { ComponentTreeStatProps } from './ComponentTreeStatProps'
import { ComponentTreeListItemProps } from './ComponentTreeListItemProps'
import { ComponentTreeGridProps } from './ComponentTreeGridProps'
import s from './ComponentTreeTab.module.scss'

const propText = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'
    ? String(value)
    : fallback

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
        <TypeProps node={node} onChange={onChange} />
      </div>
    </>
  )
}

function TypeProps({
  node,
  onChange,
}: {
  node: TreeNode
  onChange: (patch: Record<string, unknown>) => void
}) {
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
        href={propText(p.href)}
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
  if (node.type === 'grid') {
    return (
      <ComponentTreeGridProps
        columns={propText(p.columns, '3')}
        gap={propText(p.gap, '16')}
        onChange={onChange}
      />
    )
  }
  if (node.type === 'divider') {
    return (
      <TextField
        size="small"
        label="Margin"
        value={propText(p.margin, '16')}
        onChange={event => {
          onChange({ margin: Number(event.target.value) || 0 })
        }}
      />
    )
  }
  if (node.type === 'image') {
    return (
      <ComponentTreeImageProps
        src={propText(p.src)}
        alt={propText(p.alt)}
        onChange={onChange}
      />
    )
  }
  if (node.type === 'avatar') {
    return (
      <ComponentTreeAvatarProps
        initials={propText(p.initials, 'U')}
        src={propText(p.src)}
        size={propText(p.size, 'md')}
        onChange={onChange}
      />
    )
  }
  if (node.type === 'stat') {
    return (
      <ComponentTreeStatProps
        label={propText(p.label)}
        value={propText(p.value)}
        onChange={onChange}
      />
    )
  }
  if (node.type === 'list-item') {
    return (
      <ComponentTreeListItemProps
        icon={propText(p.icon, 'notifications')}
        title={propText(p.title)}
        description={propText(p.description)}
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
