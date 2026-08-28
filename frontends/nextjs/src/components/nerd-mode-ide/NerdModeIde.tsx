'use client'

import { Button } from '@/m3'
import { FileExplorer } from './FileExplorer'
import { EditorArea } from './EditorArea'
import { useFileTree } from './useFileTree'
import s from './NerdModeIde.module.scss'

interface NerdModeIdeProps {
  onClose: () => void
}

export function NerdModeIde({ onClose }: NerdModeIdeProps) {
  const fileTree = useFileTree()

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <span className={s.title}>Nerd Mode IDE</span>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className={s.body}>
        <FileExplorer
          tree={fileTree.tree}
          expandedPaths={fileTree.expandedPaths}
          openFile={fileTree.openFile}
          onOpenFile={fileTree.openFileNode}
          onToggleExpand={fileTree.toggleExpand}
        />
        <EditorArea openFile={fileTree.openFile} />
      </div>
    </div>
  )
}
