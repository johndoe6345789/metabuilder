'use client'

type TabValue = 'exploded' | '3d'

interface AssemblyTabsProps {
  activeTab: TabValue
  onTabChange: (tab: TabValue) => void
}

export default function AssemblyTabs({ activeTab, onTabChange }: AssemblyTabsProps) {
  return (
    <div className="assembly-tabs">
      <button
        className={`assembly-tab ${activeTab === 'exploded' ? 'active' : ''}`}
        onClick={() => onTabChange('exploded')}
      >
        Exploded View
      </button>
      <button
        className={`assembly-tab ${activeTab === '3d' ? 'active' : ''}`}
        onClick={() => onTabChange('3d')}
      >
        3D Part View
      </button>
    </div>
  )
}
