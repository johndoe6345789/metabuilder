import type { InstalledPackage } from '../../../../foundation/types'
import { validatePackageCreate } from '../../../../foundation/validation'

export const validatePackage = (data: Partial<InstalledPackage>): string[] => {
  return validatePackageCreate(data)
}
