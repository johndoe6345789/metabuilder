import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

interface WorkflowEditorMockProps {
  workflow: { id: string }
  onChange: unknown
  onSave: unknown
}

const godWorkflow = vi.hoisted(() => ({
  useGodWorkflow: vi.fn(() => ({ workflow: { id: 'wf1' }, save: vi.fn() })),
}))
vi.mock('../tabs/workflow/use-god-workflow', () => godWorkflow)

const workflowEditor = vi.hoisted(() => ({
  WorkflowEditor: vi.fn((props: WorkflowEditorMockProps) => (
    <div data-testid="workflow-editor">{props.workflow.id}</div>
  )),
}))
vi.mock('../tabs/workflow/WorkflowEditor', () => workflowEditor)

vi.mock('../tabs/packages/PackageManager', () => ({
  PackageManager: vi.fn((props: { tenant: string }) => (
    <div data-testid="package-manager">{props.tenant}</div>
  )),
}))

vi.mock('@/components/schema-editor', () => ({
  SchemaEditor: vi.fn((props: { tenantId: string }) => (
    <div data-testid="schema-editor">{props.tenantId}</div>
  )),
}))

import {
  METABUILDER_BLOCKS,
  METABUILDER_BLOCK_REGISTRY,
  WorkflowEditorBlock,
  PackageManagerBlock,
  SchemaEditorBlock,
} from './metabuilder-blocks'

describe('MetaBuilder self-hosting blocks', () => {
  it('WorkflowEditorBlock wires the god workflow hook to WorkflowEditor', () => {
    render(<WorkflowEditorBlock />)
    expect(screen.getByTestId('workflow-editor').textContent).toBe('wf1')
    const call = workflowEditor.WorkflowEditor.mock.calls.at(-1)?.[0]
    const result = godWorkflow.useGodWorkflow.mock.results.at(-1)
    expect(call?.onChange).toBe(result?.value.save)
    expect(call?.onSave).toBe(result?.value.save)
  })

  it('PackageManagerBlock renders PackageManager for the system tenant', () => {
    render(<PackageManagerBlock />)
    expect(screen.getByTestId('package-manager').textContent).toBe('system')
  })

  it('SchemaEditorBlock renders SchemaEditor for the system tenant', () => {
    render(<SchemaEditorBlock />)
    expect(screen.getByTestId('schema-editor').textContent).toBe('system')
  })

  it('lists all three self-hosting tools with a name, desc and icon', () => {
    expect(METABUILDER_BLOCKS.map(b => b.type)).toEqual([
      'mb.WorkflowEditor',
      'mb.PackageManager',
      'mb.SchemaEditor',
    ])
    for (const block of METABUILDER_BLOCKS) {
      expect(block.name.length).toBeGreaterThan(0)
      expect(block.description.length).toBeGreaterThan(0)
      expect(block.icon.length).toBeGreaterThan(0)
    }
  })

  it('registers each block type to its component, one-to-one', () => {
    expect(METABUILDER_BLOCK_REGISTRY['mb.WorkflowEditor']).toBe(
      WorkflowEditorBlock
    )
    expect(METABUILDER_BLOCK_REGISTRY['mb.PackageManager']).toBe(
      PackageManagerBlock
    )
    expect(METABUILDER_BLOCK_REGISTRY['mb.SchemaEditor']).toBe(
      SchemaEditorBlock
    )
    expect(Object.keys(METABUILDER_BLOCK_REGISTRY)).toHaveLength(
      METABUILDER_BLOCKS.length
    )
  })
})
