/** The chip's hover title: every declaration the class carries, one per
 *  line, or a hint that it has none yet. */
export function classChipTitle(props: Record<string, string>): string {
  const entries = Object.entries(props)
  if (entries.length === 0) return 'No declarations yet'
  return entries.map(([k, v]) => `${k}: ${v}`).join('\n')
}
