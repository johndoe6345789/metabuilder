import { ComponentRenderer } from './component-renderer'

/**
 * Creates a React component from a JSON definition
 * This eliminates the need for wrapper files - components are pure JSON
 */
export function createJsonComponent<TProps = any>(
  jsonDefinition: any
) {
  return function JsonComponent(props: TProps) {
    return (
      <ComponentRenderer
        component={jsonDefinition}
        data={props}
        context={{}}
      />
    )
  }
}
