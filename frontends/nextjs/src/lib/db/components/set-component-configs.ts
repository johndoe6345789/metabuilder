import { prisma } from '../prisma'
import type { ComponentConfig } from '../types'

export async function setComponentConfigs(configs: Record<string, ComponentConfig>): Promise<void> {
  await prisma.componentConfig.deleteMany()
  for (const config of Object.values(configs)) {
    await prisma.componentConfig.create({
      data: {
        id: config.id,
        componentId: config.componentId,
        props: JSON.stringify(config.props),
        styles: JSON.stringify(config.styles),
        events: JSON.stringify(config.events),
        conditionalRendering: config.conditionalRendering ? JSON.stringify(config.conditionalRendering) : null,
      },
    })
  }
}
