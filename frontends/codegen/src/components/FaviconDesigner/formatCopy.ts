export const formatCopy = (template: string, values: Record<string, string | number> = {}) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
