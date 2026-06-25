/**
 * useFaviconExport
 *
 * Extracted from useFaviconDesigner — handles PNG,
 * ICO, and SVG export plus the "export all" helper.
 */

import { useCallback } from 'react'
import { toast } from '@/components/ui/sonner'
import copy from '@/data/favicon-designer.json'
import { PRESET_SIZES } from '../constants'
import { formatCopy } from '../formatCopy'
import type { FaviconDesign } from '../types'

function generateSVG(design: FaviconDesign): string {
  const { size } = design
  let svg =
    `<svg xmlns="http://www.w3.org/2000/svg"` +
    ` width="${size}" height="${size}"` +
    ` viewBox="0 0 ${size} ${size}">`
  svg +=
    `<rect width="${size}" height="${size}"` +
    ` fill="${design.backgroundColor}"/>`

  design.elements.forEach((element) => {
    const transform =
      `translate(${element.x},${element.y})` +
      ` rotate(${element.rotation})`

    switch (element.type) {
      case 'circle':
        svg +=
          `<circle cx="0" cy="0"` +
          ` r="${element.width / 2}"` +
          ` fill="${element.color}"` +
          ` transform="${transform}"/>`
        break
      case 'square':
        svg +=
          `<rect x="${-element.width / 2}"` +
          ` y="${-element.height / 2}"` +
          ` width="${element.width}"` +
          ` height="${element.height}"` +
          ` fill="${element.color}"` +
          ` transform="${transform}"/>`
        break
      case 'text':
        svg +=
          `<text x="0" y="0"` +
          ` fill="${element.color}"` +
          ` font-size="${element.fontSize}"` +
          ` font-weight="${element.fontWeight}"` +
          ` text-anchor="middle"` +
          ` dominant-baseline="middle"` +
          ` transform="${transform}">` +
          `${element.text}</text>`
        break
    }
  })

  svg += '</svg>'
  return svg
}

function downloadBlob(
  blob: Blob,
  filename: string
): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function useFaviconExport(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  activeDesign: FaviconDesign
) {
  const handleExport = useCallback(
    (
      format: 'png' | 'ico' | 'svg',
      size?: number
    ) => {
      const canvas = canvasRef.current
      if (!canvas) return

      if (format === 'png') {
        const exportSize = size || activeDesign.size
        const tmp = document.createElement('canvas')
        tmp.width = exportSize
        tmp.height = exportSize
        const ctx = tmp.getContext('2d')
        if (!ctx) return

        ctx.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          exportSize,
          exportSize
        )

        tmp.toBlob((blob) => {
          if (!blob) return
          downloadBlob(
            blob,
            `${activeDesign.name}-${exportSize}x${exportSize}.png`
          )
          toast.success(
            formatCopy(copy.toasts.exportedPng, {
              size: exportSize,
            })
          )
        })
      } else if (format === 'ico') {
        canvas.toBlob((blob) => {
          if (!blob) return
          downloadBlob(
            blob,
            `${activeDesign.name}.ico`
          )
          toast.success(copy.toasts.exportedIco)
        })
      } else if (format === 'svg') {
        const svg = generateSVG(activeDesign)
        const blob = new Blob([svg], {
          type: 'image/svg+xml',
        })
        downloadBlob(blob, `${activeDesign.name}.svg`)
        toast.success(copy.toasts.exportedSvg)
      }
    },
    [canvasRef, activeDesign]
  )

  const handleExportAll = useCallback(() => {
    PRESET_SIZES.forEach((size) => {
      setTimeout(() => handleExport('png', size), size * 10)
    })
    toast.success(copy.toasts.exportAll)
  }, [handleExport])

  return { handleExport, handleExportAll }
}
