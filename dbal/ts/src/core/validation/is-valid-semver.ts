const semverPattern = /^\\d+\\.\\d+\\.\\d+$/

export function isValidSemver(version: string): boolean {
  return semverPattern.test(version)
}
