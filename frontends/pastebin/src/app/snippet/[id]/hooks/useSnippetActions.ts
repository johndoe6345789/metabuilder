import { useRef, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateSnippet } from '@/store/slices/snippetsSlice'
import { appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import { useCodeTerminal } from '@/hooks/useCodeTerminal'
import { Snippet } from '@/lib/types'
import { toast } from '@metabuilder/components/fakemui'

type FileList = { name: string; content: string }[]

export function useSnippetActions(
  snippet: Snippet | null,
  id: string,
  activeFile: string,
  setActiveTab: (tab: 'code' | 'terminal' | 'debug') => void,
) {
  const dispatch = useAppDispatch()
  const t = useTranslation()
  const [isCopied, setIsCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  const snippetRef = useRef(snippet)
  const activeFileRef = useRef(activeFile)
  const filesRef = useRef<FileList>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const terminal = useCodeTerminal()

  const handleCodeChange = (value: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    const fileBeingEdited = activeFileRef.current
    saveTimer.current = setTimeout(async () => {
      const cur = snippetRef.current
      const curFiles = filesRef.current
      if (!cur) return
      setSaving(true)
      try {
        const updatedFiles = curFiles.map(f =>
          f.name === fileBeingEdited ? { ...f, content: value } : f
        )
        const isEntry =
          fileBeingEdited === (cur.entryPoint ?? curFiles[0]?.name)
        await dispatch(updateSnippet({
          ...cur,
          code: isEntry ? value : cur.code,
          files: updatedFiles,
        })).unwrap()
      } catch {
        toast.error(t.toast.failedToSaveSnippet)
      } finally {
        setSaving(false)
      }
    }, 1000)
  }

  const handleCopy = (activeCode: string) => {
    navigator.clipboard.writeText(activeCode)
    toast.success(t.toast.codeCopied)
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
      (appConfig as unknown as {
        languageRunnerMap: Record<string, string>
      }).languageRunnerMap ?? {}
    const runnerKey = languageRunnerMap[snippet.language]
      ?? snippet.language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    terminal.handleRun(runnerKey, files, snippet.entryPoint ?? activeFile)
    setActiveTab('terminal')
  }

  const handleSave = async (
    data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    if (!snippet) return
    try {
      await dispatch(updateSnippet({ ...snippet, ...data })).unwrap()
      toast.success(t.toast.snippetUpdated)
    } catch {
      toast.error(t.toast.failedToSaveSnippet)
    }
  }

  return {
    isCopied, saving,
    snippetRef, activeFileRef, filesRef,
    terminal,
    handleCodeChange, handleCopy, handleCopyPath,
    handleRun, handleSave,
  }
}
