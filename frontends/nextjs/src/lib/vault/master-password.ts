let cachedMasterPassword: string | null | undefined

export function getVaultMasterPassword(): string | null {
  if (cachedMasterPassword !== undefined) return cachedMasterPassword

  const configuredPassword = process.env.VAULT_MASTER_PASSWORD?.trim()
  cachedMasterPassword = configuredPassword || null
  return cachedMasterPassword
}
