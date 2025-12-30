import fs from 'fs'
import path from 'path'
import { ReportData } from '../types'

export function writeReportFile(report: ReportData, rootDir: string, fileName: string): void {
  const destination = path.join(rootDir, fileName)
  fs.writeFileSync(destination, JSON.stringify(report, null, 2))
}
