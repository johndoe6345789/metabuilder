let cachedMasterPassword: string | null | undefined

export function getVaultMasterPassword(): string | null {
  if (cachedMasterPassword !== undefined) return cachedMasterPassword

  const configuredPassword = process.env.VAULT_MASTER_PASSWORD?.trim()
  // An unset var and an empty/whitespace-only one both mean "no password
  // configured" -- spelled out explicitly rather than `|| null`, which
  // reads the same but leaves that intent implicit in falsy coercion.
  cachedMasterPassword =
    configuredPassword !== undefined && configuredPassword.length > 0
      ? configuredPassword
      : null
  return cachedMasterPassword
}
