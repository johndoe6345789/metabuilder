/**
 * Get Component Configs
 * Retrieves component configurations from database
 */

import { prisma } from '../prisma'
import type { ComponentConfig } from './types'

/**
 * Get all component configs
 * @returns Record of component configs by ID
 */
export const getComponentConfigs = async (): Promise<Record<string, ComponentConfig>> => {
  const configs = await prisma.componentConfig.findMany()
  const result: Record<string, ComponentConfig> = {}
  for (const config of configs) {
    result[config.id] = {
      id: config.id,
      componentId: config.componentId,
      props: JSON.parse(config.props),
      styles: JSON.parse(config.styles),
      events: JSON.parse(config.events),
      conditionalRendering: config.conditionalRendering
        ? JSON.parse(config.conditionalRendering)
        : undefined,
    }
  }
  return result
}
