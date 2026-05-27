import { useState, useMemo, useEffect } from 'react'
import { Snippet, Namespace } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import { getAllNamespaces } from '@/lib/db'
import { useAppDispatch } from '@/store/hooks'
import { moveSnippet } from '@/store/slices/snippetsSlice'
import { toast } from '@metabuilder/components/fakemui'

interface UseSnippetCardProps {
  snippet: Snippet
  onCopy: (code: string) => void
  onMove?: () => void
  onToggleSelect?: (id: string) => void
  selectionMode?: boolean
  onView: (snippet: Snippet) => void
}

export function useSnippetCard({
  snippet,
  onCopy,
  onMove,
  onToggleSelect,
  selectionMode,
  onView,
}: UseSnippetCardProps) {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const [isCopied, setIsCopied] = useState(false)
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [isMoving, setIsMoving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    getAllNamespaces()
      .then(setNamespaces)
      .catch(() => console.error('Failed to load namespaces'))
  }, [])

  const snippetData = useMemo(() => {
    const code = snippet?.code || ''
    const description = snippet?.description || ''
    const maxLength = appConfig.codePreviewMaxLength
    const isTruncated = code.length > maxLength
    const displayCode = isTruncated
      ? code.slice(0, maxLength) + '...'
      : code
    return {
      description,
      displayCode,
      fullCode: code,
      isTruncated,
      hasPreview: snippet?.hasPreview || false,
    }
  }, [snippet])

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy(snippetData.fullCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), appConfig.copiedTimeout)
  }

  const handleToggleSelect = () => {
    if (onToggleSelect) onToggleSelect(snippet.id)
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectionMode) handleToggleSelect()
    else onView(snippet)
  }

  const handleMoveToNamespace = async (
    targetNamespaceId: string,
  ) => {
    if (snippet.namespaceId === targetNamespaceId) {
      toast.info(t.snippetCard.alreadyInNamespace)
      return
    }
    setIsMoving(true)
    try {
      await dispatch(
        moveSnippet({ snippetId: snippet.id, targetNamespaceId }),
      ).unwrap()
      const target = namespaces.find(n => n.id === targetNamespaceId)
      toast.success(
        t.snippetCard.movedTo.replace(
          '{name}',
          target?.name || 'namespace',
        ),
      )
      if (onMove) onMove()
    } catch (error) {
      console.error('Failed to move snippet:', error)
      toast.error(t.snippetCard.failedToMove)
    } finally {
      setIsMoving(false)
    }
  }

  const availableNamespaces = namespaces.filter(
    n => n.id !== snippet.namespaceId,
  )

  return {
    t,
    isCopied,
    isMoving,
    deleteConfirmOpen,
    snippetData,
    availableNamespaces,
    setDeleteConfirmOpen,
    handleCopy,
    handleView,
    handleToggleSelect,
    handleMoveToNamespace,
  }
}
