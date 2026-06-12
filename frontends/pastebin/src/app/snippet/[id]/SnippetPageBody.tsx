'use client'

import { Snippet, Namespace } from '@/lib/types'
// eslint-disable-next-line max-len
import type { CommandItem } from '@/components/features/file-ops/FileCommandPalette'
import { SnippetTopBar } from './SnippetTopBar'
import { SnippetToolbar } from './SnippetToolbar'
import { SnippetPageWork } from './SnippetPageWork'
import { SnippetPageOverlays } from './SnippetPageOverlays'
import type { useSnippetViewPage } from './hooks/useSnippetViewPage'
import styles from './snippet-view-page.module.scss'

type VM = ReturnType<typeof useSnippetViewPage>
type FileList = { name: string; content: string }[]

interface Props {
  vm: VM
  onBack: () => void
  filename: string
  files: FileList
  activeCode: string
  viewSnippet: Snippet
  canPreview: boolean
  lineCount: number
  namespace: Namespace | undefined
  langBgClass: string
  commands: CommandItem[]
  onCommitNewFile: () => void
}

export function SnippetPageBody({
  vm,
  onBack,
  filename,
  files,
  activeCode,
  viewSnippet,
  canPreview,
  lineCount,
  namespace,
  langBgClass,
  commands,
  onCommitNewFile,
}: Props) {
  const {
    snippet,
    isCopied,
    showPreview,
    wordWrap,
    historyOpen,
    terminal,
    debugger: dbg,
    handleDebug,
  } = vm
  if (!snippet) return null
  const isDebugging = ['starting', 'running'].includes(dbg.state.status)

  return (
    <div className={styles.page} data-testid="snippet-view-page">
      <SnippetTopBar
        title={snippet.title}
        description={snippet.description}
        onBack={onBack}
      />
      <SnippetToolbar
        isCopied={isCopied}
        wordWrap={wordWrap}
        canPreview={canPreview}
        showPreview={showPreview}
        isRunning={terminal.isRunning}
        isDebugging={isDebugging}
        shareActive={!!snippet.shareToken}
        historyOpen={historyOpen}
        onEdit={() => vm.setEditOpen(true)}
        onCopy={() => vm.handleCopy(activeCode)}
        onShare={() => vm.setShareOpen(true)}
        onFork={() => vm.setForkOpen(true)}
        onHistory={() => vm.setHistoryOpen(o => !o)}
        onToggleWrap={() => vm.setWordWrap(w => (w === 'on' ? 'off' : 'on'))}
        onTogglePreview={() => vm.setShowPreview(p => !p)}
        onRun={() => vm.handleRun(files)}
        onStop={terminal.handleStop}
        onDebug={() => handleDebug(files)}
        onPalette={() => vm.setPaletteOpen(true)}
      />
      <SnippetPageWork
        vm={vm}
        snippet={snippet}
        files={files}
        filename={filename}
        viewSnippet={viewSnippet}
        canPreview={canPreview}
        lineCount={lineCount}
        namespace={namespace}
        langBgClass={langBgClass}
        dbg={dbg}
        terminal={terminal}
        onCommitNewFile={onCommitNewFile}
        onDebugStart={() => handleDebug(files)}
      />
      <SnippetPageOverlays vm={vm} files={files} commands={commands} />
    </div>
  )
}
