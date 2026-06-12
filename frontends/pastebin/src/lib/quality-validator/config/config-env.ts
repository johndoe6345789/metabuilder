/**
 * Load Configuration from environment variables
 */

import { Configuration } from '../types/index.js'
import { DEFAULT_CONFIG } from './config-defaults.js'

/**
 * Read partial configuration from environment variables
 */
export function loadFromEnvironment(): Partial<Configuration> {
  const config: Partial<Configuration> = {}

  if (process.env.QUALITY_PROJECT_NAME) {
    config.projectName = process.env.QUALITY_PROJECT_NAME
  }

  if (process.env.QUALITY_PROFILE) {
    config.profile = process.env.QUALITY_PROFILE
  }

  if (process.env.QUALITY_SKIP_COMPLEXITY === 'true') {
    config.codeQuality = {
      ...DEFAULT_CONFIG.codeQuality,
      enabled: false,
    }
  }

  if (process.env.QUALITY_SKIP_COVERAGE === 'true') {
    config.testCoverage = {
      ...DEFAULT_CONFIG.testCoverage,
      enabled: false,
    }
  }

  if (process.env.QUALITY_SKIP_ARCHITECTURE === 'true') {
    config.architecture = {
      ...DEFAULT_CONFIG.architecture,
      enabled: false,
    }
  }

  if (process.env.QUALITY_SKIP_SECURITY === 'true') {
    config.security = {
      ...DEFAULT_CONFIG.security,
      enabled: false,
    }
  }

  if (process.env.QUALITY_NO_COLOR === 'true') {
    config.reporting = {
      ...DEFAULT_CONFIG.reporting,
      colors: false,
    }
  }

  if (process.env.QUALITY_VERBOSE === 'true') {
    config.reporting = {
      ...DEFAULT_CONFIG.reporting,
      verbose: true,
    }
  }

  return config
}
