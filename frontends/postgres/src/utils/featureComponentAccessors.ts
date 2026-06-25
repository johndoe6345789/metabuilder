/**
 * Component tree, prop schema, and SQL template accessors.
 * Playwright/Storybook accessors are in featureStoryAccessors.ts.
 */

import featuresConfig from '@/config/features.json';
import type {
  ComponentPropSchema, ComponentTree,
  FeaturesConfig, PropDefinition,
  SqlParameterType, SqlQueryTemplate, SqlTemplates,
} from './featureTypes';

const config = featuresConfig as FeaturesConfig;

export function getComponentTree(t: string): ComponentTree | undefined {
  return config.componentTrees?.[t];
}
export function getAllComponentTrees(): Record<string, ComponentTree> {
  return config.componentTrees || {};
}
export function getComponentPropSchema(
  n: string,
): ComponentPropSchema | undefined {
  return config.componentProps?.[n];
}
export function getAllComponentPropSchemas(): Record<
  string, ComponentPropSchema
> {
  return config.componentProps || {};
}
export function getComponentPropDefinition(
  componentName: string, propName: string,
): PropDefinition | undefined {
  return config.componentProps?.[componentName]?.props[propName];
}
export function validateComponentProps(
  componentName: string, props: Record<string, any>,
): { valid: boolean; errors: string[] } {
  const schema = getComponentPropSchema(componentName);
  if (!schema) return { valid: true, errors: [] };
  const errors: string[] = [];
  Object.entries(schema.props).forEach(([pn, pd]) => {
    if (pd.required && !(pn in props)) {
      errors.push(`Missing required prop: ${pn}`);
    }
  });
  Object.entries(props).forEach(([pn, pv]) => {
    const pd = schema.props[pn];
    if (!pd) { errors.push(`Unknown prop: ${pn}`); return; }
    if (pd.type === 'enum' && pd.values) {
      if (!pd.values.includes(pv)) {
        errors.push(`Invalid value for ${pn}: ${pv}. Expected one of: ${pd.values.join(', ')}`);
      }
    } else if (pd.type !== 'any') {
      const at = Array.isArray(pv) ? 'array' : typeof pv;
      if (at !== pd.type) {
        errors.push(`Invalid type for ${pn}: expected ${pd.type}, got ${at}`);
      }
    }
  });
  return { valid: errors.length === 0, errors };
}
export function getComponentsByCategory(category: string): string[] {
  return Object.entries(getAllComponentPropSchemas())
    .filter(([_, s]) => s.category === category)
    .map(([n]) => n);
}
export function getSqlParameterType(
  n: string,
): SqlParameterType | undefined {
  return config.sqlTemplates?.parameterTypes[n];
}
export function getSqlParameterTypes(): Record<string, SqlParameterType> {
  return config.sqlTemplates?.parameterTypes || {};
}
export function getSqlQueryTemplate(
  category: string, templateName: string,
): SqlQueryTemplate | undefined {
  return config.sqlTemplates?.queries[category]?.[templateName];
}
export function getAllSqlTemplates(): SqlTemplates | undefined {
  return config.sqlTemplates;
}
export function getSqlTemplatesByCategory(
  category: string,
): Record<string, SqlQueryTemplate> {
  return config.sqlTemplates?.queries[category] || {};
}

export * from './featureStoryAccessors';
