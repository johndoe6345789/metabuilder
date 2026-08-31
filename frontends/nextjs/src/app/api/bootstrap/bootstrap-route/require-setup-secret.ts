/** Otherwise an unconfigured deployment would expose a seed endpoint
 *  to anyone who asks. */
export function hasValidSetupSecret(authHeader: string | null): boolean {
  const setupSecret = process.env.SETUP_SECRET
  if (setupSecret === undefined || setupSecret.length === 0) return false
  return authHeader === `Bearer ${setupSecret}`
}
