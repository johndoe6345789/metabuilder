import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { WorkflowJsonAsset } from './ide-types'

vi.mock('./MonacoPane', () => ({
  MonacoPane: vi.fn(() => <div data-testid="monaco">monaco</div>),
}))

const assetsHook = vi.hoisted(() => ({ useWorkflowJsonAssets: vi.fn() }))
vi.mock('./useWorkflowJsonAssets', () => assetsHook)

import { WorkflowJsonEditor } from './WorkflowJsonEditor'

const ASSET: WorkflowJsonAsset = { id: 'wf1', name: 'first.json', code: '{}' }

function assets(over: Record<string, unknown> = {}) {
  return {
    assets: [] as WorkflowJsonAsset[],
    selectedId: null as string | null,
    selected: null as WorkflowJsonAsset | null,
    setSelectedId: vi.fn(),
    addAsset: vi.fn(),
    updateName: vi.fn(),
    save: vi.fn(),
    ...over,
  }
}

describe('WorkflowJsonEditor', () => {
  it('shows the empty state and the asset list when nothing is selected', () => {
    assetsHook.useWorkflowJsonAssets.mockReturnValue(assets())
    render(<WorkflowJsonEditor />)
    expect(
      screen.getByText('Create a workflow JSON asset to start')
    ).toBeTruthy()
    expect(screen.getByText('Workflow JSON')).toBeTruthy()
    expect(screen.queryByTestId('monaco')).toBeNull()
  })

  it('shows the toolbar and MonacoPane when an asset is selected', () => {
    assetsHook.useWorkflowJsonAssets.mockReturnValue(
      assets({ assets: [ASSET], selectedId: 'wf1', selected: ASSET })
    )
    render(<WorkflowJsonEditor />)
    expect(screen.getByDisplayValue('first.json')).toBeTruthy()
    expect(screen.getByTestId('monaco')).toBeTruthy()
    expect(
      screen.queryByText('Create a workflow JSON asset to start')
    ).toBeNull()
  })

  it('calls updateName as the name input changes', () => {
    const updateName = vi.fn()
    assetsHook.useWorkflowJsonAssets.mockReturnValue(
      assets({ assets: [ASSET], selectedId: 'wf1', selected: ASSET, updateName })
    )
    render(<WorkflowJsonEditor />)
    fireEvent.change(screen.getByDisplayValue('first.json'), {
      target: { value: 'renamed.json' },
    })
    expect(updateName).toHaveBeenCalledWith('renamed.json', 'wf1')
  })

  it('calls save when the Save button is clicked', () => {
    const save = vi.fn()
    assetsHook.useWorkflowJsonAssets.mockReturnValue(
      assets({ assets: [ASSET], selectedId: 'wf1', selected: ASSET, save })
    )
    render(<WorkflowJsonEditor />)
    fireEvent.click(screen.getByText('Save'))
    expect(save).toHaveBeenCalledOnce()
  })

  it('calls addAsset when + New Workflow is clicked', () => {
    const addAsset = vi.fn()
    assetsHook.useWorkflowJsonAssets.mockReturnValue(assets({ addAsset }))
    render(<WorkflowJsonEditor />)
    fireEvent.click(screen.getByText('+ New Workflow'))
    expect(addAsset).toHaveBeenCalledOnce()
  })
})
