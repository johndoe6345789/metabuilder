import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import copy from '@/data/favicon-designer.json'
import { useKV } from '@/hooks/use-kv'
import { DEFAULT_DESIGN, PRESET_SIZES } from './constants'
import { drawCanvas } from './canvasUtils'
import { formatCopy } from './formatCopy'
import { BrushEffect, FaviconDesign, FaviconElement } from './types'

export const useFaviconDesigner = () => {
  const [designs, setDesigns] = useKV<FaviconDesign[]>('favicon-designs', [DEFAULT_DESIGN])
  const [activeDesignId, setActiveDesignId] = useState<string>(DEFAULT_DESIGN.id)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawMode, setDrawMode] = useState<'select' | 'draw' | 'erase'>('select')
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#ffffff')
  const [brushEffect, setBrushEffect] = useState<BrushEffect>('solid')
  const [gradientColor, setGradientColor] = useState('#ff00ff')
  const [glowIntensity, setGlowIntensity] = useState(10)
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)

  const safeDesigns = designs || [DEFAULT_DESIGN]
  const activeDesign = safeDesigns.find((d) => d.id === activeDesignId) || DEFAULT_DESIGN
  const selectedElement = activeDesign.elements.find((e) => e.id === selectedElementId)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      drawCanvas(canvas, activeDesign)
    }
  }, [activeDesign])

  useEffect(() => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = activeDesign.size
    canvas.height = activeDesign.size
    ctx.clearRect(0, 0, activeDesign.size, activeDesign.size)
  }, [activeDesign, drawMode])

  const handleAddElement = (type: FaviconElement['type']) => {
    const newElement: FaviconElement = {
      id: `element-${Date.now()}`,
      type,
      x: activeDesign.size / 2,
      y: activeDesign.size / 2,
      width: type === 'text' || type === 'emoji' ? 100 : 40,
      height: type === 'text' || type === 'emoji' ? 100 : 40,
      color: '#ffffff',
      rotation: 0,
      ...(type === 'text' && { text: copy.defaults.newText, fontSize: 32, fontWeight: 'bold' }),
      ...(type === 'emoji' && { emoji: copy.defaults.newEmoji, fontSize: 40 }),
    }

    setDesigns((current) =>
      (current || []).map((d) =>
        d.id === activeDesignId
          ? { ...d, elements: [...d.elements, newElement], updatedAt: Date.now() }
          : d
      )
    )
    setSelectedElementId(newElement.id)
  }

  const handleUpdateElement = (updates: Partial<FaviconElement>) => {
    if (!selectedElementId) return

    setDesigns((current) =>
      (current || []).map((d) =>
        d.id === activeDesignId
          ? {
              ...d,
              elements: d.elements.map((e) => (e.id === selectedElementId ? { ...e, ...updates } : e)),
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
          ? { ...d, elements: d.elements.filter((e) => e.id !== elementId), updatedAt: Date.now() }
          : d
      )
    )
    setSelectedElementId(null)
  }

  const handleUpdateDesign = (updates: Partial<FaviconDesign>) => {
    setDesigns((current) =>
      (current || []).map((d) => (d.id === activeDesignId ? { ...d, ...updates, updatedAt: Date.now() } : d))
    )
  }

  const handleNewDesign = () => {
    const newDesign: FaviconDesign = {
      id: `design-${Date.now()}`,
      name: formatCopy(copy.design.newDesignName, { count: safeDesigns.length + 1 }),
      size: 128,
      backgroundColor: '#7c3aed',
      elements: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setDesigns((current) => [...(current || []), newDesign])
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

    setDesigns((current) => [...(current || []), newDesign])
    setActiveDesignId(newDesign.id)
    toast.success(copy.toasts.designDuplicated)
  }

  const handleDeleteDesign = () => {
    if (safeDesigns.length === 1) {
      toast.error(copy.toasts.cannotDeleteLast)
      return
    }

    const filteredDesigns = safeDesigns.filter((d) => d.id !== activeDesignId)
    setDesigns(filteredDesigns)
    setActiveDesignId(filteredDesigns[0].id)
    setSelectedElementId(null)
    toast.success(copy.toasts.designDeleted)
  }

  const generateSVG = (): string => {
    const size = activeDesign.size
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
    svg += `<rect width="${size}" height="${size}" fill="${activeDesign.backgroundColor}"/>`

    activeDesign.elements.forEach((element) => {
      const transform = `translate(${element.x},${element.y}) rotate(${element.rotation})`

      switch (element.type) {
        case 'circle':
          svg += `<circle cx="0" cy="0" r="${element.width / 2}" fill="${element.color}" transform="${transform}"/>`
          break
        case 'square':
          svg += `<rect x="${-element.width / 2}" y="${-element.height / 2}" width="${element.width}" height="${element.height}" fill="${element.color}" transform="${transform}"/>`
          break
        case 'text':
          svg += `<text x="0" y="0" fill="${element.color}" font-size="${element.fontSize}" font-weight="${element.fontWeight}" text-anchor="middle" dominant-baseline="middle" transform="${transform}">${element.text}</text>`
          break
      }
    })

    svg += '</svg>'
    return svg
  }

  const handleExport = (format: 'png' | 'ico' | 'svg', size?: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (format === 'png') {
      const exportSize = size || activeDesign.size
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = exportSize
      tempCanvas.height = exportSize
      const ctx = tempCanvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, exportSize, exportSize)

      tempCanvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${activeDesign.name}-${exportSize}x${exportSize}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success(formatCopy(copy.toasts.exportedPng, { size: exportSize }))
      })
    } else if (format === 'ico') {
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${activeDesign.name}.ico`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success(copy.toasts.exportedIco)
      })
    } else if (format === 'svg') {
      const svg = generateSVG()
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeDesign.name}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(copy.toasts.exportedSvg)
    }
  }

  const handleExportAll = () => {
    PRESET_SIZES.forEach((size) => {
      setTimeout(() => handleExport('png', size), size * 10)
    })
    toast.success(copy.toasts.exportAll)
  }

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = activeDesign.size / rect.width
    const scaleY = activeDesign.size / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawMode === 'select') return

    setIsDrawing(true)
    const coords = getCanvasCoordinates(e)
    setCurrentPath([coords])
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawMode === 'select') return

    const coords = getCanvasCoordinates(e)
    setCurrentPath((prev) => [...prev, coords])

    const canvas = drawingCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (drawMode === 'draw') {
      if (brushEffect === 'glow') {
        ctx.shadowColor = brushColor
        ctx.shadowBlur = glowIntensity
      }

      if (brushEffect === 'gradient' && currentPath.length > 0) {
        const gradient = ctx.createLinearGradient(currentPath[0].x, currentPath[0].y, coords.x, coords.y)
        gradient.addColorStop(0, brushColor)
        gradient.addColorStop(1, gradientColor)
        ctx.strokeStyle = gradient
      } else {
        ctx.strokeStyle = brushColor
      }

      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (currentPath.length > 0) {
        const prevPoint = currentPath[currentPath.length - 1]

        if (brushEffect === 'spray') {
          for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * brushSize * 2
            const offsetY = (Math.random() - 0.5) * brushSize * 2
            ctx.fillStyle = brushColor
            ctx.beginPath()
            ctx.arc(coords.x + offsetX, coords.y + offsetY, brushSize / 3, 0, Math.PI * 2)
            ctx.fill()
          }
        } else {
          ctx.beginPath()
          ctx.moveTo(prevPoint.x, prevPoint.y)
          ctx.lineTo(coords.x, coords.y)
          ctx.stroke()
        }
      }

      ctx.shadowBlur = 0
    } else if (drawMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = brushSize * 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (currentPath.length > 0) {
        const prevPoint = currentPath[currentPath.length - 1]
        ctx.beginPath()
        ctx.moveTo(prevPoint.x, prevPoint.y)
        ctx.lineTo(coords.x, coords.y)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  const handleCanvasMouseUp = () => {
    if (!isDrawing || drawMode === 'select') return

    setIsDrawing(false)

    if (drawMode === 'draw' && currentPath.length > 1) {
      const newElement: FaviconElement = {
        id: `element-${Date.now()}`,
        type: 'freehand',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        color: brushColor,
        rotation: 0,
        paths: currentPath,
        strokeWidth: brushSize,
        brushEffect,
        gradientColor: brushEffect === 'gradient' ? gradientColor : undefined,
        glowIntensity: brushEffect === 'glow' ? glowIntensity : undefined,
      }

      setDesigns((current) =>
        (current || []).map((d) =>
          d.id === activeDesignId
            ? { ...d, elements: [...d.elements, newElement], updatedAt: Date.now() }
            : d
        )
      )
    } else if (drawMode === 'erase') {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const filteredElements = activeDesign.elements.filter((element) => {
        if (element.type !== 'freehand' || !element.paths) return true

        return !element.paths.some((point) =>
          currentPath.some((erasePoint) => {
            const distance = Math.sqrt(Math.pow(point.x - erasePoint.x, 2) + Math.pow(point.y - erasePoint.y, 2))
            return distance < brushSize * 2
          })
        )
      })

      if (filteredElements.length !== activeDesign.elements.length) {
        setDesigns((current) =>
          (current || []).map((d) =>
            d.id === activeDesignId
              ? { ...d, elements: filteredElements, updatedAt: Date.now() }
              : d
          )
        )
      }
    }

    setCurrentPath([])
    const canvas = canvasRef.current
    if (canvas) {
      drawCanvas(canvas, activeDesign)
    }
  }

  const handleCanvasMouseLeave = () => {
    if (isDrawing) {
      handleCanvasMouseUp()
    }
  }

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
