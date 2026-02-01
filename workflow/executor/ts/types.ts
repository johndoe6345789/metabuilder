/**
 * Core type definitions for N8N-style DAG workflow engine
 * @packageDocumentation
 */

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  locked: boolean;
  tags: string[];
  category:
    | 'automation'
    | 'integration'
    | 'business-logic'
    | 'data-transformation'
    | 'notification'
    | 'approval'
    | 'other';
  settings: WorkflowSettings;
  nodes: WorkflowNode[];
  connections: ConnectionMap;
  triggers: WorkflowTrigger[];
  variables: Record<string, WorkflowVariable>;
  errorHandling: ErrorHandlingPolicy;
  retryPolicy: RetryPolicy;
  rateLimiting: RateLimitPolicy;
  credentials: CredentialBinding[];
  metadata: Record<string, any>;
  executionLimits: ExecutionLimits;
  multiTenancy: MultiTenancyPolicy;
  versionHistory: VersionHistoryEntry[];
}

export interface WorkflowSettings {
  timezone: string;
  executionTimeout: number;
  saveExecutionProgress: boolean;
  saveExecutionData: 'all' | 'errors-only' | 'none';
  maxConcurrentExecutions: number;
  debugMode: boolean;
  enableNotifications: boolean;
  notificationChannels: ('email' | 'webhook' | 'in-app' | 'slack')[];
}

export interface WorkflowNode {
  id: string;
  name: string;
  description?: string;
  type:
    | 'trigger'
    | 'operation'
    | 'action'
    | 'logic'
    | 'transformer'
    | 'iterator'
    | 'parallel'
    | 'wait'
    | 'webhook'
    | 'schedule';
  typeVersion: number;
  nodeType: string;
  position: [number, number];
  size?: [number, number];
  parameters: Record<string, any>;
  parameterSchema?: Record<string, any>;
  inputs: NodePort[];
  outputs: NodePort[];
  credentials: Record<string, CredentialRef>;
  disabled: boolean;
  skipOnFail: boolean;
  alwaysOutputData: boolean;
  retryPolicy?: RetryPolicy;
  timeout?: number;
  maxTries: number;
  waitBetweenTries: number;
  continueOnError: boolean;
  onError: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput' | 'retry';
  errorOutput?: string;
  notes?: string;
  notesInFlow: boolean;
  color?: string;
  icon?: string;
  metadata: Record<string, any>;
}

export interface NodePort {
  name: string;
  type: 'main' | 'error' | 'success' | 'condition';
  index?: number;
  label?: string;
  description?: string;
  maxConnections: number;
  dataTypes: string[];
  required: boolean;
}

export interface ConnectionMap {
  [fromNodeId: string]: {
    [outputType: string]: {
      [outputIndex: string]: ConnectionTarget[];
    };
  };
}

export interface ConnectionTarget {
  node: string;
  type: 'main' | 'error' | 'condition';
  index: number;
  conditional?: boolean;
  condition?: string;
}

export interface WorkflowTrigger {
  nodeId: string;
  kind:
    | 'webhook'
    | 'schedule'
    | 'manual'
    | 'event'
    | 'email'
    | 'message-queue'
    | 'webhook-listen'
    | 'polling'
    | 'custom';
  enabled: boolean;
  webhookId?: string;
  webhookUrl?: string;
  webhookMethods?: string[];
  schedule?: string; // cron expression
  timezone?: string;
  eventType?: string;
  eventFilters?: Record<string, any>;
  rateLimiting?: RateLimitPolicy;
  metadata: Record<string, any>;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'any';
  description?: string;
  defaultValue?: any;
  required: boolean;
  scope: 'workflow' | 'execution' | 'global';
}

export interface ErrorHandlingPolicy {
  default: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
  nodeOverrides?: Record<
    string,
    'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput' | 'skipNode'
  >;
  errorLogger?: string;
  errorNotification: boolean;
  notifyChannels: string[];
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  backoffType: 'linear' | 'exponential' | 'fibonacci';
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
  retryableStatusCodes: number[];
}

export interface RateLimitPolicy {
  enabled: boolean;
  requestsPerWindow?: number;
  windowSeconds?: number;
  key: 'global' | 'tenant' | 'user' | 'ip' | 'custom';
  customKeyTemplate?: string;
  onLimitExceeded: 'queue' | 'reject' | 'skip';
}

export interface CredentialBinding {
  nodeId: string;
  credentialType: string;
  credentialId: string | number;
  credentialName?: string;
  fieldMappings?: Record<string, string>;
}

export interface CredentialRef {
  id: string | number;
  name?: string;
}

export interface ExecutionLimits {
  maxExecutionTime: number;
  maxMemoryMb: number;
  maxNodeExecutions?: number;
  maxDataSizeMb: number;
  maxArrayItems: number;
}

export interface MultiTenancyPolicy {
  enforced: boolean;
  tenantIdField: string;
  restrictNodeTypes: string[];
  allowCrossTenantAccess: boolean;
  auditLogging: boolean;
}

export interface VersionHistoryEntry {
  versionId: string;
  createdAt: Date;
  createdBy: string;
  message?: string;
  changesSummary?: string;
}

/**
 * Runtime execution types
 */

export interface WorkflowContext {
  executionId: string;
  tenantId: string;
  userId: string;
  user: {
    id: string;
    email: string;
    level: number;
  };
  trigger: WorkflowTrigger;
  triggerData: Record<string, any>;
  variables: Record<string, any>;
  secrets: Record<string, string>;
  request?: {
    method: string;
    headers: Record<string, string>;
    query: Record<string, any>;
    body: Record<string, any>;
  };
}

export interface ExecutionState {
  [nodeId: string]: NodeResult;
}

export interface NodeResult {
  status: 'success' | 'error' | 'skipped' | 'pending';
  output?: any;
  error?: string;
  errorCode?: string;
  timestamp: number;
  duration?: number;
  retries?: number;
  inputData?: any;
  outputData?: any;
  recoveryApplied?: boolean;
  fallbackNodeType?: string;
  validationErrors?: string[];
}

export interface ExecutionRecord {
  id: string;
  workflowId: string;
  tenantId: string;
  userId: string;
  triggeredBy: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'success' | 'error' | 'aborted' | 'timeout';
  state: ExecutionState;
  metrics: ExecutionMetrics;
  logs: LogEntry[];
  error?: {
    message: string;
    code: string;
    nodeId?: string;
  };
}

export interface ExecutionMetrics {
  nodesExecuted: number;
  successNodes: number;
  failedNodes: number;
  retriedNodes: number;
  totalRetries: number;
  peakMemory: number;
  dataProcessed: number;
  apiCallsMade: number;
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  nodeId?: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Node executor interface
 */

export interface INodeExecutor {
  nodeType: string;
  execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult>;
  validate(node: WorkflowNode): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Multi-Tenant Safety Types
 */

/**
 * Tenant isolation policy - controls data access and execution boundaries
 */
export interface TenantPolicy {
  /** Unique tenant identifier */
  tenantId: string;

  /** Isolation level: strict (no cross-tenant), standard (isolated contexts), relaxed (allow sharing) */
  isolationLevel: 'strict' | 'standard' | 'relaxed';

  /** Node types forbidden for this tenant */
  restrictedNodeTypes: string[];

  /** Whitelist of allowed node types (if empty, all non-restricted types allowed) */
  allowedNodeTypes?: string[];

  /** Users blacklisted from executing workflows */
  blacklistedUsers?: string[];

  /** Users whitelisted to execute workflows (if empty, all users allowed except blacklisted) */
  whitelistedUsers?: string[];

  /** Output data filters to apply to all node outputs */
  outputFilters?: Array<{ path: string; action: 'remove' | 'mask' }>;

  /** Field name patterns to redact from outputs (regex) */
  sensitiveFieldPatterns?: string[];

  /** Maximum output data size in MB per node execution */
  maxOutputSizeMb?: number;

  /** Enable cross-tenant data access (only if isolationLevel is relaxed) */
  allowCrossTenantAccess?: boolean;

  /** Enable comprehensive audit logging for this tenant */
  auditLoggingEnabled: boolean;

  /** Custom metadata for tenant-specific policies */
  metadata?: Record<string, any>;
}

/**
 * Runtime tenant context - track execution context and user identity
 */
export interface TenantContext {
  /** Tenant identifier */
  tenantId: string;

  /** Execution identifier */
  executionId: string;

  /** User identifier */
  userId: string;

  /** User privilege level (0=guest, 1=user, 2=admin, 3=system) */
  userLevel: number;

  /** Timestamp when context was created */
  timestamp: Date;
}

/**
 * Multi-tenant error type enumeration
 */
export type MultiTenantErrorType =
  | 'TENANT_NOT_REGISTERED'
  | 'TENANT_ALREADY_REGISTERED'
  | 'TENANT_MISMATCH'
  | 'WORKFLOW_OWNERSHIP_MISMATCH'
  | 'UNAUTHORIZED_USER'
  | 'RESTRICTED_NODE_TYPE'
  | 'NODE_NOT_WHITELISTED'
  | 'CROSS_TENANT_CREDENTIAL'
  | 'POLICY_VIOLATION'
  | 'POLICY_NOT_FOUND'
  | 'INVALID_POLICY'
  | 'CROSS_TENANT_ATTEMPT'
  | 'TENANT_NOT_FOUND';

/**
 * Multi-tenant safety error
 */
export class MultiTenantError extends Error {
  constructor(
    public code: MultiTenantErrorType,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'MultiTenantError';
    Object.setPrototypeOf(this, MultiTenantError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context
    };
  }
}

/**
 * Built-in node types
 */

export type BuiltInNodeType =
  | 'dbal-read'
  | 'dbal-write'
  | 'dbal-delete'
  | 'dbal-aggregate'
  | 'http-request'
  | 'email-send'
  | 'condition'
  | 'transform'
  | 'loop'
  | 'parallel'
  | 'wait'
  | 'webhook'
  | 'schedule'
  | 'merge'
  | 'split'
  | 'set-variable'
  | 'webhook-response';
