'use client'

/**
 * Dialog panels for snippet view page (Share, Fork, History, Edit, FileMenu)
 */

import dynamic from 'next/dynamic'
import { ShareDialog } from '@/components/features/snippet-viewer/ShareDialog'
import { ForkDialog } from '@/components/features/snippet-viewer/ForkDialog'
import { HistoryPanel } from '@/components/features/snippet-viewer/HistoryPanel'
import { FileMenu } from '@/components/features/file-ops/FileMenu'
import { Snippet } from '@/lib/types'

const SnippetDialog = dynamic(
  () =>
    import('@/components/features/snippet-editor/SnippetDialog').then(mod => ({
      default: mod.SnippetDialog,
    })),
  { ssr: false },
)

type FileList = { name: string; content: string }[]

interface Props {
  id: string
  snippet: Snippet
  files: FileList
  shareOpen: boolean
  forkOpen: boolean
  historyOpen: boolean
  editOpen: boolean
  menuFile: string | null
  menuRect: DOMRect | null
  onCloseShare: () => void
  onCloseFork: () => void
  onCloseHistory: () => void
  onChangeEdit: (open: boolean) => void
  onSave: (data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCloseMenu: () => void
  onOpenInNewTab: (name: string) => void
  onRename: (name: string) => void
  onDuplicate: (name: string) => void
  onDelete: (name: string) => void
  onCopyPath: () => void
}

export function SnippetDialogs({
  id,
  snippet,
  files,
  shareOpen,
  forkOpen,
  historyOpen,
  editOpen,
  menuFile,
  menuRect,
  onCloseShare,
  onCloseFork,
  onCloseHistory,
  onChangeEdit,
  onSave,
  onCloseMenu,
  onOpenInNewTab,
  onRename,
  onDuplicate,
  onDelete,
  onCopyPath,
}: Props) {
  return (
    <>
      <ShareDialog open={shareOpen} onClose={onCloseShare} snippet={snippet} />
      <ForkDialog open={forkOpen} onClose={onCloseFork} snippet={snippet} />
      <HistoryPanel
        open={historyOpen}
        onClose={onCloseHistory}
        snippetId={id}
      />
      <SnippetDialog
        open={editOpen}
        onOpenChange={onChangeEdit}
        editingSnippet={snippet}
        onSave={onSave}
        metadataOnly
      />
      {menuFile && menuRect && (
        <FileMenu
          anchorRect={menuRect}
          canDelete={files.length > 1}
          onClose={onCloseMenu}
          onOpenInNewTab={() => onOpenInNewTab(menuFile)}
          onRename={() => onRename(menuFile)}
          onDuplicate={() => onDuplicate(menuFile)}
          onDelete={() => onDelete(menuFile)}
          onCopyPath={onCopyPath}
        />
      )}
    </>
  )
}
