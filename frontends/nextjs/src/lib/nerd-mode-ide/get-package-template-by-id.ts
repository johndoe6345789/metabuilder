import { getPackageTemplates } from './get-package-templates'
import type { PackageTemplate } from './types'

export function getPackageTemplateById(templateId: string): PackageTemplate | null {
  return getPackageTemplates().find((template) => template.id === templateId) ?? null
}
