/**
 * TypeScript type definitions for JSON Script Runtime Executor
 */

// Expression Types
export type Expression =
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | NullLiteral
  | TemplateLiteral
  | BinaryExpression
  | LogicalExpression
  | UnaryExpression
  | ConditionalExpression
  | MemberAccess
  | CallExpression
  | ObjectLiteral
  | ArrayLiteral
  | Reference;

export interface StringLiteral {
  type: 'string_literal';
  value: string;
}

export interface NumberLiteral {
  type: 'number_literal';
  value: number;
}

export interface BooleanLiteral {
  type: 'boolean_literal';
  value: boolean;
}

export interface NullLiteral {
  type: 'null_literal';
}

export interface TemplateLiteral {
  type: 'template_literal';
  template: string;
}

export interface BinaryExpression {
  type: 'binary_expression';
  left: Expression | any;
  operator: '+' | '-' | '*' | '/' | '%' | '==' | '===' | '!=' | '!==' | '<' | '>' | '<=' | '>=';
  right: Expression | any;
}

export interface LogicalExpression {
  type: 'logical_expression';
  left: Expression | any;
  operator: '&&' | '||' | '??' | 'and' | 'or';
  right: Expression | any;
}

export interface UnaryExpression {
  type: 'unary_expression';
  operator: '!' | '-' | '+' | '~' | 'not' | 'typeof';
  argument: Expression | any;
}

export interface ConditionalExpression {
  type: 'conditional_expression';
  test: Expression | any;
  consequent: Expression | any;
  alternate: Expression | any;
}

export interface MemberAccess {
  type: 'member_access';
  object: Expression | any;
  property: string | Expression | any;
  computed?: boolean;
  optional?: boolean;
}

export interface CallExpression {
  type: 'call_expression';
  callee: string | Expression;
  args?: Array<Expression | any>;
}

export interface ObjectLiteral {
  type: 'object_literal';
  properties: Record<string, Expression | any>;
}

export interface ArrayLiteral {
  type: 'array_literal';
  elements: Array<Expression | any>;
}

export type Reference = string; // $ref:path.to.value

// Statement Types
export type Statement =
  | ConstDeclaration
  | LetDeclaration
  | Assignment
  | IfStatement
  | ReturnStatement
  | TryCatch
  | CallExpressionStatement
  | ForEachLoop
  | Comment;

export interface ConstDeclaration {
  type: 'const_declaration';
  name: string;
  value: Expression | any;
}

export interface LetDeclaration {
  type: 'let_declaration';
  name: string;
  value: Expression | any;
}

export interface Assignment {
  type: 'assignment';
  target: string | Reference;
  value: Expression | any;
}

export interface IfStatement {
  type: 'if_statement';
  condition: Expression | any;
  then?: Statement[];
  else?: Statement[];
}

export interface ReturnStatement {
  type: 'return';
  value: Expression | any;
}

export interface TryCatch {
  type: 'try_catch';
  try: Statement[];
  catch?: {
    param?: string;
    body: Statement[];
  };
  finally?: Statement[];
}

export interface CallExpressionStatement {
  type: 'call_expression';
  callee: string | Expression;
  args?: Array<Expression | any>;
}

export interface ForEachLoop {
  type: 'for_each_loop';
  iterator: string;
  iterable: Expression | any;
  body?: Statement[];
}

export interface Comment {
  type: 'comment';
  text: string;
}

// Function Definition
export interface FunctionParameter {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
  default?: any;
}

export interface FunctionDefinition {
  id: string;
  name: string;
  description?: string;
  async?: boolean;
  exported?: boolean;
  params?: FunctionParameter[];
  returnType?: string;
  body: Statement[];
}

// Constant Definition
export interface ConstantDefinition {
  id: string;
  name: string;
  type: string;
  value: any;
  description?: string;
  exported?: boolean;
}

// Script JSON Structure
export interface ScriptJSON {
  schema_version: string;
  package: string;
  description?: string;
  constants?: ConstantDefinition[];
  functions: FunctionDefinition[];
}

// Execution Context
export interface ExecutionContext {
  params: Record<string, any>;
  local_vars: Record<string, any>;
  constants: Record<string, any>;
  imports: Record<string, any>;
  functions: Record<string, any>;
  catch?: Record<string, any>;
}

// Return Value
export interface ReturnValue {
  type: 'return';
  value: any;
}

// Main API
export function resolveRef(ref: any, context: ExecutionContext): any;
export function evalExpression(expr: Expression | any, context: ExecutionContext): any;
export function executeStatement(stmt: Statement, context: ExecutionContext): ReturnValue | null;
export function executeFunction(scriptJson: ScriptJSON, functionName: string, args?: any[]): any;
export function loadAndExecute(jsonPath: string, functionName: string, args?: any[]): Promise<any>;
export function loadAndExecuteSync(jsonPath: string, functionName: string, args?: any[]): any;

declare const _default: {
  executeFunction: typeof executeFunction;
  loadAndExecute: typeof loadAndExecute;
  loadAndExecuteSync: typeof loadAndExecuteSync;
  resolveRef: typeof resolveRef;
  evalExpression: typeof evalExpression;
  executeStatement: typeof executeStatement;
};

export default _default;
