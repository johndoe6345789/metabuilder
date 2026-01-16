import { join, resolve } from 'path'

export function getPackagesDir(): string {
  let cwd = process.cwd()
  // If running from Next.js context, go up two levels to project root
  if (cwd.endsWith('frontends/nextjs') || cwd.endsWith('frontends\\nextjs')) {
    cwd = resolve(cwd, '../..')
  }
  return join(cwd, 'packages')
}
