export function countExports(content: string): number {
  const exportMatches = content.match(/^\s*(export\s+(default\s+)?(function|const|class|interface|type|enum))/gm)
  return exportMatches ? exportMatches.length : 0
}
