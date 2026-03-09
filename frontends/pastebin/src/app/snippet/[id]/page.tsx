'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import dynamic from 'next/dynamic'
import { PageLayout } from '@/app/PageLayout'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectSnippets, selectNamespaces } from '@/store/selectors'
import { updateSnippet } from '@/store/slices/snippetsSlice'
import { LANGUAGE_COLORS, appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import { useCodeTerminal } from '@/hooks/useCodeTerminal'
import { Snippet } from '@/lib/types'
import { toast } from '@metabuilder/components/fakemui'
import { FileCommandPalette, CommandItem } from '@/components/features/file-ops/FileCommandPalette'
import { FileMenu } from '@/components/features/file-ops/FileMenu'
import { SnippetComments } from '@/components/features/comments/SnippetComments'
import { ShareDialog } from '@/components/features/snippet-viewer/ShareDialog'
import { ForkDialog } from '@/components/features/snippet-viewer/ForkDialog'
import { HistoryPanel } from '@/components/features/snippet-viewer/HistoryPanel'
import styles from './snippet-view-page.module.scss'

const SnippetViewerContent = dynamic(
  () => import('@/components/features/snippet-viewer/SnippetViewerContent').then(mod => ({ default: mod.SnippetViewerContent })),
  { ssr: false }
)

const CodeTerminal = dynamic(
  () => import('@/components/features/code-runner/CodeTerminal').then(mod => ({ default: mod.CodeTerminal })),
  { ssr: false }
)

const SnippetDialog = dynamic(
  () => import('@/components/features/snippet-editor/SnippetDialog').then(mod => ({ default: mod.SnippetDialog })),
  { ssr: false }
)

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  JavaScript: 'js', TypeScript: 'ts', JSX: 'jsx', TSX: 'tsx',
  Python: 'py', Java: 'java', 'C++': 'cpp', 'C#': 'cs',
  Go: 'go', Rust: 'rs', Ruby: 'rb', PHP: 'php',
  Swift: 'swift', Kotlin: 'kt', Scala: 'scala', Haskell: 'hs',
  R: 'r', Julia: 'jl', Elixir: 'ex', Dart: 'dart',
  Lua: 'lua', Perl: 'pl', HTML: 'html', CSS: 'css',
  SQL: 'sql', 'SQL (SQLite)': 'sql', 'SQL (MySQL)': 'sql', 'SQL (PostgreSQL)': 'sql',
  Bash: 'sh',
}

function getFilename(title: string, language: string): string {
  const ext = LANGUAGE_EXTENSIONS[language] ?? 'txt'
  const base = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '').slice(0, 30) || 'snippet'
  return `${base}.${ext}`
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

type ActiveTab = 'code' | 'terminal' | 'debug'

export default function SnippetViewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const snippets = useAppSelector(selectSnippets)
  const namespaces = useAppSelector(selectNamespaces)
  const snippet = snippets.find(s => s.id === id) ?? null

  const [isCopied, setIsCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on')
  const [activeFile, setActiveFile] = useState('')
  const [activeTab, setActiveTab] = useState<ActiveTab>('code')
  const [editOpen, setEditOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [forkOpen, setForkOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [openFiles, setOpenFiles] = useState<string[]>([])
  const [localCode, setLocalCode] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Refs so the timer callback always reads the latest values, avoiding stale closures
  const snippetRef = useRef(snippet)
  const activeFileRef = useRef('')
  const filesRef = useRef<{ name: string; content: string }[]>([])

  // Command palette
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Per-file ⋮ dropdown menu
  const [menuFile, setMenuFile] = useState<string | null>(null)
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)

  // Inline rename state
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // New file inline input state
  const [addingFile, setAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const newFileInputRef = useRef<HTMLInputElement>(null)

  const terminal = useCodeTerminal()

  useEffect(() => {
    if (snippets.length > 0 && !snippet) {
      router.replace('/')
    }
  }, [snippet, snippets.length, router])

  useEffect(() => {
    if (!snippet) return
    const defaultName = getFilename(snippet.title, snippet.language)
    const initial = snippet.entryPoint
      || (snippet.files?.length ? snippet.files[0].name : defaultName)
    setActiveFile(initial)
    setOpenFiles(prev => prev.length > 0 ? prev : [initial])
  }, [snippet?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep localCode in sync when switching files or snippets
  useEffect(() => {
    if (!snippet) return
    const currentFiles = snippet.files && snippet.files.length > 0
      ? snippet.files
      : [{ name: getFilename(snippet.title, snippet.language), content: snippet.code }]
    const fileObj = currentFiles.find(f => f.name === activeFile) ?? currentFiles[0]
    setLocalCode(fileObj?.content ?? snippet.code)
  }, [activeFile, snippet?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      }
      if (e.key === 'F2' && activeFile && !paletteOpen && !renaming) {
        e.preventDefault()
        setRenaming(activeFile)
        setRenameValue(activeFile)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeFile, paletteOpen, renaming])

  if (!snippet) {
    return (
      <PageLayout>
        <div className={styles.loading}>Loading…</div>
      </PageLayout>
    )
  }

  const filename = getFilename(snippet.title, snippet.language)
  const namespace = namespaces.find(n => n.id === snippet.namespaceId)
  const langBgClass = (LANGUAGE_COLORS[snippet.language] || LANGUAGE_COLORS['Other']).split(' ')[0]

  const files = snippet.files && snippet.files.length > 0
    ? snippet.files
    : [{ name: filename, content: snippet.code }]

  const activeFileObj = files.find(f => f.name === activeFile) ?? files[0]
  const activeCode = activeFileObj?.content ?? snippet.code
  const lineCount = (localCode ?? activeCode).split('\n').length

  // Keep refs current so the debounced save always writes the latest snapshot
  snippetRef.current = snippet
  activeFileRef.current = activeFile || (files[0]?.name ?? '')
  filesRef.current = files

  const viewSnippet = { ...snippet, code: localCode ?? activeCode }
  const isEntryFile = !activeFile || activeFile === (snippet.entryPoint ?? files[0]?.name)
  const canPreview = !!(isEntryFile && snippet.hasPreview && appConfig.previewEnabledLanguages.includes(snippet.language))
  const isPython = snippet.language === 'Python'

  // ── Auto-save ─────────────────────────────────────────────────
  const handleCodeChange = (value: string) => {
    setLocalCode(value)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    // Capture the file being edited NOW — snippetRef/filesRef are read dynamically
    // so new files created after this call are still visible to the timer.
    const fileBeingEdited = activeFileRef.current
    saveTimer.current = setTimeout(async () => {
      // Read from refs — always the latest snapshot regardless of when the timer fires
      const currentSnippet = snippetRef.current
      const currentActiveFile = fileBeingEdited
      const currentFiles = filesRef.current
      if (!currentSnippet) return
      setSaving(true)
      try {
        const updatedFiles = currentFiles.map(f =>
          f.name === currentActiveFile ? { ...f, content: value } : f
        )
        const isEntry = currentActiveFile === (currentSnippet.entryPoint ?? currentFiles[0]?.name)
        await dispatch(updateSnippet({
          ...currentSnippet,
          code: isEntry ? value : currentSnippet.code,
          files: updatedFiles,
        })).unwrap()
      } catch {
        toast.error(t.toast.failedToSaveSnippet)
      } finally {
        setSaving(false)
      }
    }, 1000)
  }

  // ── Clipboard ─────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode)
    toast.success(t.toast.codeCopied)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), appConfig.copiedTimeout)
  }

  const handleCopyPath = () => {
    navigator.clipboard.writeText(`/${id}/${activeFile}`)
    toast.success('Path copied to clipboard')
  }

  // ── Run / Stop ────────────────────────────────────────────────
  const handleRun = () => {
    const languageRunnerMap: Record<string, string> =
      (appConfig as unknown as { languageRunnerMap: Record<string, string> }).languageRunnerMap ?? {}
    const runnerKey = languageRunnerMap[snippet.language]
      ?? snippet.language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    terminal.handleRun(runnerKey, files, snippet.entryPoint ?? activeFile)
    setActiveTab('terminal')
  }

  // ── Snippet metadata save ─────────────────────────────────────
  const handleSave = async (data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await dispatch(updateSnippet({ ...snippet, ...data })).unwrap()
      toast.success(t.toast.snippetUpdated)
    } catch {
      toast.error(t.toast.failedToSaveSnippet)
    }
  }

  // ── Editor tabs ───────────────────────────────────────────────
  const openInTab = (name: string) => {
    setOpenFiles(prev => prev.includes(name) ? prev : [...prev, name])
    setActiveFile(name)
    setActiveTab('code')
  }

  const closeTab = (name: string) => {
    setOpenFiles(prev => {
      if (prev.length <= 1) return prev // never close the last tab
      const next = prev.filter(f => f !== name)
      if (activeFile === name) {
        const idx = prev.indexOf(name)
        setActiveFile(next[Math.max(0, idx - 1)])
      }
      return next
    })
  }

  // ── File operations ───────────────────────────────────────────
  const handleNewFile = () => {
    setAddingFile(true)
    setNewFileName('')
    setTimeout(() => newFileInputRef.current?.focus(), 10)
  }

  const commitNewFile = async () => {
    const name = newFileName.trim()
    setAddingFile(false)
    if (!name) return
    const currentFiles = snippet.files && snippet.files.length > 0
      ? snippet.files
      : [{ name: filename, content: snippet.code }]
    if (currentFiles.some(f => f.name === name)) {
      toast.error(`File "${name}" already exists`)
      return
    }
    try {
      await dispatch(updateSnippet({ ...snippet, files: [...currentFiles, { name, content: '' }] })).unwrap()
      setActiveFile(name)
      setActiveTab('code')
    } catch {
      toast.error('Failed to create file')
    }
  }

  const handleNewFileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commitNewFile() }
    if (e.key === 'Escape') { e.preventDefault(); setAddingFile(false) }
  }

  const handleStartRename = (name: string) => {
    setRenaming(name)
    setRenameValue(name)
  }

  const commitRename = async () => {
    const oldName = renaming
    setRenaming(null)
    if (!oldName) return
    const newName = renameValue.trim()
    if (!newName || newName === oldName) return
    if (files.some(f => f.name === newName)) {
      toast.error(`File "${newName}" already exists`)
      return
    }
    const newFiles = files.map(f => f.name === oldName ? { ...f, name: newName } : f)
    const newEntry = snippet.entryPoint === oldName ? newName : snippet.entryPoint
    try {
      await dispatch(updateSnippet({ ...snippet, files: newFiles, entryPoint: newEntry })).unwrap()
      if (activeFile === oldName) setActiveFile(newName)
    } catch {
      toast.error('Failed to rename file')
    }
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') { e.preventDefault(); setRenaming(null) }
  }

  const handleDeleteFile = async (name: string) => {
    if (files.length <= 1) { toast.error('Cannot delete the last file'); return }
    const newFiles = files.filter(f => f.name !== name)
    const newEntry = snippet.entryPoint === name ? newFiles[0]?.name : snippet.entryPoint
    try {
      await dispatch(updateSnippet({ ...snippet, files: newFiles, entryPoint: newEntry })).unwrap()
      if (activeFile === name) setActiveFile(newFiles[0]?.name ?? '')
      toast.success(`Deleted ${name}`)
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const handleDuplicateFile = async (name: string) => {
    const file = files.find(f => f.name === name)
    if (!file) return
    const ext = name.includes('.') ? `.${name.split('.').pop()}` : ''
    const base = name.replace(/\.[^.]+$/, '')
    const dupName = `${base}-copy${ext}`
    try {
      await dispatch(updateSnippet({ ...snippet, files: [...files, { name: dupName, content: file.content }] })).unwrap()
      setActiveFile(dupName)
      toast.success(`Duplicated as ${dupName}`)
    } catch {
      toast.error('Failed to duplicate file')
    }
  }

  // ── Command palette commands ───────────────────────────────────
  const commands: CommandItem[] = [
    // FILE group
    { id: 'new-file', label: 'New File', icon: 'note_add', shortcut: '⌘N', group: 'FILE',
      action: handleNewFile },
    { id: 'rename-file', label: 'Rename File', icon: 'edit', shortcut: 'F2', group: 'FILE',
      action: () => handleStartRename(activeFile) },
    { id: 'duplicate-file', label: 'Duplicate File', icon: 'content_copy', shortcut: '⌘D', group: 'FILE',
      action: () => handleDuplicateFile(activeFile) },
    { id: 'delete-file', label: 'Delete File', icon: 'delete', shortcut: '⌦', group: 'FILE',
      action: () => handleDeleteFile(activeFile), disabled: files.length <= 1, danger: true },
    { id: 'copy-path', label: 'Copy File Path', icon: 'link', shortcut: '⌥⌘C', group: 'FILE',
      action: handleCopyPath },

    // CLIPBOARD group
    { id: 'copy-code', label: 'Copy Code', icon: 'content_copy', shortcut: '⌘C', group: 'CLIPBOARD',
      action: handleCopy },

    // VIEW group
    { id: 'toggle-wrap', label: 'Toggle Word Wrap', icon: 'wrap_text', shortcut: '⌥Z', group: 'VIEW',
      action: () => setWordWrap(w => w === 'on' ? 'off' : 'on') },
    { id: 'toggle-preview', label: 'Toggle Preview', icon: 'vertical_split', shortcut: '⌘\\', group: 'VIEW',
      action: () => setShowPreview(p => !p), disabled: !canPreview },
    { id: 'focus-editor', label: 'Focus Editor', icon: 'insert_drive_file', shortcut: '⌘1', group: 'VIEW',
      action: () => setActiveTab('code') },
    { id: 'focus-terminal', label: 'Focus Terminal', icon: 'terminal', shortcut: '⌃`', group: 'VIEW',
      action: () => setActiveTab('terminal') },

    // RUN group
    { id: 'run-code', label: 'Run Code', icon: 'play_arrow', shortcut: 'F5', group: 'RUN',
      action: handleRun, disabled: terminal.isRunning },
    { id: 'stop-execution', label: 'Stop Execution', icon: 'stop', shortcut: '⌃C', group: 'RUN',
      action: terminal.handleStop, disabled: !terminal.isRunning },

    // NAVIGATE group
    { id: 'edit-metadata', label: 'Edit Snippet Metadata', icon: 'edit', shortcut: '', group: 'NAVIGATE',
      action: () => setEditOpen(true) },
    { id: 'go-back', label: 'Back to Snippets', icon: 'arrow_back', shortcut: '⌘←', group: 'NAVIGATE',
      action: () => router.push('/') },
  ]

  return (
    <PageLayout>
      <div className={styles.page} data-testid="snippet-view-page">

        {/* Minimal top bar */}
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => router.push('/')} aria-label="Back to snippets">
            <MaterialIcon name="arrow_back" size={14} />
            <span>Back</span>
          </button>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>{snippet.title}</h1>
            {snippet.description && (
              <span className={styles.titleDescription} title={snippet.description}>
                {snippet.description}
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.wordToolbar} role="toolbar" aria-label="Document toolbar">
          {/* Edit */}
          <div className={styles.toolGroup}>
            <button className={styles.toolBtn} onClick={() => setEditOpen(true)} title="Edit snippet">
              <MaterialIcon name="edit" size={14} />
              <span>Edit</span>
            </button>
          </div>

          <div className={styles.toolSep} aria-hidden="true" />

          {/* Clipboard */}
          <div className={styles.toolGroup}>
            <button
              className={`${styles.toolBtn} ${isCopied ? styles.toolBtnPressed : ''}`}
              onClick={handleCopy}
              title="Copy active file"
              aria-live="polite"
            >
              {isCopied
                ? <><MaterialIcon name="check" size={14} /><span>Copied!</span></>
                : <><MaterialIcon name="content_copy" size={14} /><span>Copy</span></>}
            </button>
          </div>

          <div className={styles.toolSep} aria-hidden="true" />

          {/* Share */}
          <div className={styles.toolGroup}>
            <button
              className={`${styles.toolBtn} ${snippet.shareToken ? styles.toolBtnActive : ''}`}
              onClick={() => setShareOpen(true)}
              title={snippet.shareToken ? 'Snippet is shared — manage link' : 'Share snippet'}
              aria-label="Share snippet"
            >
              <MaterialIcon name="share" size={14} />
              <span>Share</span>
            </button>
            <button
              className={styles.toolBtn}
              onClick={() => setForkOpen(true)}
              title="Fork snippet into your account"
              aria-label="Fork snippet"
            >
              <MaterialIcon name="call_split" size={14} />
              <span>Fork</span>
            </button>
            <button
              className={`${styles.toolBtn} ${historyOpen ? styles.toolBtnActive : ''}`}
              onClick={() => setHistoryOpen(o => !o)}
              title="Version history"
              aria-label="Version history"
            >
              <MaterialIcon name="history" size={14} />
              <span>History</span>
            </button>
          </div>

          <div className={styles.toolSep} aria-hidden="true" />

          {/* View */}
          <div className={styles.toolGroup}>
            <button
              className={`${styles.toolBtn} ${wordWrap === 'on' ? styles.toolBtnActive : ''}`}
              onClick={() => setWordWrap(w => w === 'on' ? 'off' : 'on')}
              title="Toggle word wrap"
              aria-pressed={wordWrap === 'on'}
            >
              <MaterialIcon name="wrap_text" size={14} />
              <span>Wrap</span>
            </button>
            {canPreview && (
              <button
                className={`${styles.toolBtn} ${showPreview ? styles.toolBtnActive : ''}`}
                onClick={() => setShowPreview(p => !p)}
                title={showPreview ? 'Hide preview' : 'Show preview'}
                aria-pressed={showPreview}
              >
                <MaterialIcon name="vertical_split" size={14} />
                <span>Preview</span>
              </button>
            )}
          </div>

          <div className={styles.toolSep} aria-hidden="true" />

          {/* Run / Stop */}
          <div className={styles.toolGroup}>
            <button
              className={`${styles.toolBtn} ${styles.toolBtnRun}`}
              onClick={handleRun}
              disabled={terminal.isRunning}
              title="Run code"
              data-testid="run-code-btn"
              aria-label={terminal.isRunning ? 'Running code' : 'Run code'}
            >
              <MaterialIcon name="play_arrow" size={14} />
              <span>{terminal.isRunning ? 'Running…' : 'Run'}</span>
            </button>
            <button
              className={`${styles.toolBtn} ${styles.toolBtnStop}`}
              onClick={terminal.handleStop}
              disabled={!terminal.isRunning}
              title="Stop execution"
              data-testid="stop-code-btn"
              aria-label="Stop execution"
            >
              <MaterialIcon name="stop" size={14} />
              <span>Stop</span>
            </button>
          </div>

          {/* Command palette trigger — pushes to right edge */}
          <button
            className={styles.paletteTrigger}
            onClick={() => setPaletteOpen(true)}
            title="Open command palette"
            aria-label="Open command palette"
          >
            <MaterialIcon name="keyboard" size={13} />
            <span>Commands</span>
            <kbd>⌘K</kbd>
          </button>
        </div>

        {/* Work area */}
        <div className={styles.workArea}>

          {/* File tree */}
          <div className={styles.fileTree} aria-label="File explorer">
            {/* Explorer header with hover-revealed New File button */}
            <div className={styles.explorerHeader}>
              <span>EXPLORER</span>
              <div className={styles.explorerActions}>
                <button
                  className={styles.explorerAction}
                  onClick={handleNewFile}
                  title="New File"
                  aria-label="New File"
                >
                  <MaterialIcon name="note_add" size={13} />
                </button>
              </div>
            </div>

            <div className={styles.treeRoot}>
              <div className={styles.treeFolder}>
                <MaterialIcon name="folder" size={13} className={styles.folderIcon} aria-hidden="true" />
                <span className={styles.folderName}>{snippet.title}</span>
              </div>

              <div className={styles.treeFiles}>
                {files.map(f => (
                  <div
                    key={f.name}
                    className={`${styles.treeFileRow} ${f.name === activeFile ? styles.treeFileRowActive : ''}`}
                  >
                    {renaming === f.name ? (
                      /* Inline rename input */
                      <input
                        className={styles.renameInput}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={commitRename}
                        autoFocus
                        aria-label={`Rename ${f.name}`}
                        spellCheck={false}
                      />
                    ) : (
                      <>
                        {/* File select button */}
                        <button
                          className={styles.treeFileBtn}
                          onClick={() => openInTab(f.name)}
                          title={f.name}
                          aria-pressed={f.name === activeFile}
                        >
                          <span className={`${styles.langDot} ${langBgClass}`} aria-hidden="true" />
                          <MaterialIcon name="insert_drive_file" size={12} aria-hidden="true" className={styles.fileIcon} />
                          <span className={styles.fileName}>{f.name}</span>
                        </button>

                        {/* Always-visible ⋮ menu button */}
                        <button
                          className={styles.fileMenuBtn}
                          onClick={e => {
                            e.stopPropagation()
                            if (menuFile === f.name) { setMenuFile(null); return }
                            setMenuFile(f.name)
                            setMenuRect((e.currentTarget as HTMLButtonElement).getBoundingClientRect())
                          }}
                          title="File actions"
                          aria-label={`Actions for ${f.name}`}
                          aria-haspopup="menu"
                          aria-expanded={menuFile === f.name}
                        >
                          <MaterialIcon name="more_vert" size={13} />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {/* New file inline input */}
                {addingFile && (
                  <div className={styles.treeFileRow}>
                    <MaterialIcon name="insert_drive_file" size={12} aria-hidden="true" className={styles.fileIcon} />
                    <input
                      ref={newFileInputRef}
                      className={styles.renameInput}
                      placeholder="filename.ext"
                      value={newFileName}
                      onChange={e => setNewFileName(e.target.value)}
                      onKeyDown={handleNewFileKeyDown}
                      onBlur={commitNewFile}
                      aria-label="New file name"
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor + Terminal with tab bar */}
          <div className={styles.editorColumn}>

            {/* Tab bar */}
            <div className={styles.editorTabBar} role="tablist">
              {openFiles.map(f => (
                <button
                  key={f}
                  className={`${styles.editorTab} ${activeTab === 'code' && activeFile === f ? styles.editorTabActive : ''}`}
                  role="tab"
                  aria-selected={activeTab === 'code' && activeFile === f}
                  onClick={() => { setActiveFile(f); setActiveTab('code') }}
                >
                  <MaterialIcon name="insert_drive_file" size={12} aria-hidden="true" />
                  <span>{f}</span>
                  {openFiles.length > 1 && (
                    <span
                      className={styles.tabClose}
                      role="button"
                      aria-label={`Close ${f}`}
                      onClick={e => { e.stopPropagation(); closeTab(f) }}
                    >×</span>
                  )}
                </button>
              ))}
              <button
                className={`${styles.editorTab} ${activeTab === 'terminal' ? styles.editorTabActive : ''}`}
                role="tab"
                aria-selected={activeTab === 'terminal'}
                onClick={() => setActiveTab('terminal')}
              >
                <MaterialIcon name="terminal" size={12} aria-hidden="true" />
                <span>Terminal</span>
                {terminal.isRunning && <span className={styles.runningDot} aria-hidden="true" />}
              </button>
              <button
                className={`${styles.editorTab} ${activeTab === 'debug' ? styles.editorTabActive : ''}`}
                role="tab"
                aria-selected={activeTab === 'debug'}
                onClick={() => setActiveTab('debug')}
              >
                <MaterialIcon name="bug_report" size={12} aria-hidden="true" />
                <span>Debug</span>
              </button>
              <div className={styles.editorTabRail} aria-hidden="true" />
            </div>

            {/* Code panel */}
            <div
              className={`${styles.editorPanel} ${activeTab === 'code' ? styles.editorPanelVisible : styles.editorPanelHidden}`}
              role="tabpanel"
            >
              <SnippetViewerContent
                snippet={viewSnippet}
                canPreview={canPreview}
                showPreview={showPreview}
                isPython={isPython}
                wordWrap={wordWrap}
                onChange={handleCodeChange}
              />
            </div>

            {/* Terminal panel */}
            <div
              className={`${styles.editorPanel} ${activeTab === 'terminal' ? styles.editorPanelVisible : styles.editorPanelHidden}`}
              role="tabpanel"
            >
              <CodeTerminal
                language={snippet.language}
                files={files}
                entryPoint={snippet.entryPoint ?? activeFile}
                controller={terminal}
              />
            </div>

            {/* Debug panel */}
            <div
              className={`${styles.editorPanel} ${styles.debugPanel} ${activeTab === 'debug' ? styles.editorPanelVisible : styles.editorPanelHidden}`}
              role="tabpanel"
            >
              <div className={styles.debugContent}>
                {terminal.lastRunInfo ? (
                  <>
                    <section className={styles.debugSection}>
                      <h3 className={styles.debugHeading}>How it ran</h3>
                      <p className={styles.debugNote}>
                        Your files were renamed to random IDs before being sent to the runner,
                        so your file names never appear in the container.
                        The file to run was picked by matching the stored entry point — if it
                        didn&apos;t match any file name, the first file was used instead.
                      </p>
                    </section>

                    <section className={styles.debugSection}>
                      <h3 className={styles.debugHeading}>Runner</h3>
                      <dl className={styles.debugTable}>
                        <dt>Language</dt><dd>{terminal.lastRunInfo.language}</dd>
                        <dt>Runner</dt><dd className={styles.debugMono}>{terminal.lastRunInfo.runnerKey}</dd>
                        <dt>Mode</dt><dd>{terminal.lastRunInfo.interactive ? 'Interactive — reads input() in real time' : 'Non-interactive — runs to completion'}</dd>
                        <dt>Started at</dt><dd>{new Date(terminal.lastRunInfo.startedAt).toLocaleTimeString()}</dd>
                      </dl>
                    </section>

                    <section className={styles.debugSection}>
                      <h3 className={styles.debugHeading}>Entry point</h3>
                      <dl className={styles.debugTable}>
                        <dt>Stored value</dt>
                        <dd className={styles.debugMono}>{terminal.lastRunInfo.entryPointOriginal || <em>not set</em>}</dd>
                        <dt>Ran as</dt>
                        <dd className={styles.debugMono}>{terminal.lastRunInfo.entryPointSent}</dd>
                        {terminal.lastRunInfo.entryPointOriginal !== terminal.lastRunInfo.entryPointSent && (
                          <>
                            <dt></dt>
                            <dd className={styles.debugWarn}>
                              Stored value didn&apos;t match any file — fell back to the first file.
                            </dd>
                          </>
                        )}
                      </dl>
                    </section>

                    <section className={styles.debugSection}>
                      <h3 className={styles.debugHeading}>Files</h3>
                      <table className={styles.debugFilesTable}>
                        <thead>
                          <tr>
                            <th>Your file name</th>
                            <th>Sent to container as</th>
                          </tr>
                        </thead>
                        <tbody>
                          {terminal.lastRunInfo.files.map(f => {
                            const isEntry = f.uuidName === terminal.lastRunInfo!.entryPointSent
                            const isKept = f.uuidName === f.originalName.split('/').pop()
                            return (
                              <tr key={f.uuidName} className={isEntry ? styles.debugFileEntry : ''}>
                                <td className={styles.debugMono}>{f.originalName}</td>
                                <td className={styles.debugMono}>
                                  {isKept ? <em title="Name kept — required by build tool">{f.uuidName}</em> : f.uuidName}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </section>

                    <section className={styles.debugSection}>
                      <h3 className={styles.debugHeading}>Container workspace</h3>
                      <p className={styles.debugNote}>What <code>/workspace/</code> looked like inside the runner container:</p>
                      <div className={styles.debugTree}>
                        <div className={styles.debugTreeRoot}>/workspace/</div>
                        {terminal.lastRunInfo.files.map((f, i) => {
                          const isLast = i === terminal.lastRunInfo!.files.length - 1
                          const isEntry = f.uuidName === terminal.lastRunInfo!.entryPointSent
                          const isKept = f.uuidName === f.originalName.split('/').pop()
                          return (
                            <div key={f.uuidName} className={styles.debugTreeRow}>
                              <span className={styles.debugTreeBranch}>{isLast ? '└── ' : '├── '}</span>
                              <span className={`${styles.debugMono} ${isEntry ? styles.debugTreeEntry : ''}`}>
                                {f.uuidName}
                              </span>
                              <span className={styles.debugTreeOrig}>
                                ← {f.originalName}
                                {isEntry ? ' (ran this)' : ''}
                                {isKept ? ' (name kept for tooling)' : ''}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  </>
                ) : (
                  <section className={styles.debugSection}>
                    <p className={styles.debugEmpty}>Press <strong>Run</strong> to see how this snippet is executed.</p>
                  </section>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Status bar */}
        <div className={styles.statusBar} role="status" aria-label="File information">
          <div className={styles.statusLeft}>
            <span className={styles.statusItem}>{snippet.language}</span>
            <span className={styles.statusSep} aria-hidden="true" />
            <span className={styles.statusItem}>{activeFile || filename}</span>
            <span className={styles.statusSep} aria-hidden="true" />
            <span className={styles.statusItem}>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            {namespace && (
              <>
                <span className={styles.statusSep} aria-hidden="true" />
                <span className={styles.statusItem}>{namespace.name}</span>
              </>
            )}
          </div>
          <div className={styles.statusRight}>
            {terminal.isRunning && (
              <span className={`${styles.statusItem} ${styles.statusRunning}`}>● Running</span>
            )}
            {saving && <span className={styles.statusItem}>Saving…</span>}
            <span className={styles.statusItem}>Updated {relativeTime(snippet.updatedAt)}</span>
          </div>
        </div>

        <SnippetComments snippetId={id} />

        <ShareDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          snippet={snippet}
        />

        <ForkDialog
          open={forkOpen}
          onClose={() => setForkOpen(false)}
          snippet={snippet}
        />

        <HistoryPanel
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          snippetId={id}
        />

        {/* Edit dialog */}
        <SnippetDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          editingSnippet={snippet}
          onSave={handleSave}
          metadataOnly
        />

        {/* Per-file ⋮ dropdown */}
        {menuFile && menuRect && (
          <FileMenu
            anchorRect={menuRect}
            canDelete={files.length > 1}
            onClose={() => setMenuFile(null)}
            onOpenInNewTab={() => openInTab(menuFile)}
            onRename={() => handleStartRename(menuFile)}
            onDuplicate={() => handleDuplicateFile(menuFile)}
            onDelete={() => handleDeleteFile(menuFile)}
            onCopyPath={handleCopyPath}
          />
        )}

        {/* Command palette */}
        <FileCommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          commands={commands}
        />

      </div>
    </PageLayout>
  )
}
