import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createSnippet, updateSnippet } from '@/store/slices/snippetsSlice'
import { selectSelectedNamespaceId } from '@/store/selectors'
import { useSnippetForm } from '@/hooks/useSnippetForm'
import { useTranslation } from '@/hooks/useTranslation'
import { appConfig } from '@/lib/config'
import { Snippet } from '@/lib/types'
import { toast } from '@metabuilder/components/fakemui'

export function useSnippetEditorPage(initialSnippet?: Snippet | null) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const t = useTranslation()
  const selectedNamespaceId = useAppSelector(selectSelectedNamespaceId)
  const [activeTab, setActiveTab] = useState(0)

  const form = useSnippetForm(initialSnippet)

  const isEditing = Boolean(initialSnippet?.id)
  const isPreviewSupported = appConfig.previewEnabledLanguages.includes(
    form.language,
  )
  const showPreviewTab = isPreviewSupported && form.hasPreview
  const tabCount = showPreviewTab ? 3 : 2

  const handleCodeChange = (value: string) => {
    form.updateFileContent(form.activeFile, value)
  }

  const handleSave = async () => {
    if (!form.validate()) {
      if (form.errors.code) setActiveTab(1)
      return
    }
    const data = form.getFormData()
    try {
      if (isEditing && initialSnippet) {
        await dispatch(updateSnippet({ ...initialSnippet, ...data })).unwrap()
        toast.success(t.toast.snippetUpdated)
      } else {
        await dispatch(
          createSnippet({
            ...data,
            namespaceId: selectedNamespaceId || undefined,
          }),
        ).unwrap()
        toast.success(t.toast.snippetCreated)
      }
      router.push('/')
    } catch {
      toast.error(t.toast.failedToSaveSnippet)
    }
  }

  const pageTitle = isEditing
    ? `${t.snippetDialog.edit.title}${
        initialSnippet?.title ? `: ${initialSnippet.title}` : ''
      }`
    : t.snippetDialog.create.title

  return {
    t,
    activeTab,
    setActiveTab,
    tabCount,
    isEditing,
    pageTitle,
    handleCodeChange,
    handleSave,
    form,
    router,
  }
}
