import { useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateSnippet } from '@/store/slices/snippetsSlice'
import { useTranslation } from '@/hooks/useTranslation'
import { Snippet } from '@/lib/types'
import { toast } from '@metabuilder/components/m3'

type FileList = { name: string; content: string }[]

export function useSnippetAutoSave(
  snippetRef: React.RefObject<Snippet | null>,
  activeFileRef: React.RefObject<string>,
  filesRef: React.RefObject<FileList>,
  setSaving: (v: boolean) => void,
) {
  const dispatch = useAppDispatch()
  const t = useTranslation()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
          f.name === fileBeingEdited ? { ...f, content: value } : f,
        )
        const isEntry =
          fileBeingEdited === (cur.entryPoint ?? curFiles[0]?.name)
        await dispatch(
          updateSnippet({
            ...cur,
            code: isEntry ? value : cur.code,
            files: updatedFiles,
          }),
        ).unwrap()
      } catch {
        toast.error(t.toast.failedToSaveSnippet)
      } finally {
        setSaving(false)
      }
    }, 1000)
  }

  const handleSave = async (
    snippet: Snippet,
    data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    try {
      await dispatch(updateSnippet({ ...snippet, ...data })).unwrap()
      toast.success(t.toast.snippetUpdated)
    } catch {
      toast.error(t.toast.failedToSaveSnippet)
    }
  }

  return { handleCodeChange, handleSave }
}
