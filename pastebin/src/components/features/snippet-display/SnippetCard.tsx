import { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Snippet, Namespace } from '@/lib/types'
import { strings, appConfig } from '@/lib/config'
import { getAllNamespaces, moveSnippetToNamespace } from '@/lib/db'
import { toast } from 'sonner'
import { SnippetCardHeader } from './SnippetCardHeader'
import { SnippetCodePreview } from './SnippetCodePreview'
import { SnippetCardActions } from './SnippetCardActions'

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
  const [isCopied, setIsCopied] = useState(false)
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [isMoving, setIsMoving] = useState(false)

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
      toast.info('Snippet is already in this namespace')
      return
    }

    setIsMoving(true)
    try {
      await moveSnippetToNamespace(snippet.id, targetNamespaceId)
      const targetNamespace = namespaces.find(n => n.id === targetNamespaceId)
      toast.success(`Moved to ${targetNamespace?.name || 'namespace'}`)
      if (onMove) {
        onMove()
      }
    } catch (error) {
      console.error('Failed to move snippet:', error)
      toast.error('Failed to move snippet')
    } finally {
      setIsMoving(false)
    }
  }

  if (!snippet) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">{strings.snippetCard.errorMessage}</p>
      </Card>
    )
  }

  const availableNamespaces = namespaces.filter(n => n.id !== snippet.namespaceId)

  return (
    <Card
      className={`group overflow-hidden hover:border-accent/50 transition-all cursor-pointer ${
        isSelected ? 'border-accent ring-2 ring-accent/20' : ''
      }`}
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
      <div className="p-6 space-y-4">
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
    </Card>
  )
}
