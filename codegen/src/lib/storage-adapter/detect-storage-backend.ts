import { FLASK_BACKEND_URL, USE_FLASK_BACKEND } from './config'
import { FlaskBackendAdapter } from './flask-backend-adapter'

export async function detectStorageBackend(): Promise<'flask' | 'indexeddb'> {
  if (USE_FLASK_BACKEND && FLASK_BACKEND_URL) {
    console.log('[StorageAdapter] USE_FLASK_BACKEND is true, attempting Flask backend')
    const flaskAdapter = new FlaskBackendAdapter(FLASK_BACKEND_URL)
    try {
      await flaskAdapter.get('_health_check')
      console.log('[StorageAdapter] Flask backend detected and available')
      return 'flask'
    } catch (error) {
      console.warn('[StorageAdapter] Flask backend configured but not available, falling back to IndexedDB:', error)
    }
  }

  console.log('[StorageAdapter] Using IndexedDB')
  return 'indexeddb'
}
