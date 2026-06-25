'use client'

import type { Assembly, Materials, Part } from '@/lib/types'
import InstallationPanel from './InstallationPanel'
import AssemblyStatsPanel from './AssemblyStatsPanel'

interface SidebarProps {
  assembly: Assembly
  materials: Materials
  highlightedPart: string | null
  selectedPart: Part | null
  onPartHover: (partId: string | null) => void
  onPartSelect: (partId: string | null) => void
}

export default function Sidebar({
  assembly,
  materials,
  highlightedPart,
  selectedPart,
  onPartHover,
  onPartSelect,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      {selectedPart ? (
        <InstallationPanel
          part={selectedPart}
          onClose={() => onPartSelect(null)}
        />
      ) : (
        <AssemblyStatsPanel
          assembly={assembly}
          highlightedPart={highlightedPart}
          onPartHover={onPartHover}
          onPartSelect={onPartSelect}
        />
      )}
    </aside>
  )
}
