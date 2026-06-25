import { useEffect, useRef, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import copy from '@/data/favicon-designer.json'
import { useUIState } from '@/hooks/use-ui-state'
import { DEFAULT_DESIGN } from './constants'
import { drawCanvas } from './canvasUtils'
import { formatCopy } from './formatCopy'
import type {
  BrushEffect,
  FaviconDesign,
  FaviconElement,
} from './types'
import { useFaviconExport } from './hooks/useFaviconExport'
import { useFaviconCanvas } from './hooks/useFaviconCanvas'

export const useFaviconDesigner = () => {
  const [designs, setDesigns] = useUIState<
    FaviconDesign[]
  >('favicon-designs', [DEFAULT_DESIGN])
  const [activeDesignId, setActiveDesignId] =
    useState<string>(DEFAULT_DESIGN.id)
  const [selectedElementId, setSelectedElementId] =
    useState<string | null>(null)
  const [drawMode, setDrawMode] = useState<
    'select' | 'draw' | 'erase'
  >('select')
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#ffffff')
  const [brushEffect, setBrushEffect] =
    useState<BrushEffect>('solid')
  const [gradientColor, setGradientColor] =
    useState('#ff00ff')
  const [glowIntensity, setGlowIntensity] = useState(10)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef =
    useRef<HTMLCanvasElement>(null)

  const safeDesigns = designs || [DEFAULT_DESIGN]
  const activeDesign =
    safeDesigns.find((d) => d.id === activeDesignId) ||
    DEFAULT_DESIGN
  const selectedElement = activeDesign.elements.find(
    (e) => e.id === selectedElementId
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawCanvas(canvas, activeDesign)
  }, [activeDesign])

  useEffect(() => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = activeDesign.size
    canvas.height = activeDesign.size
    ctx.clearRect(
      0,
      0,
      activeDesign.size,
      activeDesign.size
    )
  }, [activeDesign, drawMode])

  // ── Element CRUD ────────────────────────────────────────

  const handleAddElement = (
    type: FaviconElement['type']
  ) => {
    const newElement: FaviconElement = {
      id: `element-${Date.now()}`,
      type,
      x: activeDesign.size / 2,
      y: activeDesign.size / 2,
      width:
        type === 'text' || type === 'emoji' ? 100 : 40,
      height:
        type === 'text' || type === 'emoji' ? 100 : 40,
      color: '#ffffff',
      rotation: 0,
      ...(type === 'text' && {
        text: copy.defaults.newText,
        fontSize: 32,
        fontWeight: 'bold',
      }),
      ...(type === 'emoji' && {
        emoji: copy.defaults.newEmoji,
        fontSize: 40,
      }),
    }

    setDesigns((current) =>
      (current || []).map((d) =>
        d.id === activeDesignId
          ? {
              ...d,
              elements: [...d.elements, newElement],
              updatedAt: Date.now(),
            }
          : d
      )
    )
    setSelectedElementId(newElement.id)
  }

  const handleAddElementFromCanvas = (
    element: FaviconElement
  ) => {
    setDesigns((current) =>
      (current || []).map((d) =>
        d.id === activeDesignId
          ? {
              ...d,
              elements: [...d.elements, element],
              updatedAt: Date.now(),
            }
          : d
      )
    )
  }

  const handleFilterElements = (
    predicate: (e: FaviconElement) => boolean
  ) => {
    const filtered =
      activeDesign.elements.filter(predicate)
    if (
      filtered.length !== activeDesign.elements.length
    ) {
      setDesigns((current) =>
        (current || []).map((d) =>
          d.id === activeDesignId
            ? {
                ...d,
                elements: filtered,
                updatedAt: Date.now(),
              }
            : d
        )
      )
    }
  }

  const handleUpdateElement = (
    updates: Partial<FaviconElement>
  ) => {
    if (!selectedElementId) return
    setDesigns((current) =>
      (current || []).map((d) =>
        d.id === activeDesignId
          ? {
              ...d,
              elements: d.elements.map((e) =>
                e.id === selectedElementId
                  ? { ...e, ...updates }
                  : e
              ),
              updatedAt: Date.now(),
            }
          : d
      )
    )
  }

  const handleDeleteElement = (elementId: string) => {
    setDesigns((current) =>
      (current || []).map((d) =>
        d.id === activeDesignId
          ? {
              ...d,
              elements: d.elements.filter(
                (e) => e.id !== elementId
              ),
              updatedAt: Date.now(),
            }
          : d
      )
    )
    setSelectedElementId(null)
  }

  const handleUpdateDesign = (
    updates: Partial<FaviconDesign>
  ) => {
    setDesigns((current) =>
      (current || []).map((d) =>
        d.id === activeDesignId
          ? { ...d, ...updates, updatedAt: Date.now() }
          : d
      )
    )
  }

  // ── Design CRUD ─────────────────────────────────────────

  const handleNewDesign = () => {
    const newDesign: FaviconDesign = {
      id: `design-${Date.now()}`,
      name: formatCopy(
        copy.design.newDesignName,
        { count: safeDesigns.length + 1 }
      ),
      size: 128,
      backgroundColor: '#7c3aed',
      elements: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setDesigns((current) => [
      ...(current || []),
      newDesign,
    ])
    setActiveDesignId(newDesign.id)
    setSelectedElementId(null)
  }

  const handleDuplicateDesign = () => {
    const newDesign: FaviconDesign = {
      ...activeDesign,
      id: `design-${Date.now()}`,
      name: `${activeDesign.name}${copy.design.duplicateSuffix}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setDesigns((current) => [
      ...(current || []),
      newDesign,
    ])
    setActiveDesignId(newDesign.id)
    toast.success(copy.toasts.designDuplicated)
  }

  const handleDeleteDesign = () => {
    if (safeDesigns.length === 1) {
      toast.error(copy.toasts.cannotDeleteLast)
      return
    }
    const filtered = safeDesigns.filter(
      (d) => d.id !== activeDesignId
    )
    setDesigns(filtered)
    setActiveDesignId(filtered[0].id)
    setSelectedElementId(null)
    toast.success(copy.toasts.designDeleted)
  }

  // ── Sub-hooks ───────────────────────────────────────────

  const { handleExport, handleExportAll } =
    useFaviconExport(canvasRef, activeDesign)

  const {
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseLeave,
  } = useFaviconCanvas({
    canvasRef,
    drawingCanvasRef,
    activeDesign,
    drawMode,
    brushColor,
    brushSize,
    brushEffect,
    gradientColor,
    glowIntensity,
    activeDesignId,
    onAddElement: handleAddElementFromCanvas,
    onFilterElements: handleFilterElements,
  })

  return {
    activeDesign,
    activeDesignId,
    brushColor,
    brushEffect,
    brushSize,
    canvasRef,
    drawMode,
    drawingCanvasRef,
    glowIntensity,
    gradientColor,
    safeDesigns,
    selectedElement,
    selectedElementId,
    setActiveDesignId,
    setBrushColor,
    setBrushEffect,
    setBrushSize,
    setDrawMode,
    setGlowIntensity,
    setGradientColor,
    setSelectedElementId,
    handleAddElement,
    handleCanvasMouseDown,
    handleCanvasMouseLeave,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleDeleteDesign,
    handleDeleteElement,
    handleDuplicateDesign,
    handleExport,
    handleExportAll,
    handleNewDesign,
    handleUpdateDesign,
    handleUpdateElement,
  }
}
