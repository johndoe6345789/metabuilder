import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { FileNode, OpenFile } from './ide-types'

const fileTreeHook = vi.hoisted(() => ({
  useFileTree: vi.fn(() => ({
    tree: [] as FileNode[],
    expandedPaths: new Set<string>(),
    openFile: null as OpenFile | null,
    openFileNode: vi.fn(),
    toggleExpand: vi.fn(),
  })),
}))
vi.mock('./useFileTree', () => fileTreeHook)

const fileExplorer = vi.hoisted(() => ({
  FileExplorer: vi.fn(() => <div data-testid="file-explorer" />),
}))
vi.mock('./FileExplorer', () => fileExplorer)

const editorArea = vi.hoisted(() => ({
  EditorArea: vi.fn((props: { openFile: OpenFile | null }) => (
    <div data-testid="editor-area">{props.openFile?.path ?? 'none'}</div>
  )),
}))
vi.mock('./EditorArea', () => editorArea)

import { NerdModeIde } from './NerdModeIde'

describe('NerdModeIde', () => {
  it('renders the title, file explorer and editor area', () => {
    render(<NerdModeIde onClose={vi.fn()} />)
    expect(screen.getByText('Nerd Mode IDE')).toBeTruthy()
    expect(screen.getByTestId('file-explorer')).toBeTruthy()
    expect(screen.getByTestId('editor-area').textContent).toBe('none')
  })

  it('calls onClose when the Close button is clicked', () => {
    const onClose = vi.fn()
    render(<NerdModeIde onClose={onClose} />)
    fireEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('passes the open file from useFileTree through to EditorArea', () => {
    fileTreeHook.useFileTree.mockReturnValueOnce({
      tree: [],
      expandedPaths: new Set<string>(),
      openFile: { path: 'a.json', language: 'json', content: '{}' },
      openFileNode: vi.fn(),
      toggleExpand: vi.fn(),
    })
    render(<NerdModeIde onClose={vi.fn()} />)
    expect(screen.getByTestId('editor-area').textContent).toBe('a.json')
  })
})
