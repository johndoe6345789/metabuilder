import fs from 'fs'

const SECRET_PATH = '/Users/rmac/Documents/GitHub/secrets/vault.env'

let cachedMasterPassword: string | null | undefined

function parseEnvFile(content: string): string | null {
  const match = content.match(/^VAULT_MASTER_PASSWORD=(.+)$/m)
  return match?.[1]?.trim() ?? null
}

export function getVaultMasterPassword(): string | null {
  if (cachedMasterPassword !== undefined) return cachedMasterPassword

  const direct = process.env.VAULT_MASTER_PASSWORD
  if (typeof direct === 'string' && direct.length > 0) {
    cachedMasterPassword = direct
    return direct
  }

  try {
    const content = fs.readFileSync(SECRET_PATH, 'utf-8')
    const parsed = parseEnvFile(content)
    cachedMasterPassword = parsed
    return parsed
  } catch {
    cachedMasterPassword = null
    return null
  }
}
