export const formatLogContext = (context?: string) => {
  if (!context) return null
  try {
    return JSON.stringify(JSON.parse(context), null, 2)
  } catch (error) {
    console.error('Failed to parse log context', error)
    return context
  }
}
