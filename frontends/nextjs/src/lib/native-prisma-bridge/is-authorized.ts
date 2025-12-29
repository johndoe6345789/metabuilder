import { AUTH_TOKEN_HEADER, AUTHORIZATION_HEADER } from './constants/auth-headers'
import { getBridgeSecret } from './get-bridge-secret'

export function isAuthorized(request: { headers: { get(name: string): string | null } }): boolean {
  const secret = getBridgeSecret()
  if (!secret) {
    return true
  }

  const token = request.headers.get(AUTH_TOKEN_HEADER)
  if (token === secret) {
    return true
  }

  const authorization = request.headers.get(AUTHORIZATION_HEADER)
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const bearer = authorization.slice(7).trim()
    if (bearer === secret) {
      return true
    }
  }

  return false
}
