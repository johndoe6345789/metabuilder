export function resolveDataSource(dataSource: string, context: Record<string, unknown>): unknown[] {
  if (!dataSource) return []
  return (context[dataSource] as unknown[]) || []
}
