/**
 * Built-in Node Executors Registry
 * Registers all built-in workflow node executors with the global registry
 *
 * This module:
 * - Imports all class-based and function-based executors
 * - Provides registration mechanism
 * - Exports catalog of available node types
 * - Maintains backward compatibility with legacy plugin system
 *
 * @packageDocumentation
 */

import { getNodeExecutorRegistry } from '../registry/node-executor-registry';
import { registerPluginMap } from './function-executor-adapter';

// ============================================================================
// CLASS-BASED EXECUTOR IMPORTS
// ============================================================================

import { dbalReadExecutor } from '../../../plugins/ts/dbal-read/src/index';
import { dbalWriteExecutor } from '../../../plugins/ts/dbal-write/src/index';
import { httpRequestExecutor } from '../../../plugins/ts/integration/http-request/src/index';
import { emailSendExecutor, setEmailService } from '../../../plugins/ts/integration/email-send/src/index';
import { smtpRelayExecutor, setSMTPService } from '../../../plugins/ts/integration/smtp-relay/src/index';
import { conditionExecutor } from '../../../plugins/ts/control-flow/condition/src/index';
import { transformExecutor } from '../../../plugins/ts/utility/transform/src/index';
import { waitExecutor } from '../../../plugins/ts/utility/wait/src/index';
import { setVariableExecutor } from '../../../plugins/ts/utility/set-variable/src/index';
import { webhookResponseExecutor } from '../../../plugins/ts/integration/webhook-response/src/index';

// ============================================================================
// FUNCTION-BASED PLUGIN MAP IMPORTS
// ============================================================================

import { stringPlugins } from '../../../plugins/ts/string/src/index';
import { mathPlugins } from '../../../plugins/ts/math/src/index';
import { logicPlugins } from '../../../plugins/ts/logic/src/index';
import { listPlugins } from '../../../plugins/ts/list/src/index';
import { dictPlugins } from '../../../plugins/ts/dict/src/index';
import { convertPlugins } from '../../../plugins/ts/convert/src/index';
import { varPlugins } from '../../../plugins/ts/var/src/index';

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Class-based executors - Direct use or plugin registration
 * @exports
 */
export {
  dbalReadExecutor,
  dbalWriteExecutor,
  httpRequestExecutor,
  emailSendExecutor,
  setEmailService,
  smtpRelayExecutor,
  setSMTPService,
  conditionExecutor,
  transformExecutor,
  waitExecutor,
  setVariableExecutor,
  webhookResponseExecutor
};

/**
 * Function-based plugin maps - Catalog of available operations
 * @exports
 */
export {
  stringPlugins,
  mathPlugins,
  logicPlugins,
  listPlugins,
  dictPlugins,
  convertPlugins,
  varPlugins
};

/**
 * Register all built-in executors with the global registry
 * Call this once at application startup
 */
export function registerBuiltInExecutors(): void {
  const registry = getNodeExecutorRegistry();

  // Register class-based executors
  registry.register('dbal-read', dbalReadExecutor);
  registry.register('dbal-write', dbalWriteExecutor);
  registry.register('http-request', httpRequestExecutor);
  registry.register('email-send', emailSendExecutor);
  registry.register('smtp-relay-send', smtpRelayExecutor);
  registry.register('condition', conditionExecutor);
  registry.register('transform', transformExecutor);
  registry.register('wait', waitExecutor);
  registry.register('set-variable', setVariableExecutor);
  registry.register('webhook-response', webhookResponseExecutor);

  // Register function-based plugin maps
  registerPluginMap(registry, stringPlugins, 'string');
  registerPluginMap(registry, mathPlugins, 'math');
  registerPluginMap(registry, logicPlugins, 'logic');
  registerPluginMap(registry, listPlugins, 'list');
  registerPluginMap(registry, dictPlugins, 'dict');
  registerPluginMap(registry, convertPlugins, 'convert');
  registerPluginMap(registry, varPlugins, 'var');

  console.log(`✓ Registered ${registry.listExecutors().length} node executors`);
}

/**
 * Get list of all available node types
 */
export function getAvailableNodeTypes(): string[] {
  return [
    // Class-based
    'dbal-read',
    'dbal-write',
    'http-request',
    'email-send',
    'condition',
    'transform',
    'wait',
    'set-variable',
    'webhook-response',
    // String plugins
    ...Object.keys(stringPlugins),
    // Math plugins
    ...Object.keys(mathPlugins),
    // Logic plugins
    ...Object.keys(logicPlugins),
    // List plugins
    ...Object.keys(listPlugins),
    // Dict plugins
    ...Object.keys(dictPlugins),
    // Convert plugins
    ...Object.keys(convertPlugins),
    // Var plugins
    ...Object.keys(varPlugins),
  ];
}

/**
 * Get node types by category
 */
export function getNodeTypesByCategory(): Record<string, string[]> {
  return {
    'dbal': ['dbal-read', 'dbal-write'],
    'integration': ['http-request', 'email-send', 'webhook-response'],
    'control-flow': ['condition', 'wait'],
    'utility': ['transform', 'set-variable'],
    'string': Object.keys(stringPlugins),
    'math': Object.keys(mathPlugins),
    'logic': Object.keys(logicPlugins),
    'list': Object.keys(listPlugins),
    'dict': Object.keys(dictPlugins),
    'convert': Object.keys(convertPlugins),
    'var': Object.keys(varPlugins),
  };
}
