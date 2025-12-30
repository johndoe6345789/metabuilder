// Rendering system exports
export { DeclarativeComponentRenderer } from './declarative-component-renderer'
export { PageDefinitionBuilder } from './page-definition-builder'
export {
  getPageRenderer,
  type PageContext,
  type PageDefinition,
  PageRenderer,
} from './page-renderer'

// Component registry for Lua to React mapping
export {
  componentRegistry,
  getComponentByType,
  hasComponent,
  getRegisteredComponentTypes,
  registerComponent,
  type LuaComponentProps,
} from './component-registry'
