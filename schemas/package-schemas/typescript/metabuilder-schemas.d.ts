/**
 * MetaBuilder Schema TypeScript Definitions
 * Hand-crafted type definitions for MetaBuilder JSON schemas
 * Version: 2.0.0
 * Generated: 2026-01-01
 */

// ============================================================================
// Package Metadata Schema
// ============================================================================

export interface PackageMetadata {
  $schema?: string;
  packageId: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  repository?: string;
  homepage?: string;
  bugs?: string;
  keywords?: string[];
  category?: string;
  icon?: string;
  minLevel?: number;
  primary?: boolean;
  private?: boolean;
  deprecated?: boolean | DeprecationInfo;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports?: PackageExports;
  tests?: TestConfiguration;
  permissions?: Record<string, Permission>;
  seed?: SeedConfiguration;
  storybook?: StorybookConfiguration;
  runtime?: RuntimeConfiguration;
}

export interface DeprecationInfo {
  version: string;
  reason: string;
  alternative: string;
}

export interface PackageExports {
  scripts?: string[];
  types?: string[];
  components?: string[];
  constants?: string[];
}

export interface TestConfiguration {
  scripts?: string[];
  cases?: string[];
  parameterized?: ParameterizedTest[];
}

export interface ParameterizedTest {
  logic: string;
  parameters: string;
}

export interface Permission {
  minLevel: number;
  description: string;
  storybook?: {
    stories?: unknown[];
  };
}

export interface SeedConfiguration {
  styles?: string;
  types?: string;
  schema?: string;
}

export interface StorybookConfiguration {
  stories?: Story[];
}

export interface Story {
  name: string;
  type: 'function' | 'component';
  function?: string;
  component?: string;
  args?: unknown[];
  props?: Record<string, unknown>;
  argControls?: Record<string, Control>;
  propControls?: Record<string, Control>;
}

export interface Control {
  type: 'number' | 'string' | 'boolean' | 'select' | 'object' | 'array' | 'color' | 'date';
  default?: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: unknown[];
}

export interface RuntimeConfiguration {
  scripts?: string[];
  main?: string;
  executor?: {
    lua?: string;
    javascript?: string;
  };
  description?: string;
}

// ============================================================================
// Entity Schema
// ============================================================================

export interface EntitySchema {
  $schema?: string;
  schemaVersion: string;
  entities: Entity[];
}

export interface Entity {
  name: string;
  version: string;
  description?: string;
  checksum?: string | null;
  tableName?: string;
  softDelete?: boolean;
  timestamps?: boolean;
  fields: Record<string, Field>;
  primaryKey?: string | string[];
  indexes?: Index[];
  relations?: Relation[];
  acl?: AccessControl;
}

export type FieldType =
  | 'string'
  | 'int'
  | 'bigint'
  | 'float'
  | 'double'
  | 'decimal'
  | 'boolean'
  | 'json'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'cuid'
  | 'uuid'
  | 'text'
  | 'blob'
  | 'enum';

export interface Field {
  type: FieldType;
  generated?: boolean;
  autoIncrement?: boolean;
  required?: boolean;
  nullable?: boolean;
  unique?: boolean;
  index?: boolean;
  default?: unknown;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  precision?: number;
  scale?: number;
  enum?: string[];
  pattern?: string;
  description?: string;
  comment?: string;
}

export interface Index {
  fields: string[];
  unique?: boolean;
  name?: string;
  type?: 'btree' | 'hash' | 'gist' | 'gin' | 'fulltext';
}

export type RelationType = 'belongsTo' | 'hasMany' | 'hasOne' | 'manyToMany';
export type CascadeAction = 'Cascade' | 'SetNull' | 'Restrict' | 'NoAction' | 'SetDefault';

export interface Relation {
  name: string;
  type: RelationType;
  entity: string;
  field?: string;
  foreignKey?: string;
  through?: string;
  onDelete?: CascadeAction;
  onUpdate?: CascadeAction;
}

export interface AccessControl {
  create?: string[];
  read?: string[];
  update?: string[];
  delete?: string[];
  rowLevel?: string;
}

// ============================================================================
// Types Schema
// ============================================================================

export interface TypesSchema {
  $schema?: string;
  schemaVersion: string;
  package: string;
  description?: string;
  types: TypeDefinition[];
  exports?: {
    types?: string[];
  };
}

export type TypeKind =
  | 'primitive'
  | 'object'
  | 'array'
  | 'union'
  | 'intersection'
  | 'tuple'
  | 'enum'
  | 'literal'
  | 'alias'
  | 'utility';

export type BaseType = 'string' | 'number' | 'boolean' | 'null' | 'any' | 'void' | 'unknown' | 'never';

export interface TypeDefinition {
  id: string;
  name: string;
  kind?: TypeKind;
  baseType?: BaseType;
  exported?: boolean;
  readonly?: boolean;
  description?: string;
  docstring?: Docstring;
  generics?: GenericParameter[];
  extends?: string;
  properties?: Record<string, PropertyDefinition>;
  elementType?: string;
  types?: string[];
  elements?: string[];
  enum?: (string | number)[];
  literalValue?: string | number | boolean;
  aliasOf?: string;
  utility?: UtilityType;
  additionalProperties?: boolean | { type: string; description?: string };
}

export interface GenericParameter {
  name: string;
  constraint?: string;
  default?: string;
}

export interface PropertyDefinition {
  type: string;
  required?: boolean;
  readonly?: boolean;
  description?: string;
  default?: unknown;
}

export type UtilityTypeName =
  | 'Pick'
  | 'Omit'
  | 'Partial'
  | 'Required'
  | 'Readonly'
  | 'Record'
  | 'Extract'
  | 'Exclude'
  | 'NonNullable'
  | 'ReturnType'
  | 'Parameters';

export interface UtilityType {
  type: UtilityTypeName;
  targetType: string;
  keys?: string[];
}

// ============================================================================
// Script Schema
// ============================================================================

export interface ScriptSchema {
  $schema?: string;
  schemaVersion: string;
  package: string;
  description?: string;
  imports?: Import[];
  exports?: {
    functions?: string[];
    constants?: string[];
  };
  constants?: Constant[];
  functions?: Function[];
}

export interface Import {
  from: string;
  import: string[];
}

export interface Constant {
  id: string;
  name: string;
  type?: string;
  value: unknown;
  exported?: boolean;
  docstring?: Docstring;
}

export interface Function {
  id: string;
  name: string;
  description?: string;
  params: Parameter[];
  returnType?: string;
  body: Statement[];
  exported?: boolean;
  pure?: boolean;
  async?: boolean;
  docstring?: Docstring;
  visual?: VisualMetadata;
}

export interface Parameter {
  name: string;
  type: string;
  default?: unknown;
  rest?: boolean;
  sanitize?: boolean;
  sanitizeOptions?: SanitizeOptions;
}

export interface SanitizeOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripScripts?: boolean;
  sqlInjectionProtection?: boolean;
}

export interface Docstring {
  summary?: string;
  description?: string;
  params?: ParamDoc[];
  returns?: string;
  throws?: ThrowsDoc[];
  examples?: Example[];
  see?: string[];
  since?: string;
  deprecated?: string;
}

export interface ParamDoc {
  name: string;
  description: string;
}

export interface ThrowsDoc {
  type: string;
  description: string;
}

export interface Example {
  title: string;
  code: string;
}

export interface VisualMetadata {
  category?: string;
  icon?: string;
  color?: string;
  position?: { x: number; y: number };
  inputPorts?: Port[];
  outputPorts?: Port[];
  complexity?: string;
  performance?: string;
  sideEffects?: boolean;
}

export interface Port {
  name: string;
  type: string;
  color?: string;
}

export type Statement =
  | ReturnStatement
  | ConstDeclaration
  | LetDeclaration
  | IfStatement
  | ForLoop
  | WhileLoop
  | CallExpression
  | AssignmentStatement
  | BlockStatement;

export interface ReturnStatement {
  type: 'return';
  value: Expression;
}

export interface ConstDeclaration {
  type: 'const_declaration';
  name: string;
  value: Expression;
}

export interface LetDeclaration {
  type: 'let_declaration';
  name: string;
  value?: Expression;
}

export interface IfStatement {
  type: 'if_statement';
  condition: Expression;
  then: Statement[];
  else?: Statement[];
}

export interface ForLoop {
  type: 'for_loop';
  init?: Statement;
  condition?: Expression;
  update?: Statement;
  body: Statement[];
}

export interface WhileLoop {
  type: 'while_loop';
  condition: Expression;
  body: Statement[];
}

export interface CallExpression {
  type: 'call_expression';
  callee: string | Expression;
  args: Expression[];
}

export interface AssignmentStatement {
  type: 'assignment';
  target: string;
  value: Expression;
}

export interface BlockStatement {
  type: 'block';
  statements: Statement[];
}

export type Expression = unknown; // Simplified for brevity

// ============================================================================
// API Schema
// ============================================================================

export interface APISchema {
  $schema?: string;
  schemaVersion: string;
  package: string;
  description?: string;
  basePath?: string;
  version?: string;
  auth?: AuthConfig;
  rateLimit?: RateLimitConfig;
  cors?: CorsConfig;
  routes?: Route[];
  graphql?: GraphQLConfig;
  middleware?: string[];
  errorHandlers?: Record<string, string>;
}

export interface AuthConfig {
  type: 'bearer' | 'basic' | 'apiKey' | 'oauth2' | 'jwt' | 'custom';
  required?: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface RateLimitConfig {
  enabled?: boolean;
  max: number;
  windowMs: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface CorsConfig {
  enabled?: boolean;
  origins: string[];
  methods?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface Route {
  id?: string;
  path: string;
  method: HTTPMethod;
  handler: string;
  description?: string;
  auth?: AuthConfig;
  rateLimit?: RateLimitConfig;
  params?: RouteParameter[];
  query?: RouteParameter[];
  body?: BodyConfig;
  response?: Record<string, ResponseConfig>;
  middleware?: string[];
}

export interface RouteParameter {
  name: string;
  type: string;
  required?: boolean;
  default?: unknown;
  pattern?: string;
  enum?: (string | number)[];
  min?: number;
  max?: number;
  description?: string;
}

export interface BodyConfig {
  required?: boolean;
  schema?: string;
  validate?: boolean;
}

export interface ResponseConfig {
  description: string;
  schema?: string;
}

export interface GraphQLConfig {
  enabled?: boolean;
  schema?: string;
  resolvers?: Record<string, string>;
}

// ============================================================================
// Validation Schema
// ============================================================================

export interface ValidationSchema {
  $schema?: string;
  schemaVersion: string;
  package: string;
  description?: string;
  imports?: Import[];
  exports?: {
    functions?: string[];
    patterns?: string[];
  };
  patterns?: Record<string, string>;
  functions?: ValidationFunction[];
}

export interface ValidationFunction {
  id: string;
  name: string;
  description?: string;
  params: Parameter[];
  returnType: string;
  async?: boolean;
  severity?: 'error' | 'warning' | 'info';
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  metadata?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error';
  params?: Record<string, unknown>;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code?: string;
  severity?: 'warning' | 'info';
}

// ============================================================================
// Helper Types
// ============================================================================

export type SemVer = `${number}.${number}.${number}${string}`;
export type UUID = string;
export type ISO8601DateTime = string;

// ============================================================================
// Exports
// ============================================================================

export default PackageMetadata;
