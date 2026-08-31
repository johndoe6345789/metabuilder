export interface SeedResults {
  packages: number
  pages: number
  skipped: number
  errors: number
}

export function emptySeedResults(): SeedResults {
  return { packages: 0, pages: 0, skipped: 0, errors: 0 }
}
