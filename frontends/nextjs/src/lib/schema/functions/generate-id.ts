/**
 * Generate a unique ID using timestamp and random string
 * @returns A unique identifier string
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
