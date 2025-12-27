export function sanitizeKey(key: string): string {
  return key.replace(/^(\.\.(\/|\\|$))+/, '')
}
