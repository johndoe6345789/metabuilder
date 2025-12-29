import type { PackageTemplateConfig, ReactAppTemplateConfig } from '../types'
import { ADVANCED_PACKAGE_TEMPLATE_CONFIGS } from './configs/advanced'
import { BASE_PACKAGE_TEMPLATE_CONFIGS, BASE_REACT_APP_TEMPLATE_CONFIG } from './configs/base'
import { EXPERIMENTAL_PACKAGE_TEMPLATE_CONFIGS } from './configs/experimental'

export const REACT_APP_TEMPLATE_CONFIG: ReactAppTemplateConfig = BASE_REACT_APP_TEMPLATE_CONFIG

export const PACKAGE_TEMPLATE_CONFIGS: PackageTemplateConfig[] = [
  ...BASE_PACKAGE_TEMPLATE_CONFIGS,
  ...ADVANCED_PACKAGE_TEMPLATE_CONFIGS,
  ...EXPERIMENTAL_PACKAGE_TEMPLATE_CONFIGS,
]
