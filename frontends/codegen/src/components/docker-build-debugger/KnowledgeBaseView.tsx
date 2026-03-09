import { useMemo, useState } from 'react'
import { knowledgeBase } from '@/lib/docker-parser'
import { KnowledgeBaseItem } from '@/types/docker'
import { KnowledgeBaseModal } from './KnowledgeBaseModal'
import { KnowledgeBaseResults } from './KnowledgeBaseResults'
import { KnowledgeBaseSearchPanel } from './KnowledgeBaseSearchPanel'

type KnowledgeBaseViewProps = {
  onCopy: (text: string, label: string) => void
  text: {
    title: string
    description: string
    searchPlaceholder: string
    noResults: string
    closeButton: string
    patternLabel: string
    explanationTitle: string
    solutionsTitle: string
  }
  commonText: {
    stepsLabel: string
    codeLabel: string
    copyButton: string
    codeCopyLabel: string
  }
}

export function KnowledgeBaseView({ onCopy, text, commonText }: KnowledgeBaseViewProps) {
  const [selectedKbItem, setSelectedKbItem] = useState<KnowledgeBaseItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredKnowledgeBase = useMemo(
    () =>
      knowledgeBase.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.explanation.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  )

  return (
    <div className="space-y-6">
      <KnowledgeBaseSearchPanel
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        text={text}
      />
      <KnowledgeBaseResults
        items={filteredKnowledgeBase}
        onSelect={setSelectedKbItem}
        searchQuery={searchQuery}
        text={text}
      />
      <KnowledgeBaseModal
        item={selectedKbItem}
        onClose={() => setSelectedKbItem(null)}
        onCopy={onCopy}
        text={text}
        commonText={commonText}
      />
    </div>
  )
}
