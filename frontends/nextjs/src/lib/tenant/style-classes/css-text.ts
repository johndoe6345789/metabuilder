/**
 * A CSS property name from whatever is stored. Older classes were saved with
 * React casing ("borderRadius"), which is not valid CSS and would be emitted
 * verbatim into the published stylesheet, so normalise on the way out.
 */
export function toCssProp(name: string): string {
  return name.startsWith('--')
    ? name
    : name.replace(/[A-Z]/g, ch => `-${ch.toLowerCase()}`)
}

/**
 * Declarations as CSS text. Values are stripped of the characters that could
 * end the rule early, so a stray "}" in a value cannot leak styles out of the
 * preview into the panel around it.
 */
export function toCssText(props: Record<string, string>): string {
  return Object.entries(props)
    .map(([k, v]) => `  ${toCssProp(k)}: ${v.replace(/[{}<>;]/g, '')};`)
    .join('\n')
}
