'use client'

import type { Assembly, Materials } from '@/lib/types'

const MATERIAL_COLORS: Record<string, string> = {
  aluminum: '#d0d0d0',
  steel: '#6a6a6a',
  blueAnodized: '#4a90d9',
  redAnodized: '#d94a4a',
  blackPlastic: '#2a2a2a',
  copper: '#b87333',
  titanium: '#8a8a8a',
  brass: '#d4a84a',
  spring: '#d94a4a',
  greenSpring: '#4ad94a'
}

const MATERIAL_NAMES: Record<string, string> = {
  aluminum: 'Aluminum',
  steel: 'Steel',
  blueAnodized: 'Anodized (Blue)',
  redAnodized: 'Anodized (Red)',
  blackPlastic: 'Composite',
  copper: 'Copper',
  titanium: 'Titanium',
  brass: 'Brass',
  spring: 'Spring Steel',
  greenSpring: 'Spring (Soft)'
}

interface SidebarProps {
  assembly: Assembly
  materials: Materials
  highlightedPart: string | null
  onPartHover: (partId: string | null) => void
}

export default function Sidebar({ assembly, materials, highlightedPart, onPartHover }: SidebarProps) {
  const totalParts = assembly.parts.reduce((sum, p) => sum + p.quantity, 0)
  const totalWeight = assembly.parts.reduce((sum, p) => sum + (p.weight * p.quantity), 0)
  const uniqueMaterials = [...new Set(assembly.parts.map(p => p.material))]

  return (
    <aside className="sidebar">
      <div className="panel">
        <h3>Assembly Stats</h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="value">{assembly.parts.length}</div>
            <div className="label">Unique Parts</div>
          </div>
          <div className="stat">
            <div className="value">
              {totalWeight < 1000 ? `${totalWeight.toFixed(0)}g` : `${(totalWeight / 1000).toFixed(2)}kg`}
            </div>
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
        <div className="parts-list">
          {assembly.parts.map(part => (
            <div
              key={part.id}
              className={`part-item ${highlightedPart === part.id ? 'highlighted' : ''}`}
              onMouseEnter={() => onPartHover(part.id)}
              onMouseLeave={() => onPartHover(null)}
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
    </aside>
  )
}
