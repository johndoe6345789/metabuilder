'use client'

import type { Assembly, Materials, Part } from '@/lib/types'

const MATERIAL_COLORS: Record<string, string> = {
  aluminum: '#d0d0d0',
  castAluminum: '#a0a0a0',
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
  castAluminum: 'Cast Aluminum',
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
  selectedPart: Part | null
  onPartHover: (partId: string | null) => void
  onPartSelect: (partId: string | null) => void
}

export default function Sidebar({ assembly, materials, highlightedPart, selectedPart, onPartHover, onPartSelect }: SidebarProps) {
  const totalParts = assembly.parts.reduce((sum, p) => sum + p.quantity, 0)
  const totalWeight = assembly.parts.reduce((sum, p) => sum + (p.weight * p.quantity), 0)
  const uniqueMaterials = [...new Set(assembly.parts.map(p => p.material))]

  return (
    <aside className="sidebar">
      {selectedPart ? (
        // Installation Info Panel (shown when part is selected)
        <div className="panel installation-panel">
          <div className="panel-header">
            <h3>{selectedPart.name}</h3>
            <button className="close-btn" onClick={() => onPartSelect(null)}>×</button>
          </div>
          <div className="part-meta">
            <span className="pn">{selectedPart.partNumber}</span>
            <span className="material">{MATERIAL_NAMES[selectedPart.material] || selectedPart.material}</span>
          </div>

          {selectedPart.installation ? (
            <>
              {selectedPart.installation.tools.length > 0 && (
                <div className="install-section">
                  <h4>Required Tools</h4>
                  <ul className="tool-list">
                    {selectedPart.installation.tools.map((tool, i) => (
                      <li key={i} className={tool.required ? 'required' : 'optional'}>
                        <span className="tool-name">{tool.name}</span>
                        <span className="tool-size">{tool.size}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPart.installation.hardware.length > 0 && (
                <div className="install-section">
                  <h4>Hardware</h4>
                  <ul className="hardware-list">
                    {selectedPart.installation.hardware.map((hw, i) => (
                      <li key={i}>
                        <span className="hw-name">{hw.name}</span>
                        <span className="hw-spec">{hw.spec}</span>
                        <span className="hw-qty">×{hw.qty}</span>
                        {!hw.reusable && <span className="hw-replace" title="Replace on reassembly">⚠</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPart.installation.torque.length > 0 && (
                <div className="install-section">
                  <h4>Torque Specs</h4>
                  <ul className="torque-list">
                    {selectedPart.installation.torque.map((t, i) => (
                      <li key={i}>
                        <div className="torque-header">
                          <span className="torque-fastener">{t.fastener}</span>
                          <span className="torque-value">{t.value} {t.unit}</span>
                        </div>
                        {t.sequence && <div className="torque-sequence">{t.sequence}</div>}
                        {t.notes && <div className="torque-notes">{t.notes}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPart.installation.notes.length > 0 && (
                <div className="install-section">
                  <h4>Notes</h4>
                  <ul className="notes-list">
                    {selectedPart.installation.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="no-install-data">No installation data available</p>
          )}
        </div>
      ) : (
        // Default panels (shown when no part selected)
        <>
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
            <p className="hint">Click a part for installation info</p>
            <div className="parts-list">
              {assembly.parts.map(part => (
                <div
                  key={part.id}
                  className={`part-item ${highlightedPart === part.id ? 'highlighted' : ''}`}
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
      )}
    </aside>
  )
}
