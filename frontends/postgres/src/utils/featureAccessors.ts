/**
 * Core feature, nav, and translation accessors.
 * Schema/component/SQL accessors are re-exported from
 * featureSchemaAccessors.ts.
 */

import featuresConfig from '@/config/features.json';
import type {
  ConstraintType, DataType, Feature, FeaturesConfig,
  IndexType, NavItem, QueryOperator, Translation, Translations,
} from './featureTypes';

const config = featuresConfig as FeaturesConfig;

export function getFeatures(): Feature[] {
  return config.features.filter(f => f.enabled);
}
export function getFeatureById(id: string): Feature | undefined {
  return config.features.find(f => f.id === id && f.enabled);
}
export function getDataTypes(): DataType[] { return config.dataTypes; }
export function getConstraintTypes(): ConstraintType[] {
  return config.constraintTypes || [];
}
export function getQueryOperators(): QueryOperator[] {
  return config.queryOperators || [];
}
export function getIndexTypes(): IndexType[] {
  return config.indexTypes || [];
}
export function getNavItems(): NavItem[] {
  return config.navItems.filter((item) => {
    const f = getFeatureById(item.featureId);
    return f && f.enabled;
  });
}
export function getEnabledFeaturesByPriority(p: string): Feature[] {
  return config.features.filter(f => f.enabled && f.priority === p);
}
export function getTranslations(
  locale: 'en' | 'fr' = 'en',
): Translations[typeof locale] | undefined {
  return config.translations?.[locale];
}
export function getFeatureTranslation(
  featureId: string, locale: 'en' | 'fr' = 'en',
): Translation | undefined {
  return config.translations?.[locale]?.features[featureId];
}
export function getActionTranslation(
  actionName: string, locale: 'en' | 'fr' = 'en',
): string | undefined {
  return config.translations?.[locale]?.actions[actionName];
}
export function getTableTranslation(
  tableName: string, locale: 'en' | 'fr' = 'en',
): Translation | undefined {
  return config.translations?.[locale]?.tables[tableName];
}
export function getColumnTranslation(
  columnName: string, locale: 'en' | 'fr' = 'en',
): string | undefined {
  return config.translations?.[locale]?.columns[columnName];
}
export function getActionFunctionName(
  featureId: string, actionName: string,
): string | undefined {
  return config.actions?.[featureId]?.[actionName];
}

export * from './featureSchemaAccessors';
