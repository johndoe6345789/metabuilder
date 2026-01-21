'use client'

import { useMemo, useCallback } from 'react'
import type { Assembly, Materials, Geometry, Part } from '@/lib/types'
import { positionPartsWithCollision, type PositionedPart } from '@/lib/collision'

interface DiagramRendererProps {
  assembly: Assembly
  materials: Materials
  explosion: number
  rotation: number
  highlightedPart: string | null
  onPartHover: (partId: string | null, event?: MouseEvent) => void
}

export default function DiagramRenderer({
  assembly,
  materials,
  explosion,
  rotation,
  highlightedPart,
  onPartHover
}: DiagramRendererProps) {
  const gradientIds = useMemo(() => {
    const ids: Record<string, string> = {}
    Object.keys(materials).forEach(id => {
      ids[id] = `grad-${id}`
    })
    return ids
  }, [materials])

  const getFill = useCallback((geo: Geometry, partMaterial: string) => {
    if (geo.fill) return geo.fill
    const mat = geo.material || partMaterial
    return mat ? `url(#grad-${mat})` : '#888'
  }, [])

  const renderGeometry = useCallback((geo: Geometry, cx: number, cy: number, partMaterial: string): string => {
    const ox = geo.offsetX || 0
    const oy = geo.offsetY || 0
    const x = cx + ox
    const y = cy + oy
    const fill = getFill(geo, partMaterial)
    const opacity = geo.opacity !== undefined ? `opacity="${geo.opacity}"` : ''

    switch (geo.type) {
      case 'circle':
        return `<circle cx="${x}" cy="${y}" r="${geo.r}" fill="${fill}" ${opacity}/>`

      case 'ellipse':
        return `<ellipse cx="${x}" cy="${y}" rx="${geo.rx}" ry="${geo.ry}" fill="${fill}" ${opacity}/>`

      case 'rect': {
        const rx = geo.rx || 0
        const w = geo.width || 0
        const h = geo.height || 0
        return `<rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${opacity}/>`
      }

      case 'line':
        return `<line x1="${x + (geo.x1 || 0)}" y1="${y + (geo.y1 || 0)}" x2="${x + (geo.x2 || 0)}" y2="${y + (geo.y2 || 0)}" stroke="${geo.stroke}" stroke-width="${geo.strokeWidth}"/>`

      case 'polygon': {
        const pts: string[] = []
        const points = geo.points || []
        for (let i = 0; i < points.length; i += 2) {
          pts.push(`${x + points[i]},${y + points[i+1]}`)
        }
        const strokeAttr = geo.stroke ? `stroke="${geo.stroke}" stroke-width="${geo.strokeWidth || 1}"` : ''
        const fillAttr = geo.fill === 'none' ? 'fill="none"' : `fill="${fill}"`
        return `<polygon points="${pts.join(' ')}" ${fillAttr} ${strokeAttr}/>`
      }

      case 'cylinder': {
        const { rx = 0, ry = 0, height = 0 } = geo
        const topY = y - height/2
        const botY = y + height/2
        return `
          <ellipse cx="${x}" cy="${topY}" rx="${rx}" ry="${ry}" fill="${fill}"/>
          <rect x="${x - rx}" y="${topY}" width="${rx * 2}" height="${height}" fill="${fill}"/>
          <ellipse cx="${x}" cy="${botY}" rx="${rx}" ry="${ry}" fill="${fill}"/>
        `
      }

      case 'cone': {
        const { topRx = 0, topRy = 0, bottomRx = 0, bottomRy = 0, height = 0 } = geo
        const topY = y - height/2
        const botY = y + height/2
        return `
          <ellipse cx="${x}" cy="${topY}" rx="${topRx}" ry="${topRy}" fill="${fill}"/>
          <path d="M${x - topRx},${topY} L${x - bottomRx},${botY} L${x + bottomRx},${botY} L${x + topRx},${topY} Z" fill="${fill}"/>
          <ellipse cx="${x}" cy="${botY}" rx="${bottomRx}" ry="${bottomRy}" fill="${fill}"/>
        `
      }

      case 'coilSpring': {
        const { coils = 0, rx = 0, ry = 0, pitch = 0, strokeWidth = 1 } = geo
        let svg = ''
        for (let i = 0; i < coils; i++) {
          const cy2 = y + i * pitch
          svg += `<ellipse cx="${x}" cy="${cy2}" rx="${rx}" ry="${ry}" fill="none" stroke="${fill}" stroke-width="${strokeWidth}"/>`
        }
        return svg
      }

      case 'gearRing': {
        const { teeth = 0, outerRadius = 0, toothHeight = 0 } = geo
        let svg = ''
        for (let i = 0; i < teeth; i++) {
          const angle = (i / teeth) * Math.PI * 2
          const tx = x + Math.cos(angle) * outerRadius
          const ty = y + Math.sin(angle) * (outerRadius * 0.35)
          const rot = (i / teeth) * 360
          svg += `<rect x="${tx - 3}" y="${ty - toothHeight/2}" width="6" height="${toothHeight}" fill="${fill}" transform="rotate(${rot}, ${tx}, ${ty})"/>`
        }
        return svg
      }

      case 'radialRects': {
        const { count = 0, radius = 0, width: w = 0, height: h = 0, offsetY: oy2 = 0 } = geo
        const rectFill = geo.material ? `url(#grad-${geo.material})` : (geo.fill || fill)
        let svg = ''
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2
          const rx2 = x + Math.cos(angle) * radius
          svg += `<rect x="${rx2 - w/2}" y="${y + oy2}" width="${w}" height="${h}" fill="${rectFill}" rx="1"/>`
        }
        return svg
      }

      case 'radialBlades': {
        const { count = 0, radius = 0, width: w = 0, height: h = 0, curve = 0, offsetY: oy2 = 0 } = geo
        let svg = ''
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2
          const bx = x + Math.cos(angle) * radius
          const rot = (i / count) * 360 + curve
          svg += `<rect x="${bx - w/2}" y="${y + oy2}" width="${w}" height="${h}" fill="${fill}" rx="2" transform="rotate(${rot}, ${bx}, ${y + oy2 + h/2})"/>`
        }
        return svg
      }

      case 'text':
        return `<text x="${x}" y="${y}" text-anchor="middle" fill="${geo.fill || '#333'}" font-size="${geo.fontSize || 10}" font-family="${geo.fontFamily || 'monospace'}">${geo.content}</text>`

      default:
        console.warn(`Unknown geometry type: ${geo.type}`)
        return ''
    }
  }, [getFill])

  // Calculate SVG content and dynamic canvas height based on collision-resolved positions
  const { svgContent, canvasHeight } = useMemo(() => {
    const centerX = 350
    const baseOffset = 90
    const maxExplosion = 70
    const explosionFactor = explosion / 100
    const minHeight = 750 // Minimum canvas height
    const footerPadding = 50 // Space for footer text

    // Position parts with collision detection FIRST to know the final bounds
    const positionedParts = positionPartsWithCollision(
      assembly.parts,
      centerX,
      baseOffset,
      explosionFactor,
      maxExplosion
    )

    // Calculate the maximum Y extent from all positioned parts
    let maxY = minHeight - footerPadding
    for (const { bbox } of positionedParts) {
      if (bbox.maxY > maxY) {
        maxY = bbox.maxY
      }
    }

    // Dynamic canvas height: accommodate all parts plus footer
    const calculatedHeight = Math.max(minHeight, maxY + footerPadding)

    // Create defs (gradients and filters)
    let defs = '<defs>'
    Object.entries(materials).forEach(([id, mat]) => {
      const g = mat.gradient
      const angle = g.angle || 0
      const rad = angle * Math.PI / 180
      const x2 = Math.round(50 + Math.cos(rad) * 50)
      const y2 = Math.round(50 + Math.sin(rad) * 50)

      defs += `<linearGradient id="grad-${id}" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">`
      g.stops.forEach(s => {
        defs += `<stop offset="${s.offset}%" stop-color="${s.color}"/>`
      })
      defs += '</linearGradient>'
    })

    defs += `
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" flood-opacity="0.2"/>
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feFlood flood-color="#00d4ff" flood-opacity="0.6"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `
    defs += '</defs>'

    // Background - uses dynamic height
    let svg = defs
    svg += `<rect width="900" height="${calculatedHeight}" fill="#fafafa"/>`

    // Title
    svg += `
      <text x="350" y="35" text-anchor="middle" font-family="Arial Black" font-size="18" fill="#1a1a1a">
        ${assembly.name.toUpperCase()}
      </text>
      <text x="350" y="52" text-anchor="middle" font-family="Arial" font-size="10" fill="#888">
        ${assembly.description || ''}
      </text>
      <line x1="150" y1="65" x2="550" y2="65" stroke="#e0e0e0" stroke-width="1.5"/>
    `

    // Axis line - extends to dynamic height
    svg += `<line x1="${centerX}" y1="80" x2="${centerX}" y2="${calculatedHeight - 30}" stroke="#ddd" stroke-width="1" stroke-dasharray="6,3"/>`

    // Render parts at their collision-resolved positions
    positionedParts.forEach(({ part, y: baseY, bbox }, index) => {
      const isHighlighted = highlightedPart === part.id
      const filter = isHighlighted ? 'url(#glow)' : 'url(#dropShadow)'
      const transform = rotation !== 0 ? `transform="rotate(${rotation}, ${centerX}, ${baseY})"` : ''

      svg += `<g class="part" data-part="${part.id}" filter="${filter}" ${transform} style="cursor:pointer">`

      part.geometry.forEach(geo => {
        svg += renderGeometry(geo, centerX, baseY, part.material)
      })

      svg += '</g>'

      // Leader line and label - positioned to avoid bounding box
      const side = index % 2 === 0 ? 1 : -1
      const labelX = centerX + side * 180 // Pushed further out to avoid parts
      const lineStartX = side === 1 ? bbox.maxX + 5 : bbox.minX - 5

      svg += `
        <line x1="${lineStartX}" y1="${baseY}" x2="${labelX - side * 8}" y2="${baseY}" stroke="#888" stroke-width="0.6"/>
        <circle cx="${labelX - side * 8}" cy="${baseY}" r="2.5" fill="#888"/>
        <text x="${labelX}" y="${baseY - 3}" text-anchor="${side === 1 ? 'start' : 'end'}" font-family="Arial" font-size="10" font-weight="bold" fill="#333">${part.name}</text>
        <text x="${labelX}" y="${baseY + 9}" text-anchor="${side === 1 ? 'start' : 'end'}" font-family="monospace" font-size="8" fill="#777">${part.partNumber}</text>
      `
    })

    // Footer - positioned at bottom of dynamic canvas
    const totalWeight = assembly.parts.reduce((sum, p) => sum + (p.weight * p.quantity), 0)
    svg += `
      <text x="20" y="${calculatedHeight - 15}" font-family="Arial" font-size="8" fill="#aaa">
        ${assembly.parts.length} unique parts • ${totalWeight.toFixed(1)}g total weight
      </text>
    `

    return { svgContent: svg, canvasHeight: calculatedHeight }
  }, [assembly, materials, explosion, rotation, highlightedPart, renderGeometry])

  const handleMouseOver = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = (e.target as Element).closest('.part') as Element | null
    if (target) {
      const partId = target.getAttribute('data-part')
      if (partId) {
        onPartHover(partId, e.nativeEvent)
      }
    }
  }, [onPartHover])

  const handleMouseOut = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = (e.target as Element).closest('.part')
    if (target) {
      onPartHover(null)
    }
  }, [onPartHover])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = (e.target as Element).closest('.part') as Element | null
    if (target) {
      const partId = target.getAttribute('data-part')
      if (partId) {
        onPartHover(partId, e.nativeEvent)
      }
    }
  }, [onPartHover])

  return (
    <svg
      viewBox={`0 0 900 ${canvasHeight}`}
      style={{ width: '100%', height: 'auto' }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onMouseMove={handleMouseMove}
    />
  )
}
