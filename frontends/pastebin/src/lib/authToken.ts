// Module-level token bridge — lets the storage layer read the current auth
// token without importing from the Redux store (avoids circular deps).
let _token: string | null = null

export const setAuthToken = (t: string | null) => { _token = t }
export const getAuthToken  = () => _token
