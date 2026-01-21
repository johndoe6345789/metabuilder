const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5001'

export type SyncOperation = 'put' | 'delete'

export async function syncToFlask(
  storeName: string,
  key: string,
  value: any,
  operation: SyncOperation = 'put'
): Promise<void> {
  try {
    const url = `${FLASK_API_URL}/api/storage/${storeName}:${key}`
    
    if (operation === 'delete') {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok && response.status !== 404) {
        throw new Error(`Flask sync failed: ${response.statusText}`)
      }
    } else {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      })
      
      if (!response.ok) {
        throw new Error(`Flask sync failed: ${response.statusText}`)
      }
    }
  } catch (error) {
    console.error('[FlaskSync] Error syncing to Flask:', error)
    throw error
  }
}

export async function fetchFromFlask(
  storeName: string,
  key: string
): Promise<any> {
  try {
    const url = `${FLASK_API_URL}/api/storage/${storeName}:${key}`
    const response = await fetch(url)
    
    if (response.status === 404) {
      return null
    }
    
    if (!response.ok) {
      throw new Error(`Flask fetch failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.value
  } catch (error) {
    console.error('[FlaskSync] Error fetching from Flask:', error)
    return null
  }
}

export async function syncAllToFlask(data: Record<string, any>): Promise<void> {
  try {
    const url = `${FLASK_API_URL}/api/storage/import`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Flask bulk sync failed: ${response.statusText}`)
    }
  } catch (error) {
    console.error('[FlaskSync] Error bulk syncing to Flask:', error)
    throw error
  }
}

export async function fetchAllFromFlask(): Promise<Record<string, any>> {
  try {
    const url = `${FLASK_API_URL}/api/storage/export`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Flask bulk fetch failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('[FlaskSync] Error bulk fetching from Flask:', error)
    throw error
  }
}

export async function getFlaskStats(): Promise<{
  total_keys: number
  total_size_bytes: number
  database_path: string
}> {
  try {
    const url = `${FLASK_API_URL}/api/storage/stats`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Flask stats failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('[FlaskSync] Error fetching Flask stats:', error)
    throw error
  }
}

export async function clearFlaskStorage(): Promise<void> {
  try {
    const url = `${FLASK_API_URL}/api/storage/clear`
    const response = await fetch(url, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error(`Flask clear failed: ${response.statusText}`)
    }
  } catch (error) {
    console.error('[FlaskSync] Error clearing Flask storage:', error)
    throw error
  }
}
