/** Module-level token bridge -- lets non-React code (fetch helpers, storage
 * layers) read the current auth token without importing from whatever
 * store the consuming app uses (avoids circular deps, and means this
 * package doesn't need to know the app's store shape at all). */
let _token: string | null = null

export const setAuthToken = (t: string | null) => {
  _token = t
}
export const getAuthToken = () => _token
