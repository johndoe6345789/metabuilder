/** What a credential must satisfy before it is sent anywhere. */

export const MIN_USERNAME = 3
export const MIN_PASSWORD = 8

export const CREDENTIAL_RULE =
  'Use a username of 3+ characters and a password of 8+ characters.'

/**
 * The complaint about this pair, or null.
 *
 * The route enforces the same minimums; this is so a caller hears about
 * a too-short password before it crosses the wire, not after.
 */
export function refuseCredential(
  username: string,
  password: string
): string | null {
  if (username.trim().length < MIN_USERNAME) return CREDENTIAL_RULE
  if (password.trim().length < MIN_PASSWORD) return CREDENTIAL_RULE
  return null
}
