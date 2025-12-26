interface DomSnapshotOptions {
  scale?: number
}

export async function captureDomSnapshot(options?: DomSnapshotOptions): Promise<string> {
  const root = document.documentElement
  const width = Math.max(root.scrollWidth, root.clientWidth)
  const height = Math.max(root.scrollHeight, root.clientHeight)
  const scale = options?.scale ?? window.devicePixelRatio ?? 1

  const serialized = new XMLSerializer().serializeToString(root)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <foreignObject width="100%" height="100%">
    ${serialized}
  </foreignObject>
</svg>`

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load DOM snapshot image'))
      img.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Failed to acquire canvas context')
    }

    context.scale(scale, scale)
    context.drawImage(image, 0, 0)

    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(url)
  }
}
