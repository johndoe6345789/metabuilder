'use client'

import { Snippet } from '@/lib/types'
import { SnippetComments } from
  '@/components/features/comments/SnippetComments'
import { SnippetDialogs } from './SnippetDialogs'
import {
  FileCommandPalette,
  type CommandItem,
} from '@/components/features/file-ops/FileCommandPalette'
import type { useSnippetViewPage } from './hooks/useSnippetViewPage'

type VM = ReturnType<typeof useSnippetViewPage>
type FileList = { name: string; content: string }[]

interface Props {
  vm: VM
  files: FileList
  commands: CommandItem[]
}

export function SnippetPageOverlays({ vm, files, commands }: Props) {
  const {
    id, snippet, shareOpen, forkOpen, historyOpen, editOpen,
    menuFile, menuRect, paletteOpen,
  } = vm

  if (!snippet) return null

  return (
    <>
      <SnippetComments snippetId={id} />
      <SnippetDialogs
        id={id} snippet={snippet} files={files}
        shareOpen={shareOpen} forkOpen={forkOpen}
        historyOpen={historyOpen} editOpen={editOpen}
        menuFile={menuFile} menuRect={menuRect}
        onCloseShare={() => vm.setShareOpen(false)}
        onCloseFork={() => vm.setForkOpen(false)}
        onCloseHistory={() => vm.setHistoryOpen(false)}
        onChangeEdit={vm.setEditOpen}
        onSave={vm.handleSave}
        onCloseMenu={() => vm.setMenuFile(null)}
        onOpenInNewTab={vm.openInTab}
        onRename={vm.handleStartRename}
        onDuplicate={name => vm.handleDuplicateFile(name, files)}
        onDelete={name =>
          vm.handleDeleteFile(name, files, n => vm.setActiveFile(n))
        }
        onCopyPath={vm.handleCopyPath}
      />
      <FileCommandPalette
        open={paletteOpen}
        onClose={() => vm.setPaletteOpen(false)}
        commands={commands}
      />
    </>
  )
}
