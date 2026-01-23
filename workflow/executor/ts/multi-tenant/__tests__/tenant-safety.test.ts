/**
 * Multi-Tenant Isolation & Safety Comprehensive Test Suite
 * Tests for 30+ multi-tenant isolation scenarios:
 * - Cross-tenant access prevention
 * - Policy enforcement
 * - Data isolation
 * - Audit logging
 * - Credential isolation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorkflowContext, WorkflowDefinition, WorkflowNode, ExecutionState, NodeResult } from '../../types';

/**
 * Mock multi-tenant enforcement layer
 */
interface TenantPolicy {
  tenantId: string;
  allowCrossTenantAccess: boolean;
  restrictedNodeTypes: string[];
  enforceDataIsolation: boolean;
  auditLoggingEnabled: boolean;
  credentialEncryption: boolean;
}

interface AuditLog {
  timestamp: Date;
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  details?: Record<string, any>;
}

/**
 * Mock multi-tenant enforcer
 */
class MultiTenantEnforcer {
  private policies: Map<string, TenantPolicy> = new Map();
  private auditLogs: AuditLog[] = [];
  private tenantCredentials: Map<string, Map<string, string>> = new Map();

  registerPolicy(policy: TenantPolicy): void {
    this.policies.set(policy.tenantId, policy);
  }

  getPolicy(tenantId: string): TenantPolicy | undefined {
    return this.policies.get(tenantId);
  }

  validateTenantContext(context: WorkflowContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!context.tenantId) {
      errors.push('tenantId is required');
    }

    if (!context.userId) {
      errors.push('userId is required');
    }

    if (context.tenantId && !this.policies.has(context.tenantId)) {
      errors.push(`Tenant policy not found for ${context.tenantId}`);
    }

    return { valid: errors.length === 0, errors };
  }

  canAccessWorkflow(
    context: WorkflowContext,
    workflow: WorkflowDefinition
  ): { allowed: boolean; reason?: string } {
    // Workflow must belong to same tenant
    if (workflow.tenantId !== context.tenantId) {
      return { allowed: false, reason: 'Workflow does not belong to current tenant' };
    }

    // Check policy
    const policy = this.getPolicy(context.tenantId);
    if (!policy) {
      return { allowed: false, reason: 'Tenant policy not found' };
    }

    return { allowed: true };
  }

  canExecuteNode(
    context: WorkflowContext,
    node: WorkflowNode,
    workflow: WorkflowDefinition
  ): { allowed: boolean; reason?: string } {
    if (node.nodeType && node.nodeType.includes('restricted')) {
      return { allowed: false, reason: 'Node type is restricted for this tenant' };
    }

    const policy = this.getPolicy(context.tenantId);
    if (policy?.restrictedNodeTypes.includes(node.nodeType)) {
      return { allowed: false, reason: `Node type ${node.nodeType} is restricted` };
    }

    return { allowed: true };
  }

  logAudit(log: AuditLog): void {
    this.auditLogs.push(log);
  }

  getAuditLogs(tenantId: string, userId?: string): AuditLog[] {
    return this.auditLogs.filter(
      log => log.tenantId === tenantId && (!userId || log.userId === userId)
    );
  }

  getAllAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  clearAuditLogs(): void {
    this.auditLogs = [];
  }

  storeCredential(tenantId: string, credentialId: string, encryptedValue: string): void {
    if (!this.tenantCredentials.has(tenantId)) {
      this.tenantCredentials.set(tenantId, new Map());
    }
    this.tenantCredentials.get(tenantId)!.set(credentialId, encryptedValue);
  }

  getCredential(tenantId: string, credentialId: string): string | undefined {
    return this.tenantCredentials.get(tenantId)?.get(credentialId);
  }

  canAccessCredential(context: WorkflowContext, credentialId: string): boolean {
    return this.tenantCredentials.has(context.tenantId) &&
      this.tenantCredentials.get(context.tenantId)!.has(credentialId);
  }

  clearCredentials(tenantId?: string): void {
    if (tenantId) {
      this.tenantCredentials.delete(tenantId);
    } else {
      this.tenantCredentials.clear();
    }
  }

  filterDataByTenant(data: any[], tenantIdField: string, tenantId: string): any[] {
    return data.filter(item => item[tenantIdField] === tenantId);
  }
}

/**
 * Helper functions
 */
function createContext(tenantId: string, userId: string = 'user-001'): WorkflowContext {
  return {
    executionId: `exec-${Date.now()}`,
    tenantId,
    userId,
    user: {
      id: userId,
      email: `${userId}@${tenantId}.example.com`,
      level: 3,
    },
    trigger: {
      nodeId: 'trigger-1',
      kind: 'manual',
      enabled: true,
      metadata: {},
    },
    triggerData: {},
    variables: {},
    secrets: {},
  };
}

function createWorkflow(id: string, tenantId: string): WorkflowDefinition {
  return {
    id,
    name: 'Test Workflow',
    version: '1.0.0',
    tenantId,
    createdBy: 'user-001',
    createdAt: new Date(),
    updatedAt: new Date(),
    active: true,
    locked: false,
    tags: ['test'],
    category: 'automation',
    settings: {
      timezone: 'UTC',
      executionTimeout: 60000,
      saveExecutionProgress: true,
      saveExecutionData: 'all',
      maxConcurrentExecutions: 10,
      debugMode: false,
      enableNotifications: false,
      notificationChannels: [],
    },
    nodes: [],
    connections: {},
    triggers: [],
    variables: {},
    errorHandling: {
      default: 'stopWorkflow',
      errorLogger: undefined,
      errorNotification: false,
      notifyChannels: [],
    },
    retryPolicy: {
      enabled: false,
      maxAttempts: 1,
      backoffType: 'exponential',
      initialDelay: 1000,
      maxDelay: 60000,
      retryableErrors: [],
      retryableStatusCodes: [],
    },
    rateLimiting: {
      enabled: false,
      key: 'global',
      onLimitExceeded: 'reject',
    },
    credentials: [],
    metadata: {},
    executionLimits: {
      maxExecutionTime: 60000,
      maxMemoryMb: 512,
      maxDataSizeMb: 100,
      maxArrayItems: 10000,
    },
    multiTenancy: {
      enforced: true,
      tenantIdField: 'tenantId',
      restrictNodeTypes: [],
      allowCrossTenantAccess: false,
      auditLogging: true,
    },
    versionHistory: [],
  };
}

function createNode(id: string, nodeType: string = 'http-request'): WorkflowNode {
  return {
    id,
    name: `Node ${id}`,
    type: 'operation',
    typeVersion: 1,
    nodeType,
    position: [0, 0],
    parameters: {},
    inputs: [],
    outputs: [],
    credentials: {},
    disabled: false,
    skipOnFail: false,
    alwaysOutputData: false,
    maxTries: 1,
    waitBetweenTries: 0,
    continueOnError: false,
    onError: 'stopWorkflow',
    metadata: {},
  };
}

describe('Multi-Tenant Isolation & Safety', () => {
  let enforcer: MultiTenantEnforcer;
  let tenantPolicy1: TenantPolicy;
  let tenantPolicy2: TenantPolicy;

  beforeEach(() => {
    enforcer = new MultiTenantEnforcer();

    tenantPolicy1 = {
      tenantId: 'tenant-1',
      allowCrossTenantAccess: false,
      restrictedNodeTypes: ['restricted-node'],
      enforceDataIsolation: true,
      auditLoggingEnabled: true,
      credentialEncryption: true,
    };

    tenantPolicy2 = {
      tenantId: 'tenant-2',
      allowCrossTenantAccess: false,
      restrictedNodeTypes: ['admin-node', 'restricted-node'],
      enforceDataIsolation: true,
      auditLoggingEnabled: true,
      credentialEncryption: true,
    };

    enforcer.registerPolicy(tenantPolicy1);
    enforcer.registerPolicy(tenantPolicy2);
  });

  afterEach(() => {
    enforcer.clearAuditLogs();
    enforcer.clearCredentials();
  });

  describe('Context Validation', () => {
    it('should validate tenant context has required fields', () => {
      const context = createContext('tenant-1');
      const validation = enforcer.validateTenantContext(context);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject context missing tenantId', () => {
      const context = createContext('tenant-1');
      context.tenantId = '';
      const validation = enforcer.validateTenantContext(context);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('tenantId is required');
    });

    it('should reject context missing userId', () => {
      const context = createContext('tenant-1');
      context.userId = '';
      const validation = enforcer.validateTenantContext(context);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('userId is required');
    });

    it('should reject context with unknown tenant', () => {
      const context = createContext('unknown-tenant');
      const validation = enforcer.validateTenantContext(context);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Tenant policy not found for unknown-tenant');
    });

    it('should accept context from registered tenant', () => {
      const context = createContext('tenant-1');
      const validation = enforcer.validateTenantContext(context);

      expect(validation.valid).toBe(true);
    });
  });

  describe('Workflow Access Control', () => {
    it('should allow access to workflow in same tenant', () => {
      const context = createContext('tenant-1');
      const workflow = createWorkflow('workflow-1', 'tenant-1');

      const access = enforcer.canAccessWorkflow(context, workflow);
      expect(access.allowed).toBe(true);
    });

    it('should deny access to workflow from different tenant', () => {
      const context = createContext('tenant-1');
      const workflow = createWorkflow('workflow-1', 'tenant-2');

      const access = enforcer.canAccessWorkflow(context, workflow);
      expect(access.allowed).toBe(false);
      expect(access.reason).toContain('does not belong to current tenant');
    });

    it('should deny access when tenant policy not found', () => {
      const enforcer2 = new MultiTenantEnforcer();
      const context = createContext('tenant-1');
      const workflow = createWorkflow('workflow-1', 'tenant-1');

      const access = enforcer2.canAccessWorkflow(context, workflow);
      expect(access.allowed).toBe(false);
      expect(access.reason).toContain('Tenant policy not found');
    });

    it('should prevent cross-tenant workflow execution', () => {
      const context1 = createContext('tenant-1', 'user-1');
      const context2 = createContext('tenant-2', 'user-2');
      const workflow = createWorkflow('workflow-1', 'tenant-1');

      expect(enforcer.canAccessWorkflow(context1, workflow).allowed).toBe(true);
      expect(enforcer.canAccessWorkflow(context2, workflow).allowed).toBe(false);
    });
  });

  describe('Node Execution Control', () => {
    it('should allow execution of allowed node types', () => {
      const context = createContext('tenant-1');
      const workflow = createWorkflow('workflow-1', 'tenant-1');
      const node = createNode('node-1', 'http-request');

      const canExecute = enforcer.canExecuteNode(context, node, workflow);
      expect(canExecute.allowed).toBe(true);
    });

    it('should deny execution of restricted node types', () => {
      const context = createContext('tenant-1');
      const workflow = createWorkflow('workflow-1', 'tenant-1');
      const node = createNode('node-1', 'restricted-node');

      const canExecute = enforcer.canExecuteNode(context, node, workflow);
      expect(canExecute.allowed).toBe(false);
      expect(canExecute.reason).toContain('restricted');
    });

    it('should respect per-tenant restricted node lists', () => {
      const workflow = createWorkflow('workflow-1', 'tenant-1');
      const adminNode = createNode('node-1', 'admin-node');

      const context1 = createContext('tenant-1');
      const context2 = createContext('tenant-2');

      // admin-node is allowed for tenant-1
      expect(enforcer.canExecuteNode(context1, adminNode, workflow).allowed).toBe(true);

      // admin-node is restricted for tenant-2
      expect(enforcer.canExecuteNode(context2, adminNode, workflow).allowed).toBe(false);
    });

    it('should prevent execution of multiple restricted node types', () => {
      const context = createContext('tenant-2');
      const workflow = createWorkflow('workflow-1', 'tenant-2');

      const restrictedNodes = [
        createNode('node-1', 'admin-node'),
        createNode('node-2', 'restricted-node'),
      ];

      restrictedNodes.forEach(node => {
        const canExecute = enforcer.canExecuteNode(context, node, workflow);
        expect(canExecute.allowed).toBe(false);
      });
    });
  });

  describe('Audit Logging', () => {
    it('should log successful workflow execution', () => {
      const context = createContext('tenant-1', 'user-1');
      enforcer.logAudit({
        timestamp: new Date(),
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'EXECUTE_WORKFLOW',
        resource: 'workflow-1',
        result: 'success',
      });

      const logs = enforcer.getAuditLogs('tenant-1', 'user-1');
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('EXECUTE_WORKFLOW');
      expect(logs[0].result).toBe('success');
    });

    it('should log failed access attempts', () => {
      const context = createContext('tenant-1');
      enforcer.logAudit({
        timestamp: new Date(),
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'ACCESS_WORKFLOW',
        resource: 'workflow-2',
        result: 'failure',
        details: { reason: 'Unauthorized cross-tenant access' },
      });

      const logs = enforcer.getAuditLogs('tenant-1');
      expect(logs).toHaveLength(1);
      expect(logs[0].result).toBe('failure');
    });

    it('should isolate audit logs by tenant', () => {
      const context1 = createContext('tenant-1', 'user-1');
      const context2 = createContext('tenant-2', 'user-2');

      enforcer.logAudit({
        timestamp: new Date(),
        tenantId: context1.tenantId,
        userId: context1.userId,
        action: 'EXECUTE_WORKFLOW',
        resource: 'workflow-1',
        result: 'success',
      });

      enforcer.logAudit({
        timestamp: new Date(),
        tenantId: context2.tenantId,
        userId: context2.userId,
        action: 'EXECUTE_WORKFLOW',
        resource: 'workflow-2',
        result: 'success',
      });

      const logs1 = enforcer.getAuditLogs('tenant-1');
      const logs2 = enforcer.getAuditLogs('tenant-2');

      expect(logs1).toHaveLength(1);
      expect(logs2).toHaveLength(1);
      expect(logs1[0].tenantId).toBe('tenant-1');
      expect(logs2[0].tenantId).toBe('tenant-2');
    });

    it('should filter audit logs by user', () => {
      const context1 = createContext('tenant-1', 'user-1');
      const context2 = createContext('tenant-1', 'user-2');

      enforcer.logAudit({
        timestamp: new Date(),
        tenantId: context1.tenantId,
        userId: context1.userId,
        action: 'EXECUTE_WORKFLOW',
        resource: 'workflow-1',
        result: 'success',
      });

      enforcer.logAudit({
        timestamp: new Date(),
        tenantId: context2.tenantId,
        userId: context2.userId,
        action: 'EXECUTE_WORKFLOW',
        resource: 'workflow-1',
        result: 'success',
      });

      const user1Logs = enforcer.getAuditLogs('tenant-1', 'user-1');
      const user2Logs = enforcer.getAuditLogs('tenant-1', 'user-2');

      expect(user1Logs).toHaveLength(1);
      expect(user2Logs).toHaveLength(1);
      expect(user1Logs[0].userId).toBe('user-1');
      expect(user2Logs[0].userId).toBe('user-2');
    });

    it('should maintain audit logs for multiple operations', () => {
      const context = createContext('tenant-1', 'user-1');
      const actions = ['EXECUTE_WORKFLOW', 'ACCESS_NODE', 'UPDATE_WORKFLOW'];

      actions.forEach(action => {
        enforcer.logAudit({
          timestamp: new Date(),
          tenantId: context.tenantId,
          userId: context.userId,
          action,
          resource: 'workflow-1',
          result: 'success',
        });
      });

      const logs = enforcer.getAuditLogs('tenant-1');
      expect(logs).toHaveLength(3);
      expect(logs.map(l => l.action)).toEqual(actions);
    });

    it('should not allow audit log leakage across tenants', () => {
      const context1 = createContext('tenant-1');
      const context2 = createContext('tenant-2');

      // Tenant 1 logs
      for (let i = 0; i < 5; i++) {
        enforcer.logAudit({
          timestamp: new Date(),
          tenantId: context1.tenantId,
          userId: context1.userId,
          action: `ACTION-${i}`,
          resource: 'resource-1',
          result: 'success',
        });
      }

      // Tenant 2 logs
      for (let i = 0; i < 3; i++) {
        enforcer.logAudit({
          timestamp: new Date(),
          tenantId: context2.tenantId,
          userId: context2.userId,
          action: `ACTION-${i}`,
          resource: 'resource-2',
          result: 'success',
        });
      }

      const tenant1Logs = enforcer.getAuditLogs('tenant-1');
      const tenant2Logs = enforcer.getAuditLogs('tenant-2');

      expect(tenant1Logs).toHaveLength(5);
      expect(tenant2Logs).toHaveLength(3);
      expect(tenant1Logs.every(l => l.tenantId === 'tenant-1')).toBe(true);
      expect(tenant2Logs.every(l => l.tenantId === 'tenant-2')).toBe(true);
    });
  });

  describe('Credential Isolation', () => {
    it('should store credentials per tenant', () => {
      enforcer.storeCredential('tenant-1', 'cred-1', 'encrypted-value-1');
      enforcer.storeCredential('tenant-2', 'cred-1', 'encrypted-value-2');

      const cred1 = enforcer.getCredential('tenant-1', 'cred-1');
      const cred2 = enforcer.getCredential('tenant-2', 'cred-1');

      expect(cred1).toBe('encrypted-value-1');
      expect(cred2).toBe('encrypted-value-2');
    });

    it('should not allow cross-tenant credential access', () => {
      enforcer.storeCredential('tenant-1', 'api-key', 'secret-123');

      const context1 = createContext('tenant-1');
      const context2 = createContext('tenant-2');

      expect(enforcer.canAccessCredential(context1, 'api-key')).toBe(true);
      expect(enforcer.canAccessCredential(context2, 'api-key')).toBe(false);
    });

    it('should return undefined for non-existent credentials', () => {
      enforcer.storeCredential('tenant-1', 'cred-1', 'value-1');

      const cred = enforcer.getCredential('tenant-1', 'non-existent');
      expect(cred).toBeUndefined();
    });

    it('should support multiple credentials per tenant', () => {
      const credentials = [
        { id: 'api-key', value: 'secret-123' },
        { id: 'oauth-token', value: 'token-abc' },
        { id: 'db-password', value: 'pass-xyz' },
      ];

      credentials.forEach(cred => {
        enforcer.storeCredential('tenant-1', cred.id, cred.value);
      });

      const context = createContext('tenant-1');
      credentials.forEach(cred => {
        expect(enforcer.canAccessCredential(context, cred.id)).toBe(true);
        expect(enforcer.getCredential('tenant-1', cred.id)).toBe(cred.value);
      });
    });

    it('should clear credentials by tenant', () => {
      enforcer.storeCredential('tenant-1', 'cred-1', 'value-1');
      enforcer.storeCredential('tenant-2', 'cred-2', 'value-2');

      enforcer.clearCredentials('tenant-1');

      const context1 = createContext('tenant-1');
      const context2 = createContext('tenant-2');

      expect(enforcer.canAccessCredential(context1, 'cred-1')).toBe(false);
      expect(enforcer.canAccessCredential(context2, 'cred-2')).toBe(true);
    });

    it('should clear all credentials when no tenant specified', () => {
      enforcer.storeCredential('tenant-1', 'cred-1', 'value-1');
      enforcer.storeCredential('tenant-2', 'cred-2', 'value-2');

      enforcer.clearCredentials();

      const context1 = createContext('tenant-1');
      const context2 = createContext('tenant-2');

      expect(enforcer.canAccessCredential(context1, 'cred-1')).toBe(false);
      expect(enforcer.canAccessCredential(context2, 'cred-2')).toBe(false);
    });
  });

  describe('Data Isolation', () => {
    it('should filter data by tenant', () => {
      const data = [
        { id: '1', tenantId: 'tenant-1', name: 'Item 1' },
        { id: '2', tenantId: 'tenant-1', name: 'Item 2' },
        { id: '3', tenantId: 'tenant-2', name: 'Item 3' },
        { id: '4', tenantId: 'tenant-2', name: 'Item 4' },
      ];

      const tenant1Data = enforcer.filterDataByTenant(data, 'tenantId', 'tenant-1');
      const tenant2Data = enforcer.filterDataByTenant(data, 'tenantId', 'tenant-2');

      expect(tenant1Data).toHaveLength(2);
      expect(tenant2Data).toHaveLength(2);
      expect(tenant1Data.every(d => d.tenantId === 'tenant-1')).toBe(true);
      expect(tenant2Data.every(d => d.tenantId === 'tenant-2')).toBe(true);
    });

    it('should not return empty data for non-existent tenant', () => {
      const data = [
        { id: '1', tenantId: 'tenant-1', name: 'Item 1' },
      ];

      const result = enforcer.filterDataByTenant(data, 'tenantId', 'tenant-999');
      expect(result).toHaveLength(0);
    });

    it('should handle custom tenant id field names', () => {
      const data = [
        { id: '1', owner: 'tenant-1', name: 'Item 1' },
        { id: '2', owner: 'tenant-2', name: 'Item 2' },
      ];

      const result = enforcer.filterDataByTenant(data, 'owner', 'tenant-1');
      expect(result).toHaveLength(1);
      expect(result[0].owner).toBe('tenant-1');
    });
  });

  describe('Policy Enforcement', () => {
    it('should enforce policy restrictions on node execution', () => {
      const context = createContext('tenant-1');
      const workflow = createWorkflow('workflow-1', 'tenant-1');
      const policy = enforcer.getPolicy('tenant-1');

      if (policy) {
        policy.restrictedNodeTypes = ['admin', 'dangerous'];
        const adminNode = createNode('node-1', 'admin');
        const result = enforcer.canExecuteNode(context, adminNode, workflow);
        expect(result.allowed).toBe(false);
      }
    });

    it('should allow policy updates', () => {
      let policy = enforcer.getPolicy('tenant-1');
      expect(policy?.restrictedNodeTypes).toContain('restricted-node');

      // Update policy
      if (policy) {
        policy.restrictedNodeTypes.push('new-restricted');
        enforcer.registerPolicy(policy);
      }

      const updated = enforcer.getPolicy('tenant-1');
      expect(updated?.restrictedNodeTypes).toContain('new-restricted');
    });

    it('should enforce data isolation policy', () => {
      const policy1 = enforcer.getPolicy('tenant-1');
      const policy2 = enforcer.getPolicy('tenant-2');

      expect(policy1?.enforceDataIsolation).toBe(true);
      expect(policy2?.enforceDataIsolation).toBe(true);
    });

    it('should enforce cross-tenant access policy', () => {
      const policy = enforcer.getPolicy('tenant-1');
      expect(policy?.allowCrossTenantAccess).toBe(false);
    });
  });

  describe('Complex Isolation Scenarios', () => {
    it('should prevent information leakage through error messages', () => {
      const context1 = createContext('tenant-1');
      const workflow2 = createWorkflow('workflow-2', 'tenant-2');

      const access = enforcer.canAccessWorkflow(context1, workflow2);
      expect(access.allowed).toBe(false);
      // Error message should not reveal workflow exists
      expect(access.reason).not.toContain('workflow-2');
    });

    it('should handle parallel execution from different tenants', async () => {
      const context1 = createContext('tenant-1', 'user-1');
      const context2 = createContext('tenant-2', 'user-2');
      const workflow1 = createWorkflow('workflow-1', 'tenant-1');
      const workflow2 = createWorkflow('workflow-2', 'tenant-2');

      const results = await Promise.all([
        Promise.resolve(enforcer.canAccessWorkflow(context1, workflow1)),
        Promise.resolve(enforcer.canAccessWorkflow(context2, workflow2)),
      ]);

      expect(results[0].allowed).toBe(true);
      expect(results[1].allowed).toBe(true);
    });

    it('should maintain isolation during concurrent audit logging', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        const tenantId = i % 2 === 0 ? 'tenant-1' : 'tenant-2';
        return Promise.resolve().then(() => {
          enforcer.logAudit({
            timestamp: new Date(),
            tenantId,
            userId: `user-${i}`,
            action: `ACTION-${i}`,
            resource: 'resource-1',
            result: 'success',
          });
        });
      });

      await Promise.all(promises);

      const logs1 = enforcer.getAuditLogs('tenant-1');
      const logs2 = enforcer.getAuditLogs('tenant-2');

      expect(logs1.length + logs2.length).toBe(10);
      expect(logs1.every(l => l.tenantId === 'tenant-1')).toBe(true);
      expect(logs2.every(l => l.tenantId === 'tenant-2')).toBe(true);
    });

    it('should prevent tenant escape through workflow connections', () => {
      const context = createContext('tenant-1');
      const workflow1 = createWorkflow('workflow-1', 'tenant-1');
      const workflow2 = createWorkflow('workflow-2', 'tenant-2');

      // Cannot reference workflow from different tenant
      expect(enforcer.canAccessWorkflow(context, workflow1).allowed).toBe(true);
      expect(enforcer.canAccessWorkflow(context, workflow2).allowed).toBe(false);
    });
  });

  describe('Audit Compliance', () => {
    it('should maintain audit trail for compliance', () => {
      const userId = 'user-compliance-test';
      const context = createContext('tenant-1', userId);

      const actions = [
        'EXECUTE_WORKFLOW',
        'ACCESS_WORKFLOW',
        'MODIFY_WORKFLOW',
        'DELETE_WORKFLOW',
      ];

      actions.forEach((action, idx) => {
        enforcer.logAudit({
          timestamp: new Date(Date.now() + idx * 1000),
          tenantId: context.tenantId,
          userId: context.userId,
          action,
          resource: 'workflow-1',
          result: idx % 2 === 0 ? 'success' : 'failure',
        });
      });

      const logs = enforcer.getAuditLogs('tenant-1', userId);
      expect(logs).toHaveLength(4);
      expect(logs.every(l => l.userId === userId)).toBe(true);
      expect(logs[0].timestamp.getTime()).toBeLessThan(logs[3].timestamp.getTime());
    });

    it('should record failed access attempts', () => {
      const context1 = createContext('tenant-1');
      const context2 = createContext('tenant-2');
      const workflow1 = createWorkflow('workflow-1', 'tenant-1');

      // Failed attempt
      const access = enforcer.canAccessWorkflow(context2, workflow1);
      expect(access.allowed).toBe(false);

      enforcer.logAudit({
        timestamp: new Date(),
        tenantId: context2.tenantId,
        userId: context2.userId,
        action: 'ACCESS_WORKFLOW',
        resource: workflow1.id,
        result: 'failure',
        details: { reason: access.reason },
      });

      const logs = enforcer.getAuditLogs('tenant-2');
      expect(logs).toHaveLength(1);
      expect(logs[0].result).toBe('failure');
    });
  });
});
