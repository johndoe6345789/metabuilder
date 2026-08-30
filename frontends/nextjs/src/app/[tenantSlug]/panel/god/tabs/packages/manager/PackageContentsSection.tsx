'use client'

import { Chip, Typography } from '@/m3'
import type { PackageRef, RegistryPackage } from '../use-package-registry'
import { PackageContentPicker } from './PackageContentPicker'
export interface PackageContentsSectionProps {
  tenant: string
  p: RegistryPackage
  onAddWorkflow: (id: string, item: PackageRef) => void
  onAddPageConfig: (id: string, item: PackageRef) => void
  onReorderWorkflows: (list: PackageRef[]) => void
  onReorderPages: (list: PackageRef[]) => void
  onRemoveWorkflow: (id: string) => void
  onRemovePage: (id: string) => void
  onToggleTheme: () => void
}

const reorder = <T,>(items: T[], from: number, to: number): T[] => {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  if (moved !== undefined) next.splice(to, 0, moved)
  return next
}

/** Workflows, pages, and the current-theme toggle a package carries. */
export function PackageContentsSection(props: PackageContentsSectionProps) {
  const { p } = props

  return (
    <>
      <Typography variant="caption" color="text.secondary">
        Package contents
      </Typography>
      <PackageContentPicker
        tenant={props.tenant}
        packageName="core"
        entity="Workflow"
        placeholder="Search workflows to add…"
        getLabel={r => (typeof r.name === 'string' ? r.name : String(r.id))}
        items={p.workflows}
        onSelect={item => {
          props.onAddWorkflow(p.manifest.id, item)
        }}
        onReorder={(from, to) => {
          props.onReorderWorkflows(reorder(p.workflows, from, to))
        }}
        onRemove={props.onRemoveWorkflow}
      />
      <PackageContentPicker
        tenant={props.tenant}
        packageName="access"
        entity="PageConfig"
        placeholder="Search pages to add…"
        getLabel={r => (typeof r.title === 'string' ? r.title : String(r.id))}
        items={p.pageConfigs}
        onSelect={item => {
          props.onAddPageConfig(p.manifest.id, item)
        }}
        onReorder={(from, to) => {
          props.onReorderPages(reorder(p.pageConfigs, from, to))
        }}
        onRemove={props.onRemovePage}
      />

      <Chip
        label={
          p.themeId != null
            ? '✓ Includes current theme'
            : 'Include current theme'
        }
        size="small"
        color={p.themeId != null ? 'primary' : 'default'}
        variant={p.themeId != null ? 'filled' : 'outlined'}
        onClick={props.onToggleTheme}
      />
    </>
  )
}
