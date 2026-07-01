'use client'

import type { FileNode } from './ide-types'
import s from './FileTree.module.scss'

interface FileTreeProps {
  nodes: FileNode[]
  depth: number
  parentPath: string
  expandedPaths: Set<string>
  activePath: string | null
  onOpenFile: (path: string, language: string) => void
  onToggleExpand: (path: string) => void
}

export function FileTree({
  nodes,
  depth,
  parentPath,
  expandedPaths,
  activePath,
  onOpenFile,
  onToggleExpand,
}: FileTreeProps) {
  const wrap = depth > 0

  const inner = nodes.map((node) => {
    const path = parentPath !== '' ? `${parentPath}/${node.name}` : node.name
    const expanded = expandedPaths.has(path)
    const isActive = node.type === 'file' && activePath === path

    if (node.type === 'folder') {
      return (
        <div key={path}>
          <div
            className={s.node}
            onClick={() => { onToggleExpand(path) }}
          >
            <span className={s.icon}>{expanded ? '▾' : '▸'}</span>
            {node.name}
          </div>
          {expanded && node.children != null && (
            <FileTree
              nodes={node.children}
              depth={depth + 1}
              parentPath={path}
              expandedPaths={expandedPaths}
              activePath={activePath}
              onOpenFile={onOpenFile}
              onToggleExpand={onToggleExpand}
            />
          )}
        </div>
      )
    }

    return (
      <div
        key={path}
        className={`${s.node} ${isActive ? s.nodeActive : ''}`}
        onClick={() => {
          onOpenFile(path, node.language ?? 'plaintext')
        }}
      >
        <span className={s.icon}>▶</span>
        {node.name}
      </div>
    )
  })

  if (!wrap) return <>{inner}</>
  return <div className={s.indent}>{inner}</div>
}
