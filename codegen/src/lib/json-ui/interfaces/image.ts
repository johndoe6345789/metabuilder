export interface ImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  fallback?: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}
