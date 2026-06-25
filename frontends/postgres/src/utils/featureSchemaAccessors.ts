/**
 * Schema, layout, permissions, relationships, and UI view accessors.
 * Component/SQL/story accessors are in featureComponentAccessors.ts.
 */

import featuresConfig from '@/config/features.json';
import type {
  ApiEndpoint,
  ColumnFeatures,
  ColumnLayout,
  ComponentLayout,
  FeaturesConfig,
  FormSchema,
  Permissions,
  Relationships,
  TableFeatures,
  TableLayout,
  UiView,
  ValidationRule,
} from './featureTypes';

const config = featuresConfig as FeaturesConfig;

export function getTableLayout(t: string): TableLayout | undefined {
  return config.tableLayouts?.[t];
}
export function getColumnLayout(
  c: string,
): ColumnLayout | undefined {
  return config.columnLayouts?.[c];
}
export function getTableFeatures(
  t: string,
): TableFeatures | undefined {
  return config.tableFeatures?.[t];
}
export function getColumnFeatures(
  c: string,
): ColumnFeatures | undefined {
  return config.columnFeatures?.[c];
}
export function getComponentLayout(
  c: string,
): ComponentLayout | undefined {
  return config.componentLayouts?.[c];
}
export function getFormSchema(t: string): FormSchema | undefined {
  return config.formSchemas?.[t];
}
export function getValidationRule(
  r: string,
): ValidationRule | undefined {
  return config.validationRules?.[r];
}
export function getApiEndpoints(
  r: string,
): Record<string, ApiEndpoint> | undefined {
  return config.apiEndpoints?.[r];
}
export function getApiEndpoint(
  r: string,
  action: string,
): ApiEndpoint | undefined {
  return config.apiEndpoints?.[r]?.[action];
}
export function getPermissions(
  r: string,
): Permissions | undefined {
  return config.permissions?.[r];
}
export function hasPermission(
  r: string,
  action: string,
  userRole: string,
): boolean {
  const perms = config.permissions?.[r];
  const roles = perms?.[action as keyof Permissions];
  return roles?.includes(userRole) ?? false;
}
export function getRelationships(
  t: string,
): Relationships | undefined {
  return config.relationships?.[t];
}
export function getUiViews(
  r: string,
): Record<string, UiView> | undefined {
  return config.uiViews?.[r];
}
export function getUiView(
  r: string,
  viewName: string,
): UiView | undefined {
  return config.uiViews?.[r]?.[viewName];
}

// Re-export component/SQL/story accessors
export * from './featureComponentAccessors';
