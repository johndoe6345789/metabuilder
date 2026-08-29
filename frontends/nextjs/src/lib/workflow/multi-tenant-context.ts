/**
 * Multi-Tenant Workflow Context Builder
 *
 * Constructs safe execution contexts with tenant isolation, user access
 * verification, request-derived initialisation, credential binding and
 * error reporting.
 *
 * The rules themselves live in ./context, one module each, so every one
 * of them can be read and tested without standing up a builder. This file
 * is the order they run in.
 */

import { v4 as uuidv4 } from 'uuid'
import type { WorkflowDefinition, WorkflowTrigger } from '@metabuilder/workflow'
import type {
  ContextBuilderOptions,
  ContextRequestData,
  ContextValidationResult,
  ExtendedWorkflowContext,
  RequestContext,
} from './context/context-types'
import { logContextCreation } from './context/context-audit'
import { assertContextSafe } from './context/context-safety'
import {
  buildVariables,
  stripCrossTenantVariables,
} from './context/context-variables'
import { validateContext } from './context/context-validation'
import { bindCredentials } from './context/credential-binding'
import { buildDefaultTrigger } from './context/default-trigger'
import { buildMultiTenantMetadata } from './context/context-metadata'
import { defaultExecutionLimits } from './context/execution-limits'
import { checkTenantAccess } from './context/tenant-access'

export { canUserAccessWorkflow } from './context/context-access'
export { sanitizeContextForLogging } from './context/context-logging'
export {
  bearerToken,
  extractRequestContext,
  toWorkflowLevel,
} from './context/request-context'
export { createMockContext } from './context/mock-context'
export { determineExecutionMode } from './context/execution-mode'
export * from './context/context-types'

const DEFAULT_OPTIONS: ContextBuilderOptions = {
  allowCrossTenantAccess: false,
  enforceCredentialValidation: true,
  enforceSecretEncryption: true,
  captureRequestData: true,
  enableAuditLogging: true,
}

/**
 * Builds and validates workflow execution contexts with strict tenant
 * isolation.
 */
export class MultiTenantContextBuilder {
  private readonly workflow: WorkflowDefinition
  private readonly requestContext: RequestContext
  private readonly options: ContextBuilderOptions

  constructor(
    workflow: WorkflowDefinition,
    requestContext: RequestContext,
    options: ContextBuilderOptions = {}
  ) {
    this.workflow = workflow
    this.requestContext = requestContext
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /** The context this request may run under, or a throw explaining why not. */
  async build(
    requestData?: ContextRequestData,
    trigger?: WorkflowTrigger
  ): Promise<ExtendedWorkflowContext> {
    this.assertTenantAccess()
    const context = this.assemble(requestData, trigger)

    assertContextSafe(context, this.workflow, this.options)
    if (this.options.enforceCredentialValidation === true) {
      context.credentialBindings = bindCredentials(this.workflow)
    }
    stripCrossTenantVariables(context.variables, context.tenantId)
    if (this.options.enableAuditLogging === true) {
      logContextCreation(context, this.workflow.id)
    }
    return context
  }

  /** Every problem with this request, without building anything. */
  validate(): ContextValidationResult {
    return validateContext(this.workflow, this.requestContext, this.options)
  }

  private assertTenantAccess(): void {
    const outcome = checkTenantAccess(
      this.workflow,
      this.requestContext,
      this.options
    )
    if (!outcome.allowed) throw new Error(outcome.reason)
    if (outcome.crossTenant) {
      console.warn(
        `[SECURITY] Super-admin ${this.requestContext.userId} accessing ` +
          `cross-tenant workflow ${this.workflow.id}`
      )
    }
  }

  private assemble(
    requestData?: ContextRequestData,
    trigger?: WorkflowTrigger
  ): ExtendedWorkflowContext {
    const request = this.requestContext
    return {
      executionId: uuidv4(),
      tenantId: request.tenantId,
      userId: request.userId,
      user: {
        id: request.userId,
        email: request.userEmail,
        level: request.userLevel,
      },
      trigger: trigger ?? buildDefaultTrigger(this.workflow, request),
      triggerData: requestData?.triggerData ?? {},
      variables: buildVariables(this.workflow, request, requestData?.variables),
      secrets: requestData?.secrets ?? {},
      request:
        this.options.captureRequestData === true
          ? (requestData?.request as ExtendedWorkflowContext['request'])
          : undefined,
      multiTenant: buildMultiTenantMetadata(request, trigger),
      requestMetadata: {
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        originUrl: request.originUrl,
        sessionId: request.sessionId,
      },
      executionLimits:
        this.workflow.executionLimits ?? defaultExecutionLimits(),
      credentialBindings: new Map(),
    }
  }
}

/** Build a context straight from a verified request. */
export async function createContextFromRequest(
  workflow: WorkflowDefinition,
  requestContext: RequestContext,
  requestData?: ContextRequestData,
  options?: ContextBuilderOptions
): Promise<ExtendedWorkflowContext> {
  return new MultiTenantContextBuilder(
    workflow,
    requestContext,
    options
  ).build(requestData)
}
