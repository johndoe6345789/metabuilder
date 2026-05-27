'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Breadcrumb from '@/components/Breadcrumb'
import AssemblyTabs from '@/components/AssemblyTabs'
import ExplodedView from './ExplodedView'
import { useAssemblyData } from './hooks/useAssemblyData'
import { useAssemblyControls } from './hooks/useAssemblyControls'
import { useAssemblyInteraction } from './hooks/useAssemblyInteraction'

const PartViewer3D = dynamic(
  () => import('@/components/PartViewer3D'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: '100%', background: '#1a1a2e', borderRadius: 8 }}
      />
    ),
  }
)

export default function AssemblyPage() {
  const params = useParams()
  const category = params.category as string
  const manufacturer = params.manufacturer as string
  const product = params.product as string
  const assembly = params.assembly as string

  const { data, materials, loading, error } = useAssemblyData({
    category, manufacturer, product, assembly,
  })

  const {
    activeTab, setActiveTab,
    explosion, setExplosion,
    rotation, setRotation,
    handleAnimate, handleExport,
  } = useAssemblyControls()

  const {
    highlightedPart, selectedPart, tooltip,
    handlePartHover, handlePartSelect,
  } = useAssemblyInteraction(data)

  const breadcrumbPath = [category, manufacturer, product, assembly]

  if (loading) {
    return (
      <>
        <Breadcrumb path={breadcrumbPath} />
        <div className="browser-section"><p>Loading assembly...</p></div>
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <Breadcrumb path={breadcrumbPath} />
        <div className="browser-section">
          <p style={{ color: '#d94a4a' }}>Error: {error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Breadcrumb path={breadcrumbPath} />
      <AssemblyTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'exploded' ? (
        <ExplodedView
          data={data}
          materials={materials}
          explosion={explosion}
          rotation={rotation}
          highlightedPart={highlightedPart}
          selectedPart={selectedPart}
          tooltip={tooltip}
          onExplosionChange={setExplosion}
          onRotationChange={setRotation}
          onAnimate={handleAnimate}
          onExport={() => handleExport(assembly)}
          onPartHover={handlePartHover}
          onPartSelect={handlePartSelect}
        />
      ) : (
        <PartViewer3D parts={data.parts} materials={materials} />
      )}
    </>
  )
}
