/**
 * API client utilities for entity CRUD operations
 * 
 * Provides functions to interact with entity APIs.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import 'server-only'

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

export interface ListQueryParams {
  page?: number
  limit?: number
  filter?: Record<string, unknown>
  sort?: string
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: ListQueryParams): string {
  const searchParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString())
  }
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString())
  }
  if (params.filter !== undefined) {
    searchParams.append('filter', JSON.stringify(params.filter))
  }
  if (params.sort !== undefined) {
    searchParams.append('sort', params.sort)
  }
  
  const queryString = searchParams.toString()
  return (queryString.length > 0) ? `?${queryString}` : ''
}

/**
 * Fetch entity list from API
 * 
 * @param tenant - Tenant identifier
 * @param pkg - Package identifier
 * @param entity - Entity name
 * @param params - Query parameters for filtering, sorting, pagination
 * @returns API response with entity list
 */
export async function fetchEntityList(
  tenant: string,
  pkg: string,
  entity: string,
  params: ListQueryParams = {}
): Promise<ApiResponse<unknown[]>> {
  try {
    const queryString = buildQueryString(params)
    const url = `/api/v1/${tenant}/${pkg}/${entity}${queryString}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      let errorData: { error?: string } = { error: 'Unknown error' }
      try {
        errorData = await response.json() as { error?: string }
      } catch {
        // If JSON parsing fails, use default error
      }
      return {
         
        error: errorData.error ?? `HTTP ${response.status}`,
        status: response.status,
      }
    }
    
    const data = await response.json()
    return {
      data: Array.isArray(data) ? data : (data.data ?? []),
      status: response.status,
    }
  } catch (error) {
    console.error(`Failed to fetch entity list for ${tenant}/${pkg}/${entity}:`, error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    }
  }
}

/**
 * Fetch single entity by ID from API
 * 
 * @param tenant - Tenant identifier
 * @param pkg - Package identifier
 * @param entity - Entity name
 * @param id - Entity ID
 * @returns API response with entity data
 */
export async function fetchEntity(
  tenant: string,
  pkg: string,
  entity: string,
  id: string
): Promise<ApiResponse> {
  try {
    const url = `/api/v1/${tenant}/${pkg}/${entity}/${id}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      let errorData: { error?: string } = { error: 'Unknown error' }
      try {
        errorData = await response.json() as { error?: string }
      } catch {
        // If JSON parsing fails, use default error
      }
      return {
         
        error: errorData.error ?? `HTTP ${response.status}`,
        status: response.status,
      }
    }
    
    const data = await response.json()
    return {
       
      data,
      status: response.status,
    }
  } catch (error) {
    console.error(`Failed to fetch entity ${tenant}/${pkg}/${entity}/${id}:`, error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    }
  }
}

/**
 * Create new entity via API
 * 
 * @param tenant - Tenant identifier
 * @param pkg - Package identifier
 * @param entity - Entity name
 * @param data - Entity data to create
 * @returns API response with created entity
 */
export async function createEntity(
  tenant: string,
  pkg: string,
  entity: string,
  data: Record<string, unknown>
): Promise<ApiResponse> {
  try {
    const url = `/api/v1/${tenant}/${pkg}/${entity}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    })
    
    if (!response.ok) {
      let errorData: { error?: string } = { error: 'Unknown error' }
      try {
        errorData = await response.json() as { error?: string }
      } catch {
        // If JSON parsing fails, use default error
      }
      return {
         
        error: errorData.error ?? `HTTP ${response.status}`,
        status: response.status,
      }
    }
    
    const responseData = await response.json()
    return {
       
      data: responseData,
      status: response.status,
    }
  } catch (error) {
    console.error(`Failed to create entity ${tenant}/${pkg}/${entity}:`, error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    }
  }
}

/**
 * Update entity via API
 * 
 * @param tenant - Tenant identifier
 * @param pkg - Package identifier
 * @param entity - Entity name
 * @param id - Entity ID
 * @param data - Entity data to update
 * @returns API response with updated entity
 */
export async function updateEntity(
  tenant: string,
  pkg: string,
  entity: string,
  id: string,
  data: Record<string, unknown>
): Promise<ApiResponse> {
  try {
    const url = `/api/v1/${tenant}/${pkg}/${entity}/${id}`
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    })
    
    if (!response.ok) {
      let errorData: { error?: string } = { error: 'Unknown error' }
      try {
        errorData = await response.json() as { error?: string }
      } catch {
        // If JSON parsing fails, use default error
      }
      return {
         
        error: errorData.error ?? `HTTP ${response.status}`,
        status: response.status,
      }
    }
    
    const responseData = await response.json()
    return {
       
      data: responseData,
      status: response.status,
    }
  } catch (error) {
    console.error(`Failed to update entity ${tenant}/${pkg}/${entity}/${id}:`, error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    }
  }
}

/**
 * Delete entity via API
 * 
 * @param tenant - Tenant identifier
 * @param pkg - Package identifier
 * @param entity - Entity name
 * @param id - Entity ID
 * @returns API response
 */
export async function deleteEntity(
  tenant: string,
  pkg: string,
  entity: string,
  id: string
): Promise<ApiResponse> {
  try {
    const url = `/api/v1/${tenant}/${pkg}/${entity}/${id}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      let errorData: { error?: string } = { error: 'Unknown error' }
      try {
        errorData = await response.json() as { error?: string }
      } catch {
        // If JSON parsing fails, use default error
      }
      return {
         
        error: errorData.error ?? `HTTP ${response.status}`,
        status: response.status,
      }
    }
    
    return {
      status: response.status,
    }
  } catch (error) {
    console.error(`Failed to delete entity ${tenant}/${pkg}/${entity}/${id}:`, error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    }
  }
}
