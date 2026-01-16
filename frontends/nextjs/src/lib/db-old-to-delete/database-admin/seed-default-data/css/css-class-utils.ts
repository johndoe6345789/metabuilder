export const uniqueClasses = (classes: string[]) => Array.from(new Set(classes))

export const buildScaleClasses = (prefixes: string[], scale: string[]) =>
  prefixes.flatMap(prefix => scale.map(value => `${prefix}-${value}`))
