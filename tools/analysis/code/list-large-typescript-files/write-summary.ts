import fs from 'fs/promises'
import path from 'path'

import type { Summary } from './types'

export const writeSummary = async (summary: Summary, destination?: string) => {
  if (!destination) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.writeFile(destination, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  console.log(`Report written to ${destination}`)
}
