import { buildPackageTemplate } from '../builders/package/build-package-template'
import { buildReactAppTemplate } from '../builders/package/build-react-app-template'
import { PACKAGE_TEMPLATE_CONFIGS, REACT_APP_TEMPLATE_CONFIG } from './template-configs'
import type { PackageTemplate } from './types'

export function getPackageTemplates(): PackageTemplate[] {
  const packageTemplates = PACKAGE_TEMPLATE_CONFIGS.map((config) => buildPackageTemplate(config))
  const reactTemplate = buildReactAppTemplate(REACT_APP_TEMPLATE_CONFIG)
  return [reactTemplate, ...packageTemplates]
}
