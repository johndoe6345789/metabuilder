export function toTemplateStrings(parts: string[]): TemplateStringsArray {
  const strings = [...parts]
  const template = strings as unknown as TemplateStringsArray
  Object.defineProperty(template, 'raw', {
    value: [...strings],
    enumerable: false,
  })
  return template
}
