/**
 * Root FeaturesConfig type — the shape of features.json.
 */

import type {
  ColumnFeatures,
  ColumnLayout,
  ComponentLayout,
  ComponentPropSchema,
  ComponentTree,
  ConstraintType,
  DataType,
  Feature,
  FormSchema,
  IndexType,
  NavItem,
  Permissions,
  QueryOperator,
  Relationships,
  TableFeatures,
  TableLayout,
  Translations,
  UiView,
  ValidationRule,
} from './featureCoreTypes';
import type {
  ApiEndpoint,
  PlaywrightPlaybook,
  SqlTemplates,
  StorybookStory,
} from './featureAdvancedTypes';

export type FeaturesConfig = {
  translations?: Translations;
  actions?: Record<string, Record<string, string>>;
  tableLayouts?: Record<string, TableLayout>;
  columnLayouts?: Record<string, ColumnLayout>;
  tableFeatures?: Record<string, TableFeatures>;
  columnFeatures?: Record<string, ColumnFeatures>;
  componentLayouts?: Record<string, ComponentLayout>;
  formSchemas?: Record<string, FormSchema>;
  validationRules?: Record<string, ValidationRule>;
  apiEndpoints?: Record<string, Record<string, ApiEndpoint>>;
  permissions?: Record<string, Permissions>;
  relationships?: Record<string, Relationships>;
  uiViews?: Record<string, Record<string, UiView>>;
  componentTrees?: Record<string, ComponentTree>;
  componentProps?: Record<string, ComponentPropSchema>;
  sqlTemplates?: SqlTemplates;
  playwrightPlaybooks?: Record<string, PlaywrightPlaybook>;
  storybookStories?: Record<
    string,
    Record<string, StorybookStory>
  >;
  features: Feature[];
  dataTypes: DataType[];
  constraintTypes?: ConstraintType[];
  navItems: NavItem[];
  queryOperators?: QueryOperator[];
  indexTypes?: IndexType[];
};
