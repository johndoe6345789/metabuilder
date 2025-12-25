export function resolveDataSource(dataSource: string, context: Record<string, any>): any[] {
  if (!dataSource) return []
  return context[dataSource] || []
}
