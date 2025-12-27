import { FileCategory } from './types'

export function categorizeFile(filePath: string): FileCategory {
  if (filePath.includes('.test.')) return 'test'
  if (filePath.endsWith('.tsx')) return 'component'
  if (filePath.includes('/tools/')) return 'tool'
  if (filePath.includes('/dbal/')) return 'dbal'
  if (filePath.includes('/types/') || filePath.endsWith('.d.ts')) return 'type'
  if (filePath.includes('/lib/') && filePath.endsWith('.ts')) return 'library'
  return 'other'
}
