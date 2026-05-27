'use client'

import { useRouter } from 'next/navigation'
import { PageLayout } from '@/app/PageLayout'
import { LANGUAGE_COLORS, appConfig } from '@/lib/config'
import { SnippetComments } from '@/components/features/comments/SnippetComments'
import {
  FileCommandPalette,
} from '@/components/features/file-ops/FileCommandPalette'
import { Snippet } from '@/lib/types'
import { useSnippetViewPage, getFilename } from './hooks/useSnippetViewPage'
import { buildCommands } from './snippetCommands'
import { SnippetTopBar } from './SnippetTopBar'
import { SnippetToolbar } from './SnippetToolbar'
import { SnippetWorkArea } from './SnippetWorkArea'
import { SnippetDialogs } from './SnippetDialogs'
import { SnippetStatusBar } from './SnippetStatusBar'
import styles from './snippet-view-page.module.scss'

export default function SnippetViewPage() {
  const router = useRouter()
  const vm = useSnippetViewPage()
  const {
    id, snippet, namespaces, isCopied, showPreview, wordWrap,
    activeFile, activeTab, editOpen, shareOpen, forkOpen, historyOpen,
    openFiles, localCode, saving, paletteOpen, menuFile, menuRect,
    renaming, renameValue, addingFile, newFileName, newFileInputRef,
    snippetRef, activeFileRef, filesRef, terminal,
  } = vm

  if (!snippet) {
    return <PageLayout><div className={styles.loading}>Loading…</div></PageLayout>
  }

  const filename = getFilename(snippet.title, snippet.language)
  const namespace = namespaces.find(n => n.id === snippet.namespaceId)
  const langBgClass = (
    LANGUAGE_COLORS[snippet.language] || LANGUAGE_COLORS['Other']
  ).split(' ')[0]
  const files = snippet.files?.length
    ? snippet.files
    : [{ name: filename, content: snippet.code }]
  const activeFileObj = files.find(f => f.name === activeFile) ?? files[0]
  const activeCode = activeFileObj?.content ?? snippet.code
  const lineCount = (localCode ?? activeCode).split('\n').length

  snippetRef.current = snippet
  activeFileRef.current = activeFile || (files[0]?.name ?? '')
  filesRef.current = files

  const viewSnippet = { ...snippet, code: localCode ?? activeCode }
  const isEntryFile = !activeFile || activeFile === (snippet.entryPoint ?? files[0]?.name)
  const canPreview = !!(
    isEntryFile && snippet.hasPreview
    && appConfig.previewEnabledLanguages.includes(snippet.language)
  )
  const commands = buildCommands({
    vm, snippet, activeFile, activeCode, files, canPreview,
    onBack: () => router.push('/'),
  })

  const onCommitNewFile = () =>
    vm.commitNewFile(files, filename).then(n => {
      if (n) { vm.setActiveFile(n); vm.setActiveTab('code') }
    })

  return (
    <PageLayout>
      <div className={styles.page} data-testid="snippet-view-page">
        <SnippetTopBar
          title={snippet.title} description={snippet.description}
          onBack={() => router.push('/')}
        />
        <SnippetToolbar
          isCopied={isCopied} wordWrap={wordWrap} canPreview={canPreview}
          showPreview={showPreview} isRunning={terminal.isRunning}
          shareActive={!!snippet.shareToken} historyOpen={historyOpen}
          onEdit={() => vm.setEditOpen(true)}
          onCopy={() => vm.handleCopy(activeCode)}
          onShare={() => vm.setShareOpen(true)} onFork={() => vm.setForkOpen(true)}
          onHistory={() => vm.setHistoryOpen(o => !o)}
          onToggleWrap={() => vm.setWordWrap(w => w === 'on' ? 'off' : 'on')}
          onTogglePreview={() => vm.setShowPreview(p => !p)}
          onRun={() => vm.handleRun(files)} onStop={terminal.handleStop}
          onPalette={() => vm.setPaletteOpen(true)}
        />
        <SnippetWorkArea
          snippet={snippet} viewSnippet={viewSnippet}
          files={files} filename={filename} langBgClass={langBgClass}
          activeFile={activeFile} activeTab={activeTab} openFiles={openFiles}
          localCode={localCode} canPreview={canPreview} showPreview={showPreview}
          wordWrap={wordWrap} renaming={renaming} renameValue={renameValue}
          addingFile={addingFile} newFileName={newFileName}
          menuFile={menuFile} newFileInputRef={newFileInputRef} terminal={terminal}
          onOpenInTab={vm.openInTab} onSetRenameValue={vm.setRenameValue}
          onCommitRename={() =>
            vm.commitRename(files, activeFile, (_, n) => vm.setActiveFile(n))
          }
          onCancelRename={() => vm.setRenaming(null)}
          onNewFile={vm.handleNewFile}
          onMenuToggle={(name, rect) => {
            if (menuFile === name) { vm.setMenuFile(null); return }
            vm.setMenuFile(name); vm.setMenuRect(rect)
          }}
          onNewFileNameChange={vm.setNewFileName}
          onCommitNewFile={onCommitNewFile}
          onCancelNewFile={() => vm.setAddingFile(false)}
          onFileTabClick={f => { vm.setActiveFile(f); vm.setActiveTab('code') }}
          onCloseTab={vm.closeTab}
          onTerminalClick={() => vm.setActiveTab('terminal')}
          onDebugClick={() => vm.setActiveTab('debug')}
          onCodeChange={vm.handleCodeChange}
        />
        <SnippetStatusBar
          language={snippet.language} activeFile={activeFile}
          filename={filename} lineCount={lineCount} namespace={namespace}
          isRunning={terminal.isRunning} saving={saving}
          updatedAt={snippet.updatedAt}
        />
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
          onSave={(data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) =>
            vm.handleSave(data)
          }
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
      </div>
    </PageLayout>
  )
}
