import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const monaco = vi.hoisted(() => ({
  MonacoPane: () => <div data-testid="monaco">monaco</div>,
}))
vi.mock('./MonacoPane', () => monaco)
const workflowJson = vi.hoisted(() => ({
  WorkflowJsonEditor: () => <div data-testid="workflow-json">wf-json</div>,
}))
vi.mock('./WorkflowJsonEditor', () => workflowJson)

import { EditorArea } from './EditorArea'

beforeEach(() => {
  Element.prototype.scrollIntoView = () => undefined
})

describe('EditorArea', () => {
  it('shows a placeholder on the Editor tab with no open file', () => {
    render(<EditorArea openFile={null} />)
    expect(screen.getByText('Select a file to edit')).toBeTruthy()
  })

  it('shows MonacoPane on the Editor tab with a file open', () => {
    render(<EditorArea openFile={{ path: 'a.ts', language: 'typescript', content: '' }} />)
    expect(screen.getByTestId('monaco')).toBeTruthy()
  })

  it('switches to the Console tab', () => {
    render(<EditorArea openFile={null} />)
    fireEvent.click(screen.getByText('Console'))
    expect(screen.getByText('No output')).toBeTruthy()
    expect(screen.queryByText('Select a file to edit')).toBeNull()
  })

  it('switches to the Workflow JSON tab', () => {
    render(<EditorArea openFile={null} />)
    fireEvent.click(screen.getByText('Workflow JSON'))
    expect(screen.getByTestId('workflow-json')).toBeTruthy()
  })

  it('marks the active tab button', () => {
    render(<EditorArea openFile={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'Console' }))
    expect(
      screen.getByRole('button', { name: 'Console' }).className
    ).toContain('tabBtnActive')
    expect(
      screen.getByRole('button', { name: 'Editor' }).className
    ).not.toContain('tabBtnActive')
  })
})
