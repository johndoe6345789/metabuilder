import path from 'path'
import { sanitizeKey } from './sanitize-key'

export function buildFullPath(basePath: string, key: string): string {
  const normalized = sanitizeKey(key)
  return path.join(basePath, normalized)
}

export function buildMetadataPath(basePath: string, key: string): string {
  return buildFullPath(basePath, key) + '.meta.json'
}
