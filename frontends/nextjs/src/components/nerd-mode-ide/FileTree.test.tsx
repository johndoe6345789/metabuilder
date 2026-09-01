import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FileTree } from './FileTree'
import type { FileNode } from './ide-types'

const nodes: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [{ name: 'index.ts', type: 'file', language: 'typescript' }],
  },
  { name: 'readme.md', type: 'file', language: 'markdown' },
]

const props = (over: Partial<Parameters<typeof FileTree>[0]> = {}) => ({
  nodes,
  depth: 0,
  parentPath: '',
  expandedPaths: new Set<string>(),
  activePath: null,
  onOpenFile: vi.fn(),
  onToggleExpand: vi.fn(),
  ...over,
})

describe('FileTree', () => {
  it('renders top-level folders and files', () => {
    render(<FileTree {...props()} />)
    expect(screen.getByText('src')).toBeTruthy()
    expect(screen.getByText('readme.md')).toBeTruthy()
  })

  it('does not show a collapsed folder\'s children', () => {
    render(<FileTree {...props()} />)
    expect(screen.queryByText('index.ts')).toBeNull()
  })

  it('shows a folder\'s children once expanded', () => {
    render(<FileTree {...props({ expandedPaths: new Set(['src']) })} />)
    expect(screen.getByText('index.ts')).toBeTruthy()
  })

  it('toggles a folder on click', () => {
    const onToggleExpand = vi.fn()
    render(<FileTree {...props({ onToggleExpand })} />)
    fireEvent.click(screen.getByText('src'))
    expect(onToggleExpand).toHaveBeenCalledWith('src')
  })

  it('opens a file with its language on click', () => {
    const onOpenFile = vi.fn()
    render(<FileTree {...props({ onOpenFile })} />)
    fireEvent.click(screen.getByText('readme.md'))
    expect(onOpenFile).toHaveBeenCalledWith('readme.md', 'markdown')
  })

  it('defaults an unset language to plaintext', () => {
    const onOpenFile = vi.fn()
    render(
      <FileTree
        {...props({
          nodes: [{ name: 'x', type: 'file' }],
          onOpenFile,
        })}
      />
    )
    fireEvent.click(screen.getByText('x'))
    expect(onOpenFile).toHaveBeenCalledWith('x', 'plaintext')
  })

  it('marks the active file, scoped by full path', () => {
    render(
      <FileTree
        {...props({
          expandedPaths: new Set(['src']),
          activePath: 'src/index.ts',
        })}
      />
    )
    expect(screen.getByText('index.ts').className).toContain('nodeActive')
    expect(screen.getByText('readme.md').className).not.toContain(
      'nodeActive'
    )
  })

  it('wraps nested levels in an indent container', () => {
    const { container } = render(<FileTree {...props({ depth: 1 })} />)
    expect(container.querySelector('[class*="indent"]')).toBeTruthy()
  })
})
