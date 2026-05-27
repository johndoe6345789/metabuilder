'use client'

import type { Assembly, Part } from '@/lib/types'
import materialData from './data/materials.json'
import { useSidebarStats } from './hooks/useSidebarStats'

const MATERIAL_COLORS = materialData.colors as Record<string, string>
const MATERIAL_NAMES = materialData.names as Record<string, string>

interface AssemblyStatsPanelProps {
  assembly: Assembly
  highlightedPart: string | null
  onPartHover: (partId: string | null) => void
  onPartSelect: (partId: string | null) => void
}

export default function AssemblyStatsPanel({
  assembly,
  highlightedPart,
  onPartHover,
  onPartSelect,
}: AssemblyStatsPanelProps) {
  const {
    totalParts,
    uniqueMaterials,
    weightLabel,
  } = useSidebarStats(assembly)

  return (
    <>
      <div className="panel">
        <h3>Assembly Stats</h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="value">{assembly.parts.length}</div>
            <div className="label">Unique Parts</div>
          </div>
          <div className="stat">
            <div className="value">{weightLabel}</div>
            <div className="label">Weight</div>
          </div>
          <div className="stat">
            <div className="value">{assembly.category || '-'}</div>
            <div className="label">Category</div>
          </div>
          <div className="stat">
            <div className="value">{totalParts}</div>
            <div className="label">Total Pieces</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Parts List</h3>
        <p className="hint">Click a part for installation info</p>
        <div className="parts-list">
          {assembly.parts.map(part => (
            <div
              key={part.id}
              className={[
                'part-item',
                highlightedPart === part.id ? 'highlighted' : '',
              ].join(' ').trim()}
              onMouseEnter={() => onPartHover(part.id)}
              onMouseLeave={() => onPartHover(null)}
              onClick={() => onPartSelect(part.id)}
            >
              <span className="name">{part.name}</span>
              <span className="pn">{part.partNumber}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Materials</h3>
        <div className="legend-grid">
          {uniqueMaterials.map(m => (
            <div key={m} className="legend-item">
              <div
                className="color"
                style={{ background: MATERIAL_COLORS[m] || '#888' }}
              />
              <span>{MATERIAL_NAMES[m] || m}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
