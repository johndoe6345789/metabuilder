/**
 * Get Component Configs
 * Retrieves component configurations from database
 */

import { prisma } from '@/lib/config/prisma'
import type { ComponentConfig } from './types'
import type { JsonValue } from '@/types/utility-types'

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
      props: JSON.parse(config.props) as Record<string, JsonValue>,
      styles: JSON.parse(config.styles) as Record<string, JsonValue>,
      events: JSON.parse(config.events) as Record<string, string>,
      conditionalRendering: config.conditionalRendering !== null && config.conditionalRendering !== ''
        ? JSON.parse(config.conditionalRendering) as { condition: string }
        : undefined,
    }
  }
  return result
}
