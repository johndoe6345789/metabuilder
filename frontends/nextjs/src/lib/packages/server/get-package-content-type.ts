import path from 'path'

const contentTypeMap: Record<string, string> = {
  '.json': 'application/json',
  '.lua': 'text/plain',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.js': 'text/javascript',
  '.ts': 'text/plain',
  '.tsx': 'text/plain',
  '.css': 'text/css',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.cpp': 'text/plain',
  '.h': 'text/plain',
}

export function getPackageContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return contentTypeMap[ext] || 'application/octet-stream'
}
