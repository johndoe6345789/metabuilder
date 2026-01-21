import { useCallback } from 'react'
import { toast } from 'sonner'
import { getAllSnippets } from '@/lib/db'
import { 
  saveStorageConfig, 
  FlaskStorageAdapter
} from '@/lib/storage'

export function useStorageMigration() {
  const handleMigrateToFlask = useCallback(async (flaskUrl: string, onSuccess?: () => Promise<void>) => {
    if (!flaskUrl) {
      toast.error('Please enter a Flask backend URL')
      return
    }

    try {
      const adapter = new FlaskStorageAdapter(flaskUrl)
      const connected = await adapter.testConnection()
      
      if (!connected) {
        toast.error('Cannot connect to Flask backend')
        return
      }

      const snippets = await getAllSnippets()
      
      if (snippets.length === 0) {
        toast.info('No snippets to migrate')
        return
      }

      await adapter.migrateFromIndexedDB(snippets)
      
      saveStorageConfig({
        backend: 'flask',
        flaskUrl
      })
      
      toast.success(`Successfully migrated ${snippets.length} snippets to Flask backend`)
      
      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      console.error('Migration failed:', error)
      toast.error('Failed to migrate data to Flask backend')
    }
  }, [])

  const handleMigrateToIndexedDB = useCallback(async (flaskUrl: string) => {
    if (!flaskUrl) {
      toast.error('Please enter a Flask backend URL')
      return
    }

    try {
      const adapter = new FlaskStorageAdapter(flaskUrl)
      const snippets = await adapter.migrateToIndexedDB()
      
      if (snippets.length === 0) {
        toast.info('No snippets to migrate')
        return
      }

      saveStorageConfig({
        backend: 'indexeddb'
      })
      
      // Full page reload is necessary here to reinitialize the database layer
      // with the new backend after migration from Flask to IndexedDB
      window.location.reload()
      
      toast.success(`Successfully migrated ${snippets.length} snippets to IndexedDB`)
    } catch (error) {
      console.error('Migration failed:', error)
      toast.error('Failed to migrate data from Flask backend')
    }
  }, [])

  return {
    handleMigrateToFlask,
    handleMigrateToIndexedDB,
  }
}
