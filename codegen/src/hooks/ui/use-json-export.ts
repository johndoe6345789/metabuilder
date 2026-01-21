import { useCallback } from 'react'
import { toast } from 'sonner'

export function useJsonExport() {
  const exportToJson = useCallback((data: any, filename: string = 'schema.json') => {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      toast.success('Schema exported successfully')
    } catch (error) {
      toast.error('Failed to export schema')
      console.error('Export error:', error)
    }
  }, [])

  const copyToClipboard = useCallback((data: any) => {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      navigator.clipboard.writeText(jsonString)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
      console.error('Copy error:', error)
    }
  }, [])

  const importFromJson = useCallback((file: File, onImport: (data: any) => void) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        onImport(data)
        toast.success('Schema imported successfully')
      } catch (error) {
        toast.error('Invalid JSON file')
        console.error('Import error:', error)
      }
    }
    
    reader.readAsText(file)
  }, [])

  return {
    exportToJson,
    copyToClipboard,
    importFromJson,
  }
}
