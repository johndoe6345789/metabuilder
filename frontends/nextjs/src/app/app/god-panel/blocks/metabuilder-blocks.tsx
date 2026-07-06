'use client'

/**
 * MetaBuilder self-hosting building blocks.
 *
 * MetaBuilder's own high-level tools are exposed here as catalog entries so a
 * user can drop them into a component tree and assemble their own copy of
 * MetaBuilder inside MetaBuilder. Each block is a zero-prop, self-provisioning
 * wrapper so it can be placed declaratively without wiring.
 */

import type { ComponentType } from 'react'
import { WorkflowEditor } from '../tabs/workflow/WorkflowEditor'
import { useGodWorkflow } from '../tabs/workflow/use-god-workflow'
import { PackageManager } from '../tabs/packages/PackageManager'
import { SchemaEditor } from '@/components/schema-editor'

export function WorkflowEditorBlock() {
  const { workflow, save } = useGodWorkflow()
  return <WorkflowEditor workflow={workflow} onChange={save} onSave={save} />
}

export function PackageManagerBlock() {
  return <PackageManager tenant="system" />
}

export function SchemaEditorBlock() {
  return <SchemaEditor tenantId="system" />
}

export interface BlockEntry {
  type: string
  name: string
  description: string
  icon: string
  component: ComponentType
}

/** The self-hosting catalog: MetaBuilder's own tools as tree-placeable blocks. */
export const METABUILDER_BLOCKS: BlockEntry[] = [
  {
    type: 'mb.WorkflowEditor',
    name: 'Workflow Editor',
    description: 'n8n-style visual workflow builder',
    icon: 'account_tree',
    component: WorkflowEditorBlock,
  },
  {
    type: 'mb.PackageManager',
    name: 'Package Manager',
    description: 'Create, install and manage packages',
    icon: 'deployed_code',
    component: PackageManagerBlock,
  },
  {
    type: 'mb.SchemaEditor',
    name: 'Schema Editor',
    description: 'Define entity schemas for the DBAL',
    icon: 'schema',
    component: SchemaEditorBlock,
  },
]

/** Name → component map for the declarative renderer / component registry. */
export const METABUILDER_BLOCK_REGISTRY: Record<string, ComponentType> =
  Object.fromEntries(METABUILDER_BLOCKS.map((b) => [b.type, b.component]))
