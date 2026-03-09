import { useState } from 'react'
import { FloppyDisk } from '@phosphor-icons/react'
import { Card, Button } from '@metabuilder/components/fakemui'
import { Snippet } from '@/lib/types'
import { SnippetDialog } from '@/components/features/snippet-editor/SnippetDialog'

interface ComponentShowcaseProps {
  children: React.ReactNode
  code: string
  title: string
  description?: string
  language?: string
  category: string
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ComponentShowcase({
  children,
  code,
  title,
  description = '',
  language = 'tsx',
  category,
  onSaveSnippet,
}: ComponentShowcaseProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [prefilledData, setPrefilledData] = useState<{
    title: string
    description: string
    code: string
    language: string
    category: string
  } | null>(null)

  const handleSaveClick = () => {
    setPrefilledData({
      title,
      description,
      code,
      language,
      category,
    })
    setDialogOpen(true)
  }

  const handleSave = (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    onSaveSnippet(snippetData)
    setDialogOpen(false)
    setPrefilledData(null)
  }

  return (
    <>
      <Card
        className="relative group rounded-lg"
        style={{ position: 'relative' }}
        data-testid={`showcase-${category}-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
          data-testid="showcase-save-btn-container"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveClick}
            className="gap-2 shadow-lg"
            data-testid="showcase-save-btn"
            aria-label="Save as snippet"
          >
            <FloppyDisk size={16} aria-hidden="true" />
            Save as Snippet
          </Button>
        </div>
        {children}
      </Card>
      {prefilledData && (
        <SnippetDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
          editingSnippet={{
            id: '',
            title: prefilledData.title,
            description: prefilledData.description,
            code: prefilledData.code,
            language: prefilledData.language,
            category: prefilledData.category,
            createdAt: 0,
            updatedAt: 0,
          }}
        />
      )}
    </>
  )
}
