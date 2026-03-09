'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Breadcrumb from '@/components/Breadcrumb'
import Controls from '@/components/Controls'
import Sidebar from '@/components/Sidebar'
import Tooltip from '@/components/Tooltip'
import AssemblyTabs from '@/components/AssemblyTabs'
import { loadAssembly, loadMaterials } from '@/lib/loader'
import type { Assembly, Materials, Part } from '@/lib/types'

const DiagramRenderer = dynamic(() => import('@/components/DiagramRenderer'), {
  loading: () => <div style={{ height: '100%', background: '#1a1a2e', borderRadius: 8 }} />
})

const PartViewer3D = dynamic(() => import('@/components/PartViewer3D'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', background: '#1a1a2e', borderRadius: 8 }} />
})

export default function AssemblyPage() {
  const params = useParams()
  const category = params.category as string
  const manufacturer = params.manufacturer as string
  const product = params.product as string
  const assembly = params.assembly as string

  const [data, setData] = useState<Assembly | null>(null)
  const [materials, setMaterials] = useState<Materials>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'exploded' | '3d'>('exploded')
  const [explosion, setExplosion] = useState(50)
  const [rotation, setRotation] = useState(0)
  const [highlightedPart, setHighlightedPart] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [tooltip, setTooltip] = useState<{ part: Part; x: number; y: number } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [assemblyData, materialsData] = await Promise.all([
          loadAssembly(category, manufacturer, product, assembly),
          loadMaterials()
        ])
        setData(assemblyData)
        setMaterials(materialsData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assembly')
        setLoading(false)
      }
    }
    load()
  }, [category, manufacturer, product, assembly])

  const handlePartHover = useCallback((partId: string | null, event?: MouseEvent) => {
    setHighlightedPart(partId)
    if (partId && data && event) {
      const part = data.parts.find(p => p.id === partId)
      if (part) {
        setTooltip({ part, x: event.clientX, y: event.clientY })
      }
    } else {
      setTooltip(null)
    }
  }, [data])

  const handlePartSelect = useCallback((partId: string | null) => {
    if (partId && data) {
      const part = data.parts.find(p => p.id === partId)
      setSelectedPart(part || null)
    } else {
      setSelectedPart(null)
    }
  }, [data])

  const handleAnimate = useCallback(() => {
    const start = explosion
    const target = start < 50 ? 100 : 0
    const duration = 1200
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const newVal = start + (target - start) * eased
      setExplosion(newVal)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [explosion])

  const handleExport = useCallback(() => {
    const svg = document.querySelector('.diagram-container svg')
    if (!svg) return

    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assembly}-exploded.svg`
    a.click()
    URL.revokeObjectURL(url)
  }, [assembly])

  if (loading) {
    return (
      <>
        <Breadcrumb path={[category, manufacturer, product, assembly]} />
        <div className="browser-section">
          <p>Loading assembly...</p>
        </div>
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <Breadcrumb path={[category, manufacturer, product, assembly]} />
        <div className="browser-section">
          <p style={{ color: '#d94a4a' }}>Error: {error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Breadcrumb path={[category, manufacturer, product, assembly]} />
      <AssemblyTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'exploded' ? (
        <>
          <Controls
            explosion={explosion}
            rotation={rotation}
            onExplosionChange={setExplosion}
            onRotationChange={setRotation}
            onAnimate={handleAnimate}
            onExport={handleExport}
          />

          <div className="main-layout">
            <div className="diagram-container">
              <DiagramRenderer
                assembly={data}
                materials={materials}
                explosion={explosion}
                rotation={rotation}
                highlightedPart={highlightedPart}
                onPartHover={handlePartHover}
              />
            </div>

            <Sidebar
              assembly={data}
              materials={materials}
              highlightedPart={highlightedPart}
              selectedPart={selectedPart}
              onPartHover={handlePartHover}
              onPartSelect={handlePartSelect}
            />
          </div>

          <Tooltip tooltip={tooltip} materials={materials} />
        </>
      ) : (
        <PartViewer3D parts={data.parts} materials={materials} />
      )}
    </>
  )
}
