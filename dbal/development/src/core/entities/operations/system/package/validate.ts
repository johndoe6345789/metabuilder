import type { Package } from '../../../../foundation/types'
import { validatePackageCreate } from '../../../../foundation/validation'

export const validatePackage = (data: Partial<Package>): string[] => {
  return validatePackageCreate(data)
}
