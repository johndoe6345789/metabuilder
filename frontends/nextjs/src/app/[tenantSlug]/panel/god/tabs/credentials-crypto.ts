/** Password hashing for the credentials tab. */

function toHex(bytes: Uint8Array): string {
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function sha512(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value)
  const buffer = await crypto.subtle.digest('SHA-512', encoded)
  return toHex(new Uint8Array(buffer))
}

export function randomSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}
