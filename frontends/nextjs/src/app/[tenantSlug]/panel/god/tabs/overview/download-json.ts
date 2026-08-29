/** Hands the browser a JSON file to save. */

export function downloadJson(
  name: string,
  data: unknown,
  doc: Document = document
): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = doc.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
