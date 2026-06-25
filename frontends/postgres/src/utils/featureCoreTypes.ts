/**
 * Core type definitions: Feature, DataType, NavItem, translations,
 * and basic config primitives.
 * Form/layout/component types are in featureFormTypes.ts.
 */

export type Feature = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: string;
  endpoints: Array<{
    path: string;
    methods: string[];
    description: string;
  }>;
  ui: {
    showInNav: boolean;
    icon: string;
    actions: string[];
  };
};

export type DataType = {
  name: string;
  category: string;
  requiresLength: boolean;
  defaultLength?: number;
  autoIncrement?: boolean;
};

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  featureId: string;
};

export type ConstraintType = {
  name: string;
  description: string;
  requiresColumn: boolean;
  requiresExpression: boolean;
};

export type QueryOperator = { value: string; label: string };

export type IndexType = {
  value: string;
  label: string;
  description: string;
};

export type Translation = { name: string; description: string };

export type Translations = {
  en: {
    features: Record<string, Translation>;
    actions: Record<string, string>;
    tables: Record<string, Translation>;
    columns: Record<string, string>;
  };
  fr: {
    features: Record<string, Translation>;
    actions: Record<string, string>;
    tables: Record<string, Translation>;
    columns: Record<string, string>;
  };
};

// Re-export form/layout/component types for convenience
export * from './featureFormTypes';
