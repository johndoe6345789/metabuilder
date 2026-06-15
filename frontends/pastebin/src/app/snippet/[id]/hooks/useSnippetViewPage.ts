import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectSnippets, selectNamespaces } from '@/store/selectors'
import { useSnippetFileOps } from './useSnippetFileOps'
import { useSnippetActions } from './useSnippetActions'

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  JavaScript: 'js',
  TypeScript: 'ts',
  JSX: 'jsx',
  TSX: 'tsx',
  Python: 'py',
  Java: 'java',
  'C++': 'cpp',
  'C#': 'cs',
  Go: 'go',
  Rust: 'rs',
  Ruby: 'rb',
  PHP: 'php',
  Swift: 'swift',
  Kotlin: 'kt',
  Scala: 'scala',
  Haskell: 'hs',
  R: 'r',
  Julia: 'jl',
  Elixir: 'ex',
  Dart: 'dart',
  Lua: 'lua',
  Perl: 'pl',
  HTML: 'html',
  CSS: 'css',
  SQL: 'sql',
  'SQL (SQLite)': 'sql',
  'SQL (MySQL)': 'sql',
  'SQL (PostgreSQL)': 'sql',
  Bash: 'sh',
}

export function getFilename(title: string, language: string): string {
  const ext = LANGUAGE_EXTENSIONS[language] ?? 'txt'
  const base =
    title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .slice(0, 30) || 'snippet'
  return `${base}.${ext}`
}

export type ActiveTab = 'code' | 'terminal' | 'debug'

export function useSnippetViewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const snippets = useAppSelector(selectSnippets)
  const namespaces = useAppSelector(selectNamespaces)
  const snippet = snippets.find(s => s.id === id) ?? null

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
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [menuFile, setMenuFile] = useState<string | null>(null)
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)

  const fileOps = useSnippetFileOps(snippet)
  const actions = useSnippetActions(
    snippet,
    id,
    activeFile,
    setActiveTab,
    setActiveFile,
    setOpenFiles,
  )

  useEffect(() => {
    if (snippets.length > 0 && !snippet) router.replace('/')
  }, [snippet, snippets.length, router])

  useEffect(() => {
    if (!snippet) return
    const defaultName = getFilename(snippet.title, snippet.language)
    const initial =
      snippet.entryPoint ||
      (snippet.files?.length ? snippet.files[0].name : defaultName)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveFile(initial)
    setOpenFiles(prev => (prev.length > 0 ? prev : [initial]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippet?.id])

  useEffect(() => {
    if (!snippet) return
    const curFiles =
      snippet.files && snippet.files.length > 0
        ? snippet.files
        : [
            {
              name: getFilename(snippet.title, snippet.language),
              content: snippet.code,
            },
          ]
    const fileObj = curFiles.find(f => f.name === activeFile) ?? curFiles[0]
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalCode(fileObj?.content ?? snippet.code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile, snippet?.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      }
      if (e.key === 'F2' && activeFile && !paletteOpen && !fileOps.renaming) {
        e.preventDefault()
        fileOps.handleStartRename(activeFile)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile, paletteOpen, fileOps.renaming])

  const openInTab = (name: string) => {
    setOpenFiles(prev => (prev.includes(name) ? prev : [...prev, name]))
    setActiveFile(name)
    setActiveTab('code')
  }

  const closeTab = (name: string) => {
    setOpenFiles(prev => {
      if (prev.length <= 1) return prev
      const next = prev.filter(f => f !== name)
      if (activeFile === name) {
        const idx = prev.indexOf(name)
        setActiveFile(next[Math.max(0, idx - 1)])
      }
      return next
    })
  }

  // Sync refs for actions
  const { snippetRef, activeFileRef } = actions
  // eslint-disable-next-line react-hooks/refs
  snippetRef.current = snippet
  // eslint-disable-next-line react-hooks/refs
  activeFileRef.current = activeFile

  // Follow execution: when the debugger stops in a known file, jump the editor
  // to it so the current line / breakpoint hit is always visible.
  const debugFile = actions.debugger.state.currentFile
  useEffect(() => {
    if (!debugFile || debugFile === activeFile) return
    if (!snippet?.files?.some(f => f.name === debugFile)) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenFiles(prev =>
      prev.includes(debugFile) ? prev : [...prev, debugFile],
    )
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveFile(debugFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debugFile])

  return {
    id,
    snippet,
    namespaces,
    showPreview,
    setShowPreview,
    wordWrap,
    setWordWrap,
    activeFile,
    setActiveFile,
    activeTab,
    setActiveTab,
    editOpen,
    setEditOpen,
    shareOpen,
    setShareOpen,
    forkOpen,
    setForkOpen,
    historyOpen,
    setHistoryOpen,
    openFiles,
    localCode,
    paletteOpen,
    setPaletteOpen,
    menuFile,
    setMenuFile,
    menuRect,
    setMenuRect,
    snippetRef: actions.snippetRef,
    activeFileRef: actions.activeFileRef,
    filesRef: actions.filesRef,
    terminal: actions.terminal,
    isCopied: actions.isCopied,
    saving: actions.saving,
    handleCodeChange: actions.handleCodeChange,
    handleCopy: actions.handleCopy,
    handleCopyPath: actions.handleCopyPath,
    handleRun: actions.handleRun,
    handleDebug: actions.handleDebug,
    handleSave: actions.handleSave,
    debugger: actions.debugger,
    openInTab,
    closeTab,
    ...fileOps,
  }
}
