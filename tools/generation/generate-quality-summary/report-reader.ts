import { existsSync, readFileSync } from 'fs'

export const readJsonFile = <T = unknown>(fullPath: string): T | undefined => {
  if (!existsSync(fullPath)) return undefined

  try {
    return JSON.parse(readFileSync(fullPath, 'utf8')) as T
  } catch (error) {
    console.warn(`Failed to parse JSON report at ${fullPath}:`, error)
    return undefined
  }
}
