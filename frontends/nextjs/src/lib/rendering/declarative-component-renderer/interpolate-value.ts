export function interpolateValue(template: string, context: Record<string, any>): string {
  if (!template || typeof template !== 'string') return template

  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = context[key]
    return value !== undefined ? String(value) : match
  })
}
