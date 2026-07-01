'use client'

import type { FileNode, OpenFile } from './ide-types'
import { FileTree } from './FileTree'
import s from './FileExplorer.module.scss'

interface FileExplorerProps {
  tree: FileNode[]
  expandedPaths: Set<string>
  openFile: OpenFile | null
  onOpenFile: (path: string, language: string) => void
  onToggleExpand: (path: string) => void
}

export function FileExplorer({
  tree,
  expandedPaths,
  openFile,
  onOpenFile,
  onToggleExpand,
}: FileExplorerProps) {
  return (
    <aside className={s.sidebar}>
      <div className={s.sidebarHeader}>Explorer</div>
      <div className={s.tree}>
        <FileTree
          nodes={tree}
          depth={0}
          parentPath=""
          expandedPaths={expandedPaths}
          activePath={openFile?.path ?? null}
          onOpenFile={onOpenFile}
          onToggleExpand={onToggleExpand}
        />
      </div>
    </aside>
  )
}
