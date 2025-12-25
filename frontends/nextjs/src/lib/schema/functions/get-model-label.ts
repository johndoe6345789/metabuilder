import type { ModelSchema } from '../types/schema-types'

/**
 * Get the display label for a model
 * @param model - The model schema
 * @returns The model's label or a capitalized version of its name
 */
export const getModelLabel = (model: ModelSchema): string => {
  return model.label || model.name.charAt(0).toUpperCase() + model.name.slice(1)
}
