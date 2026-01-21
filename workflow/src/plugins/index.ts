/**
 * Built-in Node Executors for MetaBuilder Workflow Engine
 * Includes data operations, HTTP, email, control flow, and utilities
 */

export { dbalReadExecutor } from './dbal-read.plugin';
export { dbalWriteExecutor } from './dbal-write.plugin';
export { httpRequestExecutor } from './http-request.plugin';
export { conditionExecutor } from './condition.plugin';
export { emailSendExecutor, setEmailService } from './email-send.plugin';
export { webhookResponseExecutor } from './webhook-response.plugin';
export { transformExecutor } from './transform.plugin';
export { waitExecutor } from './wait.plugin';
export { setVariableExecutor } from './set-variable.plugin';

/**
 * Import all executors for batch registration
 */
import { dbalReadExecutor } from './dbal-read.plugin';
import { dbalWriteExecutor } from './dbal-write.plugin';
import { httpRequestExecutor } from './http-request.plugin';
import { conditionExecutor } from './condition.plugin';
import { emailSendExecutor } from './email-send.plugin';
import { webhookResponseExecutor } from './webhook-response.plugin';
import { transformExecutor } from './transform.plugin';
import { waitExecutor } from './wait.plugin';
import { setVariableExecutor } from './set-variable.plugin';
import { getNodeExecutorRegistry } from '../registry/node-executor-registry';

/**
 * Register all built-in executors
 */
export function registerBuiltInExecutors() {
  const registry = getNodeExecutorRegistry();

  registry.registerBatch([
    {
      nodeType: 'dbal-read',
      executor: dbalReadExecutor,
      plugin: {
        nodeType: 'dbal-read',
        version: '1.0.0',
        executor: dbalReadExecutor,
        metadata: {
          description: 'Read data from database with filtering, sorting, and pagination',
          category: 'data',
          icon: 'database'
        }
      }
    },
    {
      nodeType: 'dbal-write',
      executor: dbalWriteExecutor,
      plugin: {
        nodeType: 'dbal-write',
        version: '1.0.0',
        executor: dbalWriteExecutor,
        metadata: {
          description: 'Write, update, or upsert database records',
          category: 'data',
          icon: 'database'
        }
      }
    },
    {
      nodeType: 'http-request',
      executor: httpRequestExecutor,
      plugin: {
        nodeType: 'http-request',
        version: '1.0.0',
        executor: httpRequestExecutor,
        metadata: {
          description: 'Make HTTP requests with support for headers, authentication, and retries',
          category: 'integration',
          icon: 'network'
        }
      }
    },
    {
      nodeType: 'condition',
      executor: conditionExecutor,
      plugin: {
        nodeType: 'condition',
        version: '1.0.0',
        executor: conditionExecutor,
        metadata: {
          description: 'Evaluate conditions and route to different execution paths',
          category: 'control-flow',
          icon: 'branch'
        }
      }
    },
    {
      nodeType: 'email-send',
      executor: emailSendExecutor,
      plugin: {
        nodeType: 'email-send',
        version: '1.0.0',
        executor: emailSendExecutor,
        metadata: {
          description: 'Send emails with template support and attachments',
          category: 'action',
          icon: 'mail'
        }
      }
    },
    {
      nodeType: 'webhook-response',
      executor: webhookResponseExecutor,
      plugin: {
        nodeType: 'webhook-response',
        version: '1.0.0',
        executor: webhookResponseExecutor,
        metadata: {
          description: 'Return HTTP response to webhook sender',
          category: 'integration',
          icon: 'webhook'
        }
      }
    },
    {
      nodeType: 'transform',
      executor: transformExecutor,
      plugin: {
        nodeType: 'transform',
        version: '1.0.0',
        executor: transformExecutor,
        metadata: {
          description: 'Transform and map data using template expressions',
          category: 'data',
          icon: 'transform'
        }
      }
    },
    {
      nodeType: 'wait',
      executor: waitExecutor,
      plugin: {
        nodeType: 'wait',
        version: '1.0.0',
        executor: waitExecutor,
        metadata: {
          description: 'Pause execution for a specified duration',
          category: 'control-flow',
          icon: 'pause'
        }
      }
    },
    {
      nodeType: 'set-variable',
      executor: setVariableExecutor,
      plugin: {
        nodeType: 'set-variable',
        version: '1.0.0',
        executor: setVariableExecutor,
        metadata: {
          description: 'Set workflow variables for use in subsequent nodes',
          category: 'utility',
          icon: 'variable'
        }
      }
    }
  ]);

  console.log('✓ Built-in node executors registered');
}
