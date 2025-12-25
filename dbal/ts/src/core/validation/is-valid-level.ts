// Level validation: 0-5 range
// TODO: add tests for isValidLevel (min/max bounds).
export function isValidLevel(level: number): boolean {
  return level >= 0 && level <= 5
}
