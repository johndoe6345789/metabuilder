const PRIMARY_KEY_FIELDS: Record<string, string> = {
  Credential: 'username',
  InstalledPackage: 'packageId',
  PackageData: 'packageId',
  PasswordResetToken: 'username',
  SystemConfig: 'key',
}

export function getPrimaryKeyField(entity: string): string {
  return PRIMARY_KEY_FIELDS[entity] ?? 'id'
}
