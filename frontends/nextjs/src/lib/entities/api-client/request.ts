import { entityApiFetch } from './entity-fetch'
import { extractErrorMessage } from './error-message'

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

interface RequestSpec {
  url: string
  method: string
  body?: Record<string, unknown>
  /** DELETE responses carry no body worth parsing on success. */
  parseBody?: boolean
}

/**
 * The one request/error/logging shape every entity CRUD call shares:
 * fetch, extract an error message on !ok, parse the success body (or
 * not, for a DELETE), and report a caught exception the same way.
 */
export async function request<T>(
  spec: RequestSpec,
  errorContext: string
): Promise<ApiResponse<T>> {
  try {
    const response = await entityApiFetch(spec.url, {
      method: spec.method,
      headers: { 'Content-Type': 'application/json' },
      ...(spec.body !== undefined ? { body: JSON.stringify(spec.body) } : {}),
      cache: 'no-store',
    })

    if (!response.ok) {
      return {
        error: await extractErrorMessage(response),
        status: response.status,
      }
    }

    if (spec.parseBody === false) return { status: response.status }

    const data = (await response.json()) as T
    return { data, status: response.status }
  } catch (error) {
    console.error(`Failed to ${errorContext}:`, error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    }
  }
}
