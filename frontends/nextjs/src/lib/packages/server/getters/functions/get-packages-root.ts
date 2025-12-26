import path from 'path'

export function getPackagesRoot(): string {
  return path.resolve(process.cwd(), '..', 'packages')
}
