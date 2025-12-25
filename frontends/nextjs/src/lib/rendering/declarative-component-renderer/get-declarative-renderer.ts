import { DeclarativeComponentRenderer } from './renderer'

const globalRenderer = new DeclarativeComponentRenderer()

export function getDeclarativeRenderer(): DeclarativeComponentRenderer {
  return globalRenderer
}
