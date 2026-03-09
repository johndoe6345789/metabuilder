import { useState, useMemo, useEffect } from 'react'
import { Card, Button, Dialog, DialogHeader, DialogTitle, DialogContent, DialogActions } from '@metabuilder/components/fakemui'
import { Snippet, Namespace } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import { getAllNamespaces } from '@/lib/db'
import { useAppDispatch } from '@/store/hooks'
import { moveSnippet } from '@/store/slices/snippetsSlice'
import { toast } from '@metabuilder/components/fakemui'
import { SnippetCardHeader } from './SnippetCardHeader'
import { SnippetCodePreview } from './SnippetCodePreview'
import { SnippetCardActions } from './SnippetCardActions'
import styles from './snippet-card.module.scss'

interface SnippetCardProps {
  snippet: Snippet
  onEdit: (snippet: Snippet) => void
  onDelete: (id: string) => void
  onCopy: (code: string) => void
  onView: (snippet: Snippet) => void
  onMove?: () => void
  selectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}

export function SnippetCard({ 
  snippet, 
  onEdit, 
  onDelete, 
  onCopy, 
  onView, 
  onMove,
  selectionMode = false,
  isSelected = false,
  onToggleSelect
}: SnippetCardProps) {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const [isCopied, setIsCopied] = useState(false)
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [isMoving, setIsMoving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    loadNamespaces()
  }, [])

  const loadNamespaces = async () => {
    try {
      const loadedNamespaces = await getAllNamespaces()
      setNamespaces(loadedNamespaces)
    } catch {
      console.error('Failed to load namespaces')
    }
  }

  const snippetData = useMemo(() => {
    const code = snippet?.code || ''
    const description = snippet?.description || ''
    const maxLength = appConfig.codePreviewMaxLength
    const isTruncated = code.length > maxLength
    const displayCode = isTruncated ? code.slice(0, maxLength) + '...' : code

    return {
      description,
      displayCode,
      fullCode: code,
      isTruncated,
      hasPreview: snippet?.hasPreview || false
    }
  }, [snippet])

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy(snippetData.fullCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), appConfig.copiedTimeout)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(snippet)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false)
    onDelete(snippet.id)
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectionMode) {
      handleToggleSelect()
    } else {
      onView(snippet)
    }
  }

  const handleToggleSelect = () => {
    if (onToggleSelect) {
      onToggleSelect(snippet.id)
    }
  }

  const handleMoveToNamespace = async (targetNamespaceId: string) => {
    if (snippet.namespaceId === targetNamespaceId) {
      toast.info(t.snippetCard.alreadyInNamespace)
      return
    }

    setIsMoving(true)
    try {
      await dispatch(moveSnippet({ snippetId: snippet.id, targetNamespaceId })).unwrap()
      const targetNamespace = namespaces.find(n => n.id === targetNamespaceId)
      toast.success(t.snippetCard.movedTo.replace('{name}', targetNamespace?.name || 'namespace'))
      if (onMove) {
        onMove()
      }
    } catch (error) {
      console.error('Failed to move snippet:', error)
      toast.error(t.snippetCard.failedToMove)
    } finally {
      setIsMoving(false)
    }
  }

  if (!snippet) {
    return (
      <Card role="article">
        <p className={styles.errorText}>{t.snippetCard.errorMessage}</p>
      </Card>
    )
  }

  const availableNamespaces = namespaces.filter(n => n.id !== snippet.namespaceId)

  return (
    <Card
      className={`group transition-all cursor-pointer${isSelected ? ` border-accent ${styles.cardSelected}` : ''}`}
      onClick={handleView}
      data-testid={`snippet-card-${snippet.id}`}
      role="article"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleView(e as any)
        }
      }}
    >
      <div className={styles.cardBody}>
        <SnippetCardHeader 
          snippet={snippet}
          description={snippetData.description}
          selectionMode={selectionMode}
          isSelected={isSelected}
          onToggleSelect={handleToggleSelect}
        />

        <SnippetCodePreview 
          displayCode={snippetData.displayCode}
          isTruncated={snippetData.isTruncated}
        />

        {!selectionMode && (
          <SnippetCardActions 
            isCopied={isCopied}
            isMoving={isMoving}
            availableNamespaces={availableNamespaces}
            onView={handleView}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveToNamespace={handleMoveToNamespace}
          />
        )}
      </div>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogHeader>
          <DialogTitle>{t.snippetCard.deleteDialog.title}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>{t.snippetCard.deleteDialog.body.replace('{title}', snippet.title)}</p>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteConfirmOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            data-testid="confirm-delete-snippet-btn"
            className={styles.deleteButton}
            variant="outlined"
          >
            {t.common.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
