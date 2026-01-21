import { FaviconElement, FaviconDesign, CanvasFilter } from './types'

export function getPathBounds(paths: Array<{ x: number; y: number }>) {
  const xs = paths.map(p => p.x)
  const ys = paths.map(p => p.y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

export function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fill()
}

export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const topCurveHeight = size * 0.3
  ctx.beginPath()
  ctx.moveTo(x, y + topCurveHeight)
  ctx.bezierCurveTo(x, y, x - size / 2, y - topCurveHeight, x - size / 2, y + topCurveHeight)
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.2, x, y + size)
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight)
  ctx.bezierCurveTo(x + size / 2, y - topCurveHeight, x, y, x, y + topCurveHeight)
  ctx.closePath()
  ctx.fill()
}

export function drawPolygon(ctx: CanvasRenderingContext2D, x: number, y: number, sides: number, radius: number) {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
    const px = x + radius * Math.cos(angle)
    const py = y + radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

export function applyCanvasFilter(ctx: CanvasRenderingContext2D, filter: CanvasFilter, intensity: number) {
  const canvas = ctx.canvas

  switch (filter) {
    case 'blur':
      ctx.filter = `blur(${intensity / 10}px)`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      break
    case 'brightness':
      ctx.filter = `brightness(${intensity / 50})`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      break
    case 'contrast':
      ctx.filter = `contrast(${intensity / 50})`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      break
    case 'grayscale':
      ctx.filter = `grayscale(${intensity / 100})`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      break
    case 'sepia':
      ctx.filter = `sepia(${intensity / 100})`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      break
    case 'invert':
      ctx.filter = `invert(${intensity / 100})`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      break
    case 'saturate':
      ctx.filter = `saturate(${intensity / 50})`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      break
    case 'hue-rotate':
      ctx.filter = `hue-rotate(${intensity * 3.6}deg)`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      break
    case 'pixelate': {
      const pixelSize = Math.max(1, Math.floor(intensity / 10))
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = canvas.width / pixelSize
      tempCanvas.height = canvas.height / pixelSize
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        tempCtx.imageSmoothingEnabled = false
        tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)
        ctx.imageSmoothingEnabled = true
      }
      break
    }
  }
}

export function drawElement(ctx: CanvasRenderingContext2D, element: FaviconElement) {
  ctx.save()
  
  if (element.type === 'freehand' && element.paths && element.paths.length > 0) {
    const effect = element.brushEffect || 'solid'
    const strokeWidth = element.strokeWidth || 3
    
    if (effect === 'glow') {
      ctx.shadowColor = element.color
      ctx.shadowBlur = element.glowIntensity || 10
    }

    if (effect === 'gradient' && element.gradientColor) {
      const bounds = getPathBounds(element.paths)
      const gradient = ctx.createLinearGradient(
        bounds.minX,
        bounds.minY,
        bounds.maxX,
        bounds.maxY
      )
      gradient.addColorStop(0, element.color)
      gradient.addColorStop(1, element.gradientColor)
      ctx.strokeStyle = gradient
    } else {
      ctx.strokeStyle = element.color
    }

    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (effect === 'spray') {
      element.paths.forEach((point, i) => {
        if (i % 2 === 0) {
          for (let j = 0; j < 3; j++) {
            const offsetX = (Math.random() - 0.5) * strokeWidth * 2
            const offsetY = (Math.random() - 0.5) * strokeWidth * 2
            ctx.fillStyle = element.color
            ctx.beginPath()
            ctx.arc(point.x + offsetX, point.y + offsetY, strokeWidth / 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })
    } else {
      ctx.beginPath()
      ctx.moveTo(element.paths[0].x, element.paths[0].y)
      for (let i = 1; i < element.paths.length; i++) {
        ctx.lineTo(element.paths[i].x, element.paths[i].y)
      }
      ctx.stroke()
    }

    ctx.shadowBlur = 0
  } else {
    ctx.translate(element.x, element.y)
    ctx.rotate((element.rotation * Math.PI) / 180)
    ctx.fillStyle = element.color

    switch (element.type) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(0, 0, element.width / 2, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'square':
        ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height)
        break
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(0, -element.height / 2)
        ctx.lineTo(element.width / 2, element.height / 2)
        ctx.lineTo(-element.width / 2, element.height / 2)
        ctx.closePath()
        ctx.fill()
        break
      case 'star':
        drawStar(ctx, 0, 0, 5, element.width / 2, element.width / 4)
        break
      case 'heart':
        drawHeart(ctx, 0, 0, element.width)
        break
      case 'polygon':
        drawPolygon(ctx, 0, 0, 6, element.width / 2)
        break
      case 'text':
        ctx.fillStyle = element.color
        ctx.font = `${element.fontWeight || 'bold'} ${element.fontSize || 32}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(element.text || '', 0, 0)
        break
      case 'emoji':
        ctx.font = `${element.fontSize || 32}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(element.emoji || '😀', 0, 0)
        break
    }
  }

  ctx.restore()
}

export function drawCanvas(canvas: HTMLCanvasElement, design: FaviconDesign) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = design.size
  canvas.width = size
  canvas.height = size

  ctx.fillStyle = design.backgroundColor
  ctx.fillRect(0, 0, size, size)

  design.elements.forEach((element) => {
    drawElement(ctx, element)
  })

  if (design.filter && design.filter !== 'none') {
    applyCanvasFilter(ctx, design.filter, design.filterIntensity || 50)
  }
}
