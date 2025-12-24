import { Database } from '@/lib/database'
import type { ComponentConfig } from '@/lib/database'

export async function initializeComponents() {
  const existingConfigs = await Database.getComponentConfigs()
  if (Object.keys(existingConfigs).length > 0) {
    return
  }

  const componentConfigs: ComponentConfig[] = [
    {
      id: 'config_home_heading',
      componentId: 'node_home_heading',
      props: {
        level: 1,
        children: 'Welcome to MetaBuilder',
        className: 'text-6xl font-bold text-foreground mb-4',
      },
      styles: {},
      events: {},
    },
    {
      id: 'config_home_subtitle',
      componentId: 'node_home_subtitle',
      props: {
        children: 'Build multi-tenant applications without writing code',
        className: 'text-xl text-muted-foreground mb-8',
      },
      styles: {},
      events: {},
    },
    {
      id: 'config_home_button',
      componentId: 'node_home_button',
      props: {
        children: 'Get Started',
        variant: 'default',
        size: 'lg',
        className: 'px-8 py-3',
      },
      styles: {},
      events: {},
    },
  ]

  for (const config of componentConfigs) {
    await Database.addComponentConfig(config)
  }
}
