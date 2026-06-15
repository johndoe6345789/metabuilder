import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { appConfig } from '@/lib/config'
import { useCodeTerminal } from '@/hooks/useCodeTerminal'
import { useDebugger } from '@/hooks/useDebugger'
import { useSnippetAutoSave } from './useSnippetAutoSave'
import { Snippet } from '@/lib/types'
import { toast } from '@metabuilder/components/fakemui'

type FileList = { name: string; content: string }[]

export function useSnippetActions(
  snippet: Snippet | null,
  id: string,
  activeFile: string,
  setActiveTab: (tab: 'code' | 'terminal' | 'debug') => void,
  setActiveFile: (name: string) => void,
  setOpenFiles: Dispatch<SetStateAction<string[]>>,
) {
  const [isCopied, setIsCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  const snippetRef = useRef(snippet)
  const activeFileRef = useRef(activeFile)
  const filesRef = useRef<FileList>([])

  const terminal = useCodeTerminal()
  const dbg = useDebugger()
  const autoSave = useSnippetAutoSave(
    snippetRef,
    activeFileRef,
    filesRef,
    setSaving,
  )

  const handleCopy = (activeCode: string) => {
    navigator.clipboard.writeText(activeCode)
    toast.success('Code copied to clipboard')
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), appConfig.copiedTimeout)
  }

  const handleCopyPath = () => {
    navigator.clipboard.writeText(`/${id}/${activeFile}`)
    toast.success('Path copied to clipboard')
  }

  const handleRun = (files: FileList) => {
    if (!snippet) return
    const languageRunnerMap: Record<string, string> =
      (
        appConfig as unknown as {
          languageRunnerMap: Record<string, string>
        }
      ).languageRunnerMap ?? {}
    const runnerKey =
      languageRunnerMap[snippet.language] ??
      snippet.language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    terminal.handleRun(runnerKey, files, snippet.entryPoint ?? activeFile)
    setActiveTab('terminal')
  }

  const handleDebug = (files: FileList) => {
    if (!snippet) return
    const entry = snippet.entryPoint ?? activeFile
    // Show the file you'll actually be debugging: prefer one that has a
    // breakpoint set (the entry point if it does), otherwise the entry point.
    const bps = dbg.state.breakpoints
    const bpFiles = Object.keys(bps).filter(f => (bps[f]?.length ?? 0) > 0)
    const target = bpFiles.includes(entry) ? entry : bpFiles[0] ?? entry
    if (target) {
      setOpenFiles(prev => (prev.includes(target) ? prev : [...prev, target]))
      setActiveFile(target)
    }
    void dbg
      .startDebugging(snippet.language, files, entry)
      .catch(err => {
        toast.error(err instanceof Error ? err.message : String(err))
      })
    setActiveTab('debug')
  }

  const handleSave = (
    data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    if (!snippet) return Promise.resolve()
    return autoSave.handleSave(snippet, data)
  }

  return {
    isCopied,
    saving,
    snippetRef,
    activeFileRef,
    filesRef,
    terminal,
    debugger: dbg,
    handleCodeChange: autoSave.handleCodeChange,
    handleCopy,
    handleCopyPath,
    handleRun,
    handleDebug,
    handleSave,
  }
}
