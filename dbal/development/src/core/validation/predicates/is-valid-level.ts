// Level validation: 1-5 range
export function isValidLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 1 && level <= 5
}
