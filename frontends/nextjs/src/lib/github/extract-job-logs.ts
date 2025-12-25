import JSZip from 'jszip'

export async function extractJobLogs(archive: ArrayBuffer) {
  const zip = await JSZip.loadAsync(archive)
  const files = Object.keys(zip.files)
  const sections: string[] = []

  for (const fileName of files) {
    const entry = zip.files[fileName]
    if (entry.dir) {
      continue
    }
    const content = await entry.async('string')
    sections.push(`----- ${fileName} -----`)
    sections.push(content)
  }

  if (sections.length === 0) {
    return '[No log output found in archive]'
  }

  return sections.join('\n')
}
