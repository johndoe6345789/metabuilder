import { writeFileSync } from 'fs'

export function writeSummary(outputPath: string, serialized: string): void {
  try {
    writeFileSync(outputPath, serialized)
    console.error(`Implementation analysis written to ${outputPath}`)
  } catch (error) {
    console.error(`Failed to write implementation analysis to ${outputPath}:`, error)
  }
}
