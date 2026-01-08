export const isValidJsonString = (value: string): boolean => {
  if (typeof value !== 'string') return false
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}
