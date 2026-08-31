/**
 * The `{error}` body of a failed response.
 *
 * Two distinct fallbacks, matching the pre-split behavior: a body that
 * parsed but had no `.error` field reports "HTTP {status}"; a body that
 * failed to parse as JSON at all reports "Unknown error".
 */
export async function extractErrorMessage(response: Response): Promise<string> {
  let errorData: { error?: string } = { error: 'Unknown error' }
  try {
    errorData = (await response.json()) as { error?: string }
  } catch {
    // If JSON parsing fails, use the default above.
  }
  return errorData.error ?? `HTTP ${response.status}`
}
