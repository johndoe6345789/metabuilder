import componentDefinitionsData from '@/lib/component-definitions.json'
import type { ComponentDefinition } from '@/lib/component-definition-types'

export const componentDefinitions = (componentDefinitionsData as ComponentDefinition[]).map(
  (definition) => {
    if (definition.type !== 'Breadcrumb') {
      return definition
    }

    return {
      ...definition,
      props: [
        {
          name: 'items',
          type: 'BreadcrumbItem[]',
          description: 'Breadcrumb items with labels and optional hrefs.',
          supportsBinding: true,
        },
        {
          name: 'className',
          type: 'string',
          description: 'Optional class names for the breadcrumb container.',
          supportsBinding: true,
        },
      ],
    }
  }
)

export default componentDefinitions
