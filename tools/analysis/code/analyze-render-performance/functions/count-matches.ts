export function countMatches(content: string, regex: RegExp): number {
  return content.match(regex)?.length ?? 0
}
