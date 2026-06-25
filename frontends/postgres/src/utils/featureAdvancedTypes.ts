/**
 * SQL template, Playwright, Storybook, and ApiEndpoint types.
 */

export type ApiEndpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
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
  operation:
    | 'select' | 'insert' | 'update' | 'delete'
    | 'create' | 'alter' | 'drop';
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
  action:
    | 'goto' | 'click' | 'fill' | 'select'
    | 'wait' | 'expect' | 'screenshot';
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

// FeaturesConfig is in featureConfigType.ts to avoid circular imports
