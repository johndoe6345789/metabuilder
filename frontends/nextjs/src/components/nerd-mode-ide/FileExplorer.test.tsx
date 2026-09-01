import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FileExplorer } from './FileExplorer'
import type { FileNode, OpenFile } from './ide-types'

const TREE: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [{ name: 'index.ts', type: 'file', language: 'typescript' }],
  },
]

function renderExplorer(over: {
  expandedPaths?: Set<string>
  openFile?: OpenFile | null
  onOpenFile?: (path: string, language: string) => void
  onToggleExpand?: (path: string) => void
} = {}) {
  return render(
    <FileExplorer
      tree={TREE}
      expandedPaths={over.expandedPaths ?? new Set()}
      openFile={over.openFile ?? null}
      onOpenFile={over.onOpenFile ?? vi.fn()}
      onToggleExpand={over.onToggleExpand ?? vi.fn()}
    />
  )
}

describe('FileExplorer', () => {
  it('renders the Explorer header', () => {
    renderExplorer()
    expect(screen.getByText('Explorer')).toBeTruthy()
  })

  it('shows a collapsed folder without its children', () => {
    renderExplorer()
    expect(screen.getByText('src')).toBeTruthy()
    expect(screen.queryByText('index.ts')).toBeNull()
  })

  it('shows the children of an expanded folder', () => {
    renderExplorer({ expandedPaths: new Set(['src']) })
    expect(screen.getByText('index.ts')).toBeTruthy()
  })

  it('calls onToggleExpand with the folder path when clicked', () => {
    const onToggleExpand = vi.fn()
    renderExplorer({ onToggleExpand })
    fireEvent.click(screen.getByText('src'))
    expect(onToggleExpand).toHaveBeenCalledWith('src')
  })

  it('calls onOpenFile with the path and language on click', () => {
    const onOpenFile = vi.fn()
    renderExplorer({ expandedPaths: new Set(['src']), onOpenFile })
    fireEvent.click(screen.getByText('index.ts'))
    expect(onOpenFile).toHaveBeenCalledWith('src/index.ts', 'typescript')
  })

  it('marks the currently open file as active', () => {
    renderExplorer({
      expandedPaths: new Set(['src']),
      openFile: { path: 'src/index.ts', language: 'typescript', content: '' },
    })
    expect(screen.getByText('index.ts').className).toContain('nodeActive')
  })
})
