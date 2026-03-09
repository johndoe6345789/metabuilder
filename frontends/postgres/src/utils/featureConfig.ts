import featuresConfig from '@/config/features.json';

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

export type QueryOperator = {
  value: string;
  label: string;
};

export type IndexType = {
  value: string;
  label: string;
  description: string;
};

export type Translation = {
  name: string;
  description: string;
};

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

export type TableLayout = {
  columns: string[];
  columnWidths: Record<string, number>;
  defaultSort: {
    column: string;
    direction: 'asc' | 'desc';
  };
  hiddenColumns: string[];
  frozenColumns: string[];
};

export type ColumnLayout = {
  align: 'left' | 'right' | 'center';
  format: string;
  editable: boolean;
};

export type TableFeatures = {
  enablePagination: boolean;
  enableSearch: boolean;
  enableExport: boolean;
  enableFilters: boolean;
  rowsPerPage: number;
  allowedActions: string[];
};

export type ColumnFeatures = {
  searchable: boolean;
  sortable: boolean;
  filterable: boolean;
  required: boolean;
  validation?: string;
};

export type ComponentLayout = {
  [key: string]: any;
};

export type FormField = {
  name: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime';
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: string;
  prefix?: string;
  suffix?: string;
};

export type FormSchema = {
  fields: FormField[];
  submitLabel: string;
  cancelLabel: string;
};

export type ValidationRule = {
  pattern: string;
  message: string;
};

export type ApiEndpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
};

export type Permissions = {
  create?: string[];
  read?: string[];
  update?: string[];
  delete?: string[];
};

export type Relationships = {
  hasMany?: string[];
  belongsTo?: string[];
  hasOne?: string[];
  belongsToMany?: string[];
};

export type UiView = {
  component: string;
  showActions?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  showRelated?: boolean;
  tabs?: string[];
  redirect?: string;
};

export type ComponentNode = {
  component: string;
  props?: Record<string, any>;
  children?: ComponentNode[];
  condition?: string;
  forEach?: string;
  dataSource?: string;
  comment?: string;
};

export type ComponentTree = ComponentNode;

export type PropDefinition = {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function' | 'enum' | 'any';
  description: string;
  required?: boolean;
  default?: any;
  values?: any[];
};

export type ComponentPropSchema = {
  description: string;
  category: 'inputs' | 'display' | 'layout' | 'navigation' | 'feedback';
  props: Record<string, PropDefinition>;
};

export type SqlParameterType = {
  type: 'identifier' | 'enum' | 'integer' | 'string';
  description: string;
  validation?: string;
  allowedValues?: string[];
  sanitize: 'identifier' | 'enum' | 'integer' | 'string';
  min?: number;
  max?: number;
  default?: string | number;
};

export type DrizzlePattern = {
  type: 'raw' | 'identifier' | 'builder';
  template?: string;
  paramOrder?: string[];
  example?: string;
};

export type SqlQueryTemplate = {
  description: string;
  method: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'create' | 'alter' | 'drop';
  parameters: Record<string, string>;
  drizzlePattern: DrizzlePattern;
  returns: 'rows' | 'command';
  securityNotes: string;
};

export type SqlTemplates = {
  parameterTypes: Record<string, SqlParameterType>;
  queries: Record<string, Record<string, SqlQueryTemplate>>;
};


export type PlaywrightStep = {
  action: 'goto' | 'click' | 'fill' | 'select' | 'wait' | 'expect' | 'screenshot';
  selector?: string;
  value?: string;
  text?: string;
  url?: string;
  timeout?: number;
  condition?: string;
};

export type PlaywrightPlaybook = {
  name: string;
  description: string;
  tags?: string[];
  steps: PlaywrightStep[];
  cleanup?: PlaywrightStep[];
};

export type StorybookStory = {
  name: string;
  description?: string;
  args?: Record<string, any>;
  argTypes?: Record<string, any>;
  parameters?: Record<string, any>;
  play?: string[];
};

// Type definition for the features config structure
type FeaturesConfig = {
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
  storybookStories?: Record<string, Record<string, StorybookStory>>;
  features: Feature[];
  dataTypes: DataType[];
  constraintTypes?: ConstraintType[];
  navItems: NavItem[];
  queryOperators?: QueryOperator[];
  indexTypes?: IndexType[];
};

const config = featuresConfig as FeaturesConfig;

export function getFeatures(): Feature[] {
  return config.features.filter(f => f.enabled);
}

export function getFeatureById(id: string): Feature | undefined {
  return config.features.find(f => f.id === id && f.enabled);
}

export function getDataTypes(): DataType[] {
  return config.dataTypes;
}

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
    const feature = getFeatureById(item.featureId);
    return feature && feature.enabled;
  });
}

export function getEnabledFeaturesByPriority(priority: string): Feature[] {
  return config.features.filter(
    f => f.enabled && f.priority === priority,
  );
}

export function getTranslations(locale: 'en' | 'fr' = 'en'): Translations[typeof locale] | undefined {
  return config.translations?.[locale];
}

export function getFeatureTranslation(featureId: string, locale: 'en' | 'fr' = 'en'): Translation | undefined {
  return config.translations?.[locale]?.features[featureId];
}

export function getActionTranslation(actionName: string, locale: 'en' | 'fr' = 'en'): string | undefined {
  return config.translations?.[locale]?.actions[actionName];
}

export function getTableTranslation(tableName: string, locale: 'en' | 'fr' = 'en'): Translation | undefined {
  return config.translations?.[locale]?.tables[tableName];
}

export function getColumnTranslation(columnName: string, locale: 'en' | 'fr' = 'en'): string | undefined {
  return config.translations?.[locale]?.columns[columnName];
}

export function getActionFunctionName(featureId: string, actionName: string): string | undefined {
  return config.actions?.[featureId]?.[actionName];
}

export function getTableLayout(tableName: string): TableLayout | undefined {
  return config.tableLayouts?.[tableName];
}

export function getColumnLayout(columnName: string): ColumnLayout | undefined {
  return config.columnLayouts?.[columnName];
}

export function getTableFeatures(tableName: string): TableFeatures | undefined {
  return config.tableFeatures?.[tableName];
}

export function getColumnFeatures(columnName: string): ColumnFeatures | undefined {
  return config.columnFeatures?.[columnName];
}

export function getComponentLayout(componentName: string): ComponentLayout | undefined {
  return config.componentLayouts?.[componentName];
}

export function getFormSchema(tableName: string): FormSchema | undefined {
  return config.formSchemas?.[tableName];
}

export function getValidationRule(ruleName: string): ValidationRule | undefined {
  return config.validationRules?.[ruleName];
}

export function getApiEndpoints(resourceName: string): Record<string, ApiEndpoint> | undefined {
  return config.apiEndpoints?.[resourceName];
}

export function getApiEndpoint(resourceName: string, action: string): ApiEndpoint | undefined {
  return config.apiEndpoints?.[resourceName]?.[action];
}

export function getPermissions(resourceName: string): Permissions | undefined {
  return config.permissions?.[resourceName];
}

export function hasPermission(resourceName: string, action: string, userRole: string): boolean {
  const permissions = config.permissions?.[resourceName];
  const allowedRoles = permissions?.[action as keyof Permissions];
  return allowedRoles?.includes(userRole) ?? false;
}

export function getRelationships(tableName: string): Relationships | undefined {
  return config.relationships?.[tableName];
}

export function getUiViews(resourceName: string): Record<string, UiView> | undefined {
  return config.uiViews?.[resourceName];
}

export function getUiView(resourceName: string, viewName: string): UiView | undefined {
  return config.uiViews?.[resourceName]?.[viewName];
}

export function getComponentTree(treeName: string): ComponentTree | undefined {
  return config.componentTrees?.[treeName];
}

export function getAllComponentTrees(): Record<string, ComponentTree> {
  return config.componentTrees || {};
}

export function getComponentPropSchema(componentName: string): ComponentPropSchema | undefined {
  return config.componentProps?.[componentName];
}

export function getAllComponentPropSchemas(): Record<string, ComponentPropSchema> {
  return config.componentProps || {};
}

export function getComponentPropDefinition(componentName: string, propName: string): PropDefinition | undefined {
  return config.componentProps?.[componentName]?.props[propName];
}

export function validateComponentProps(componentName: string, props: Record<string, any>): { valid: boolean; errors: string[] } {
  const schema = getComponentPropSchema(componentName);
  
  if (!schema) {
    return { valid: true, errors: [] };
  }
  
  const errors: string[] = [];
  
  // Check required props
  Object.entries(schema.props).forEach(([propName, propDef]) => {
    if (propDef.required && !(propName in props)) {
      errors.push(`Missing required prop: ${propName}`);
    }
  });
  
  // Check prop types
  Object.entries(props).forEach(([propName, propValue]) => {
    const propDef = schema.props[propName];
    
    if (!propDef) {
      errors.push(`Unknown prop: ${propName}`);
      return;
    }
    
    // Type checking
    if (propDef.type === 'enum' && propDef.values) {
      if (!propDef.values.includes(propValue)) {
        errors.push(`Invalid value for ${propName}: ${propValue}. Expected one of: ${propDef.values.join(', ')}`);
      }
    } else if (propDef.type !== 'any') {
      const actualType = Array.isArray(propValue) ? 'array' : typeof propValue;
      if (actualType !== propDef.type) {
        errors.push(`Invalid type for ${propName}: expected ${propDef.type}, got ${actualType}`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors };
}

export function getComponentsByCategory(category: string): string[] {
  const schemas = getAllComponentPropSchemas();
  return Object.entries(schemas)
    .filter(([_, schema]) => schema.category === category)
    .map(([name, _]) => name);
}

// SQL Templates - Secure Implementation
export function getSqlParameterTypes(): Record<string, SqlParameterType> {
  return config.sqlTemplates?.parameterTypes || {};
}

export function getSqlParameterType(paramName: string): SqlParameterType | undefined {
  return config.sqlTemplates?.parameterTypes[paramName];
}

export function getSqlQueryTemplate(category: string, templateName: string): SqlQueryTemplate | undefined {
  return config.sqlTemplates?.queries[category]?.[templateName];
}

export function getAllSqlTemplates(): SqlTemplates | undefined {
  return config.sqlTemplates;
}

export function getSqlTemplatesByCategory(category: string): Record<string, SqlQueryTemplate> {
  return config.sqlTemplates?.queries[category] || {};
}

/**
 * Validate a parameter value against its type definition
 * Returns { valid: boolean, sanitized?: any, error?: string }
 */
export function validateSqlParameter(
  paramName: string,
  value: any
): { valid: boolean; sanitized?: any; error?: string } {
  const paramType = getSqlParameterType(paramName);
  
  if (!paramType) {
    return { valid: false, error: `Unknown parameter type: ${paramName}` };
  }
  
  const strValue = String(value);
  
  // Validate based on type
  switch (paramType.type) {
    case 'identifier':
      // PostgreSQL identifier validation
      if (!paramType.validation) {
        return { valid: false, error: 'No validation pattern defined for identifier' };
      }
      const identifierRegex = new RegExp(paramType.validation);
      if (!identifierRegex.test(strValue)) {
        return {
          valid: false,
          error: `Invalid identifier format: ${strValue}. Must match ${paramType.validation}`,
        };
      }
      return { valid: true, sanitized: strValue };
      
    case 'enum':
      if (!paramType.allowedValues) {
        return { valid: false, error: 'No allowed values defined for enum' };
      }
      if (!paramType.allowedValues.includes(strValue)) {
        return {
          valid: false,
          error: `Invalid enum value: ${strValue}. Allowed: ${paramType.allowedValues.join(', ')}`,
        };
      }
      return { valid: true, sanitized: strValue };
      
    case 'integer':
      const num = Number(value);
      if (!Number.isInteger(num)) {
        return { valid: false, error: `Not an integer: ${value}` };
      }
      if (paramType.min !== undefined && num < paramType.min) {
        return { valid: false, error: `Value ${num} is less than minimum ${paramType.min}` };
      }
      if (paramType.max !== undefined && num > paramType.max) {
        return { valid: false, error: `Value ${num} exceeds maximum ${paramType.max}` };
      }
      return { valid: true, sanitized: num };
      
    case 'string':
      // For string parameters, apply validation pattern if provided
      if (paramType.validation) {
        const stringRegex = new RegExp(paramType.validation);
        if (!stringRegex.test(strValue)) {
          return {
            valid: false,
            error: `Invalid string format: ${strValue}. Must match ${paramType.validation}`,
          };
        }
      }
      return { valid: true, sanitized: strValue };
      
    default:
      return { valid: false, error: `Unknown parameter type: ${paramType.type}` };
  }
}

/**
 * Validate all parameters for a SQL query template
 * Returns { valid: boolean, sanitized?: Record<string, any>, errors?: string[] }
 */
export function validateSqlTemplateParams(
  category: string,
  templateName: string,
  params: Record<string, any>
): { valid: boolean; sanitized?: Record<string, any>; errors?: string[] } {
  const template = getSqlQueryTemplate(category, templateName);
  
  if (!template) {
    return { valid: false, errors: [`Template not found: ${category}.${templateName}`] };
  }
  
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};
  
  // Validate each required parameter
  for (const [paramKey, paramTypeName] of Object.entries(template.parameters)) {
    const value = params[paramKey];
    
    if (value === undefined || value === null) {
      // Check if parameter has a default value
      const paramType = getSqlParameterType(paramTypeName);
      if (paramType?.default !== undefined) {
        sanitized[paramKey] = paramType.default;
        continue;
      }
      errors.push(`Missing required parameter: ${paramKey}`);
      continue;
    }
    
    const validation = validateSqlParameter(paramTypeName, value);
    if (!validation.valid) {
      errors.push(`Parameter ${paramKey}: ${validation.error}`);
    } else {
      sanitized[paramKey] = validation.sanitized;
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, sanitized };
}

// Playwright Playbooks
export function getPlaywrightPlaybook(playbookName: string): PlaywrightPlaybook | undefined {
  return config.playwrightPlaybooks?.[playbookName];
}

export function getAllPlaywrightPlaybooks(): Record<string, PlaywrightPlaybook> {
  return config.playwrightPlaybooks || {};
}

export function getPlaywrightPlaybooksByTag(tag: string): PlaywrightPlaybook[] {
  const playbooks = getAllPlaywrightPlaybooks();
  return Object.values(playbooks).filter(playbook => 
    playbook.tags?.includes(tag)
  );
}

// Storybook Stories
export function getStorybookStory(componentName: string, storyName: string): StorybookStory | undefined {
  return config.storybookStories?.[componentName]?.[storyName];
}

export function getAllStorybookStories(): Record<string, Record<string, StorybookStory>> {
  return config.storybookStories || {};
}

export function getStorybookStoriesForComponent(componentName: string): Record<string, StorybookStory> {
  return config.storybookStories?.[componentName] || {};
}
