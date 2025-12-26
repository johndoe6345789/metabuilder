export function appendExportPath(basePath: string, segment: string): string {
  const trimmedBase = basePath.replace(/\/+$/, '')
  const trimmedSegment = segment.replace(/^\/+/, '')
  if (!trimmedBase) return trimmedSegment
  if (!trimmedSegment) return trimmedBase
  return `${trimmedBase}/${trimmedSegment}`
}
