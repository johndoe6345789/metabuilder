/**
 * Logout API - Clear session and redirect to login
 */

import { BASE_PATH } from '@/lib/app-config'

export async function logout(): Promise<void> {
  try {
    // Call logout API endpoint to clear session on server
    const response = await fetch(`${BASE_PATH}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies
    })

    if (!response.ok) {
      console.error('Logout request failed:', response.statusText)
    }

    // Clear any client-side storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if the API call fails, redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}
