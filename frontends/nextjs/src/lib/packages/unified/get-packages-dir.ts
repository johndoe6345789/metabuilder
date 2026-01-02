import { join } from 'path'

export function getPackagesDir(): string {
  return join(process.cwd(), 'packages')
}
