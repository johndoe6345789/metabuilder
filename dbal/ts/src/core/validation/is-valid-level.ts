// Level validation: 0-5 range
export function isValidLevel(level: number): boolean {
  return level >= 0 && level <= 5
}
