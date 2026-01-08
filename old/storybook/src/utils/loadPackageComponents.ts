/**
 * Dynamic Package Component Loader
 *
 * Loads component definitions from packages/*/seed/components.json
 * and generates React components from the metadata
 */

export interface ComponentDefinition {
  id: string
  type: string
  props?: Record<string, any>
  children?: ComponentDefinition[]
  className?: string
  style?: Record<string, any>
  text?: string
}

export interface PackageComponents {
  packageId: string
  components: Record<string, ComponentDefinition>
}

/**
 * Load components.json from a package
 */
export async function loadPackageComponents(packageId: string): Promise<PackageComponents | null> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/components.json`)
    if (!response.ok) {
      console.warn(`No components.json found for package: ${packageId}`)
      return null
    }

    const data = await response.json()
    return {
      packageId,
      components: data.components || data
    }
  } catch (error) {
    console.error(`Failed to load components for ${packageId}:`, error)
    return null
  }
}

/**
 * Convert a component definition to React element
 */
export function renderComponentDefinition(def: ComponentDefinition): React.ReactElement {
  const { type, props = {}, children, className, style, text } = def

  // Map component types to HTML elements
  const elementMap: Record<string, string> = {
    'Text': 'span',
    'Heading': 'h1',
    'Button': 'button',
    'Card': 'div',
    'Box': 'div',
    'Section': 'section',
    'Nav': 'nav',
    'Input': 'input',
    'Table': 'table',
    'TableRow': 'tr',
    'TableCell': 'td',
    'Badge': 'span',
  }

  const element = elementMap[type] || 'div'

  const finalProps = {
    ...props,
    className: className ? `${type.toLowerCase()} ${className}` : type.toLowerCase(),
    style: style || {}
  }

  const childElements = children?.map((child, idx) =>
    renderComponentDefinition({ ...child, props: { ...child.props, key: idx } })
  ) || []

  return React.createElement(
    element,
    finalProps,
    text || childElements
  )
}

/**
 * Load all components from multiple packages
 */
export async function loadMultiplePackageComponents(
  packageIds: string[]
): Promise<Record<string, PackageComponents>> {
  const results = await Promise.all(
    packageIds.map(id => loadPackageComponents(id))
  )

  return results.reduce((acc, result) => {
    if (result) {
      acc[result.packageId] = result
    }
    return acc
  }, {} as Record<string, PackageComponents>)
}
