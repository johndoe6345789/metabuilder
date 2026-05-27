'use client'

import { useState, useCallback } from 'react'

export function useAssemblyControls() {
  const [activeTab, setActiveTab] = useState<'exploded' | '3d'>('exploded')
  const [explosion, setExplosion] = useState(50)
  const [rotation, setRotation] = useState(0)

  const handleAnimate = useCallback(() => {
    const start = explosion
    const target = start < 50 ? 100 : 0
    const duration = 1200
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setExplosion(start + (target - start) * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [explosion])

  const handleExport = useCallback(
    (assemblySlug: string) => {
      const svg = document.querySelector('.diagram-container svg')
      if (!svg) return
      const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${assemblySlug}-exploded.svg`
      a.click()
      URL.revokeObjectURL(url)
    },
    []
  )

  return {
    activeTab,
    setActiveTab,
    explosion,
    setExplosion,
    rotation,
    setRotation,
    handleAnimate,
    handleExport,
  }
}
