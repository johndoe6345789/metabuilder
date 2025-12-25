import type { DeclarativeComponentRenderer } from './renderer-class'
import { globalRenderer } from './renderer-singleton'

export function getDeclarativeRenderer(): DeclarativeComponentRenderer {
  return globalRenderer
}
