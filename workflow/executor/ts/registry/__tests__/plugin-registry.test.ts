/**
 * Plugin Registry Comprehensive Test Suite
 * Tests for NodeExecutorRegistry with 40+ unit tests covering:
 * - Registration operations
 * - Plugin management
 * - Cache operations
 * - Error handling
 * - Performance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  NodeExecutorRegistry,
  NodeExecutorPlugin,
  getNodeExecutorRegistry,
  setNodeExecutorRegistry,
  resetNodeExecutorRegistry,
} from '../node-executor-registry';
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '../../types';

/**
 * Mock node executor for testing
 */
class MockNodeExecutor implements INodeExecutor {
  nodeType: string;
  delay: number = 0;
  shouldFail: boolean = false;
  validationResult: ValidationResult = { valid: true, errors: [], warnings: [] };

  constructor(nodeType: string) {
    this.nodeType = nodeType;
  }

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    if (this.shouldFail) {
      return {
        status: 'error',
        error: 'Mock execution error',
        timestamp: Date.now(),
      };
    }

    return {
      status: 'success',
      output: { success: true },
      timestamp: Date.now(),
    };
  }

  validate(node: WorkflowNode): ValidationResult {
    return this.validationResult;
  }
}

/**
 * Mock plugin for testing
 */
function createMockPlugin(
  nodeType: string,
  version: string = '1.0.0',
  metadata?: any
): NodeExecutorPlugin {
  return {
    nodeType,
    version,
    executor: new MockNodeExecutor(nodeType),
    metadata: metadata || {
      description: `Mock executor for ${nodeType}`,
      category: 'test',
      author: 'test-suite',
    },
  };
}

/**
 * Mock context and state for executor tests
 */
function createMockContext(): WorkflowContext {
  return {
    executionId: 'exec-test-001',
    tenantId: 'tenant-test',
    userId: 'user-001',
    user: {
      id: 'user-001',
      email: 'test@example.com',
      level: 3,
    },
    trigger: {
      nodeId: 'trigger-node',
      kind: 'manual',
      enabled: true,
      metadata: {},
    },
    triggerData: {},
    variables: {},
    secrets: {},
  };
}

/**
 * Mock node for executor tests
 */
function createMockNode(id: string, type: string): WorkflowNode {
  return {
    id,
    name: `Node ${id}`,
    type: 'operation',
    typeVersion: 1,
    nodeType: type,
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

describe('NodeExecutorRegistry', () => {
  let registry: NodeExecutorRegistry;

  beforeEach(() => {
    registry = new NodeExecutorRegistry();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('Registration Operations', () => {
    it('should register a single executor', () => {
      const executor = new MockNodeExecutor('test-type');
      registry.register('test-type', executor);

      expect(registry.has('test-type')).toBe(true);
      expect(registry.get('test-type')).toBe(executor);
    });

    it('should register executor with plugin metadata', () => {
      const plugin = createMockPlugin('test-type', '1.0.0');
      registry.register('test-type', plugin.executor, plugin);

      const info = registry.getPluginInfo('test-type');
      expect(info).toBeDefined();
      expect(info?.version).toBe('1.0.0');
      expect(info?.metadata?.description).toContain('test-type');
    });

    it('should overwrite existing executor with warning', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      const executor1 = new MockNodeExecutor('test-type');
      const executor2 = new MockNodeExecutor('test-type');

      registry.register('test-type', executor1);
      registry.register('test-type', executor2);

      expect(registry.get('test-type')).toBe(executor2);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Overwriting existing executor for node type: test-type')
      );
    });

    it('should register multiple executors in batch', () => {
      const executors = [
        { nodeType: 'type-1', executor: new MockNodeExecutor('type-1') },
        { nodeType: 'type-2', executor: new MockNodeExecutor('type-2') },
        { nodeType: 'type-3', executor: new MockNodeExecutor('type-3') },
      ];

      registry.registerBatch(executors);

      expect(registry.listExecutors()).toHaveLength(3);
      expect(registry.has('type-1')).toBe(true);
      expect(registry.has('type-2')).toBe(true);
      expect(registry.has('type-3')).toBe(true);
    });

    it('should register batch with mixed plugin metadata', () => {
      const executors = [
        {
          nodeType: 'type-1',
          executor: new MockNodeExecutor('type-1'),
          plugin: createMockPlugin('type-1', '1.0.0'),
        },
        {
          nodeType: 'type-2',
          executor: new MockNodeExecutor('type-2'),
          // No plugin metadata
        },
      ];

      registry.registerBatch(executors);

      expect(registry.getPluginInfo('type-1')).toBeDefined();
      expect(registry.getPluginInfo('type-2')).toBeUndefined();
    });

    it('should not register empty or null values', () => {
      const executor = new MockNodeExecutor('valid-type');
      registry.register('valid-type', executor);

      expect(() => {
        registry.register('', new MockNodeExecutor('empty'));
      }).not.toThrow();

      expect(registry.has('valid-type')).toBe(true);
    });
  });

  describe('Executor Retrieval', () => {
    beforeEach(() => {
      registry.register('type-1', new MockNodeExecutor('type-1'));
      registry.register('type-2', new MockNodeExecutor('type-2'));
    });

    it('should get registered executor', () => {
      const executor = registry.get('type-1');
      expect(executor).toBeDefined();
      expect(executor?.nodeType).toBe('type-1');
    });

    it('should return undefined for unregistered type', () => {
      expect(registry.get('non-existent')).toBeUndefined();
    });

    it('should check existence with has()', () => {
      expect(registry.has('type-1')).toBe(true);
      expect(registry.has('type-99')).toBe(false);
    });

    it('should list all executors', () => {
      const executors = registry.listExecutors();
      expect(executors).toContain('type-1');
      expect(executors).toContain('type-2');
      expect(executors).toHaveLength(2);
    });

    it('should list all registered plugins', () => {
      const plugin1 = createMockPlugin('type-3', '1.0.0');
      const plugin2 = createMockPlugin('type-4', '2.0.0');

      registry.register('type-3', plugin1.executor, plugin1);
      registry.register('type-4', plugin2.executor, plugin2);

      const plugins = registry.listPlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins.map(p => p.version)).toContain('1.0.0');
      expect(plugins.map(p => p.version)).toContain('2.0.0');
    });
  });

  describe('Plugin Information', () => {
    it('should get plugin metadata', () => {
      const plugin = createMockPlugin('metadata-test', '1.5.0', {
        description: 'Test plugin',
        category: 'integration',
        icon: 'icon-url',
        author: 'test-author',
      });

      registry.register('metadata-test', plugin.executor, plugin);
      const info = registry.getPluginInfo('metadata-test');

      expect(info?.version).toBe('1.5.0');
      expect(info?.metadata?.description).toBe('Test plugin');
      expect(info?.metadata?.category).toBe('integration');
      expect(info?.metadata?.icon).toBe('icon-url');
      expect(info?.metadata?.author).toBe('test-author');
    });

    it('should return undefined for plugin info of unregistered type', () => {
      expect(registry.getPluginInfo('non-existent')).toBeUndefined();
    });

    it('should get plugin info for executor without metadata', () => {
      const executor = new MockNodeExecutor('no-metadata');
      registry.register('no-metadata', executor);

      const info = registry.getPluginInfo('no-metadata');
      expect(info).toBeUndefined();
    });
  });

  describe('Executor Execution', () => {
    let context: WorkflowContext;
    let state: ExecutionState;

    beforeEach(() => {
      context = createMockContext();
      state = {};
    });

    it('should execute registered executor', async () => {
      const executor = new MockNodeExecutor('test-exec');
      registry.register('test-exec', executor);

      const node = createMockNode('node-1', 'test-exec');
      const result = await registry.execute('test-exec', node, context, state);

      expect(result.status).toBe('success');
      expect(result.output?.success).toBe(true);
    });

    it('should throw error for unregistered executor type', async () => {
      const node = createMockNode('node-1', 'unregistered');

      await expect(
        registry.execute('unregistered', node, context, state)
      ).rejects.toThrow('No executor registered for node type: unregistered');
    });

    it('should validate node before execution', async () => {
      const executor = new MockNodeExecutor('validation-test');
      executor.validationResult = {
        valid: false,
        errors: ['Missing required parameter: url'],
        warnings: [],
      };
      registry.register('validation-test', executor);

      const node = createMockNode('node-1', 'validation-test');

      await expect(
        registry.execute('validation-test', node, context, state)
      ).rejects.toThrow('Node validation failed: Missing required parameter: url');
    });

    it('should log validation warnings', async () => {
      const warnSpy = vi.spyOn(console, 'warn');
      const executor = new MockNodeExecutor('warn-test');
      executor.validationResult = {
        valid: true,
        errors: [],
        warnings: ['Parameter timeout is not specified, using default'],
      };
      registry.register('warn-test', executor);

      const node = createMockNode('node-1', 'warn-test');
      await registry.execute('warn-test', node, context, state);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Node validation warnings'),
        expect.any(Array)
      );
    });

    it('should execute node and return result', async () => {
      const executor = new MockNodeExecutor('result-test');
      registry.register('result-test', executor);

      const node = createMockNode('node-1', 'result-test');
      const result = await registry.execute('result-test', node, context, state);

      expect(result).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.status).toBe('success');
    });

    it('should handle executor errors', async () => {
      const executor = new MockNodeExecutor('error-test');
      executor.shouldFail = true;
      registry.register('error-test', executor);

      const node = createMockNode('node-1', 'error-test');
      const result = await registry.execute('error-test', node, context, state);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Mock execution error');
    });
  });

  describe('Unregistration & Cleanup', () => {
    it('should unregister executor', () => {
      const executor = new MockNodeExecutor('unregister-test');
      registry.register('unregister-test', executor);

      expect(registry.has('unregister-test')).toBe(true);

      const success = registry.unregister('unregister-test');
      expect(success).toBe(true);
      expect(registry.has('unregister-test')).toBe(false);
    });

    it('should return false when unregistering non-existent executor', () => {
      const success = registry.unregister('non-existent');
      expect(success).toBe(false);
    });

    it('should unregister plugin metadata when removing executor', () => {
      const plugin = createMockPlugin('unregister-plugin', '1.0.0');
      registry.register('unregister-plugin', plugin.executor, plugin);

      expect(registry.getPluginInfo('unregister-plugin')).toBeDefined();

      registry.unregister('unregister-plugin');
      expect(registry.getPluginInfo('unregister-plugin')).toBeUndefined();
    });

    it('should clear all executors', () => {
      registry.register('type-1', new MockNodeExecutor('type-1'));
      registry.register('type-2', new MockNodeExecutor('type-2'));
      registry.register('type-3', new MockNodeExecutor('type-3'));

      expect(registry.listExecutors()).toHaveLength(3);

      registry.clear();
      expect(registry.listExecutors()).toHaveLength(0);
    });

    it('should clear all plugins when clearing registry', () => {
      const plugin1 = createMockPlugin('type-1', '1.0.0');
      const plugin2 = createMockPlugin('type-2', '1.0.0');

      registry.register('type-1', plugin1.executor, plugin1);
      registry.register('type-2', plugin2.executor, plugin2);

      expect(registry.listPlugins()).toHaveLength(2);

      registry.clear();
      expect(registry.listPlugins()).toHaveLength(0);
    });
  });

  describe('Global Singleton Registry', () => {
    afterEach(() => {
      resetNodeExecutorRegistry();
    });

    it('should return same registry instance', () => {
      const registry1 = getNodeExecutorRegistry();
      const registry2 = getNodeExecutorRegistry();

      expect(registry1).toBe(registry2);
    });

    it('should initialize registry on first call', () => {
      resetNodeExecutorRegistry();
      const registry = getNodeExecutorRegistry();

      expect(registry).toBeInstanceOf(NodeExecutorRegistry);
    });

    it('should allow setting custom registry', () => {
      const customRegistry = new NodeExecutorRegistry();
      customRegistry.register('custom', new MockNodeExecutor('custom'));

      setNodeExecutorRegistry(customRegistry);
      const retrieved = getNodeExecutorRegistry();

      expect(retrieved).toBe(customRegistry);
      expect(retrieved.has('custom')).toBe(true);
    });

    it('should reset global registry', () => {
      const registry1 = getNodeExecutorRegistry();
      registry1.register('test', new MockNodeExecutor('test'));

      resetNodeExecutorRegistry();
      const registry2 = getNodeExecutorRegistry();

      expect(registry1).not.toBe(registry2);
      expect(registry2.has('test')).toBe(false);
    });
  });

  describe('Performance & Stress Tests', () => {
    it('should handle registering many executors', () => {
      const count = 1000;

      for (let i = 0; i < count; i++) {
        registry.register(`executor-${i}`, new MockNodeExecutor(`executor-${i}`));
      }

      expect(registry.listExecutors()).toHaveLength(count);
    });

    it('should retrieve executors quickly from large registry', () => {
      const count = 500;
      for (let i = 0; i < count; i++) {
        registry.register(`executor-${i}`, new MockNodeExecutor(`executor-${i}`));
      }

      const startTime = performance.now();
      for (let i = 0; i < count; i++) {
        registry.get(`executor-${i}`);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in <100ms
    });

    it('should batch register large number of executors efficiently', () => {
      const executors = Array.from({ length: 500 }, (_, i) => ({
        nodeType: `executor-${i}`,
        executor: new MockNodeExecutor(`executor-${i}`),
      }));

      const startTime = performance.now();
      registry.registerBatch(executors);
      const endTime = performance.now();

      expect(registry.listExecutors()).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(500); // Should complete quickly
    });

    it('should handle concurrent registry operations', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve().then(() => {
          const executor = new MockNodeExecutor(`concurrent-${i}`);
          registry.register(`concurrent-${i}`, executor);
          return registry.get(`concurrent-${i}`);
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
      expect(registry.listExecutors()).toHaveLength(100);
    });

    it('should execute multiple nodes concurrently', async () => {
      const context = createMockContext();
      const state = {};

      for (let i = 0; i < 10; i++) {
        registry.register(`type-${i}`, new MockNodeExecutor(`type-${i}`));
      }

      const promises = Array.from({ length: 10 }, (_, i) =>
        registry.execute(`type-${i}`, createMockNode(`node-${i}`, `type-${i}`), context, state)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      expect(results.every(r => r.status === 'success')).toBe(true);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle undefined executor gracefully', () => {
      expect(() => {
        registry.get('undefined-type');
      }).not.toThrow();
    });

    it('should handle empty executor list gracefully', () => {
      expect(registry.listExecutors()).toEqual([]);
      expect(registry.listPlugins()).toEqual([]);
    });

    it('should handle special characters in node type names', () => {
      const specialTypes = [
        'type-with-dashes',
        'type_with_underscores',
        'type.with.dots',
        'type:with:colons',
      ];

      specialTypes.forEach(type => {
        const executor = new MockNodeExecutor(type);
        registry.register(type, executor);
        expect(registry.has(type)).toBe(true);
      });
    });

    it('should handle executor with no parameters', async () => {
      const executor = new MockNodeExecutor('no-params');
      registry.register('no-params', executor);

      const node = createMockNode('node-1', 'no-params');
      const result = await registry.execute('no-params', node, createMockContext(), {});

      expect(result.status).toBe('success');
    });

    it('should handle executor exceptions', async () => {
      class FailingExecutor implements INodeExecutor {
        nodeType = 'failing';

        async execute(): Promise<NodeResult> {
          throw new Error('Executor crashed');
        }

        validate(): ValidationResult {
          return { valid: true, errors: [], warnings: [] };
        }
      }

      registry.register('failing', new FailingExecutor());

      const node = createMockNode('node-1', 'failing');
      await expect(
        registry.execute('failing', node, createMockContext(), {})
      ).rejects.toThrow('Executor crashed');
    });
  });

  describe('Registry State Isolation', () => {
    it('should isolate state between different registry instances', () => {
      const registry1 = new NodeExecutorRegistry();
      const registry2 = new NodeExecutorRegistry();

      registry1.register('type-1', new MockNodeExecutor('type-1'));

      expect(registry1.has('type-1')).toBe(true);
      expect(registry2.has('type-1')).toBe(false);
    });

    it('should not affect other instances when clearing', () => {
      const registry1 = new NodeExecutorRegistry();
      const registry2 = new NodeExecutorRegistry();

      registry1.register('type-1', new MockNodeExecutor('type-1'));
      registry2.register('type-2', new MockNodeExecutor('type-2'));

      registry1.clear();

      expect(registry1.listExecutors()).toHaveLength(0);
      expect(registry2.has('type-2')).toBe(true);
    });
  });
});
