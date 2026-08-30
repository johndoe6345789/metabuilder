/** Formatting an asset's size and telling images apart from other files. */

const IMAGE = /\.(png|jpe?g|gif|webp|svg|ico)$/i

export function isImageAsset(key: string): boolean {
  return IMAGE.test(key)
}

const KB = 1024
const MB = KB * 1024

/** A human-readable size, in whichever unit reads best at that scale. */
export function formatAssetSize(bytes: number): string {
  if (bytes < KB) return `${bytes} B`
  if (bytes < MB) return `${Math.round(bytes / KB)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}
