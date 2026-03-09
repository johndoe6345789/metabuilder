'use client'

import type { Part } from '@/lib/types'

interface PartSelectorProps {
  parts: Part[]
  selectedPartId: string | null
  onSelectPart: (partId: string) => void
}

export default function PartSelector({ parts, selectedPartId, onSelectPart }: PartSelectorProps) {
  return (
    <div className="part-selector">
      <div className="part-selector-list">
        {parts.map(part => (
          <div
            key={part.id}
            className={`part-selector-item ${selectedPartId === part.id ? 'selected' : ''}`}
            onClick={() => onSelectPart(part.id)}
          >
            <div className="part-selector-name">{part.name}</div>
            <div className="part-selector-number">{part.partNumber}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
