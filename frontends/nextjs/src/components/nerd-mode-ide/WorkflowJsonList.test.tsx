import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { WorkflowJsonList } from './WorkflowJsonList'
import type { WorkflowJsonAsset } from './ide-types'

const ASSETS: WorkflowJsonAsset[] = [
  { id: 'a', name: 'first.json', code: '{}' },
  { id: 'b', name: 'second.json', code: '{}' },
]

describe('WorkflowJsonList', () => {
  it('renders every asset name', () => {
    render(
      <WorkflowJsonList
        assets={ASSETS}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
      />
    )
    expect(screen.getByText('first.json')).toBeTruthy()
    expect(screen.getByText('second.json')).toBeTruthy()
  })

  it('marks the selected asset as active', () => {
    render(
      <WorkflowJsonList
        assets={ASSETS}
        selectedId="b"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
      />
    )
    expect(screen.getByText('second.json').className).toContain(
      'assetItemActive'
    )
    expect(screen.getByText('first.json').className).not.toContain(
      'assetItemActive'
    )
  })

  it('calls onSelect with the clicked asset id', () => {
    const onSelect = vi.fn()
    render(
      <WorkflowJsonList
        assets={ASSETS}
        selectedId={null}
        onSelect={onSelect}
        onAdd={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('first.json'))
    expect(onSelect).toHaveBeenCalledWith('a')
  })

  it('calls onAdd when + New Workflow is clicked', () => {
    const onAdd = vi.fn()
    render(
      <WorkflowJsonList
        assets={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={onAdd}
      />
    )
    fireEvent.click(screen.getByText('+ New Workflow'))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('renders no asset rows when the list is empty', () => {
    render(
      <WorkflowJsonList
        assets={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
      />
    )
    expect(screen.getByText('Workflow JSON')).toBeTruthy()
  })
})
