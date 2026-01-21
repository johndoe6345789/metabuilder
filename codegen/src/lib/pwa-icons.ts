export function generatePWAIcon(size: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''

  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#7c3aed')
  gradient.addColorStop(1, '#4facfe')
  
  const cornerRadius = size * 0.25
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, cornerRadius)
  ctx.fill()

  ctx.strokeStyle = 'white'
  ctx.lineWidth = size * 0.0625
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const padding = size * 0.27
  const innerSize = size - (padding * 2)
  const centerY = size / 2
  
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, size - padding)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(size - padding, padding)
  ctx.lineTo(size - padding, size - padding)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(padding, centerY)
  ctx.lineTo(size - padding, centerY)
  ctx.stroke()

  const dotRadius = size * 0.03125
  ctx.fillStyle = 'white'
  
  const dots = [
    [padding, padding],
    [size - padding, padding],
    [padding, centerY],
    [size / 2, centerY],
    [size - padding, centerY],
    [padding, size - padding],
    [size - padding, size - padding],
  ]
  
  dots.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
    ctx.fill()
  })

  return canvas.toDataURL('image/png')
}

export async function ensurePWAIcons() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
  
  for (const size of sizes) {
    try {
      const response = await fetch(`/icons/icon-${size}x${size}.png`)
      if (!response.ok) {
        console.log(`Generating fallback icon for ${size}x${size}`)
      }
    } catch (error) {
      console.log(`Icon ${size}x${size} not found, using generated fallback`)
    }
  }
}
