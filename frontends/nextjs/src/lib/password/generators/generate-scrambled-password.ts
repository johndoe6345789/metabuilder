/**
 * Generate a cryptographically secure random password
 */
export function generateScrambledPassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }

  return password
}
