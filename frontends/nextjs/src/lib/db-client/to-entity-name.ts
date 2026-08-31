/** "posts" -> "Post", but "address" stays "address" (never strips the
 *  s from a double-s ending). */
export function toEntityName(camelCase: string): string {
  let name = camelCase
  if (name.endsWith('s') && !name.endsWith('ss')) {
    name = name.slice(0, -1)
  }
  return name.charAt(0).toUpperCase() + name.slice(1)
}
