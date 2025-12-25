import { prisma } from '../prisma'
import type { ComponentConfig } from '../types'

export async function addComponentConfig(config: ComponentConfig): Promise<void> {
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
