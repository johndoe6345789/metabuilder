/**
 * Workflow plugin: Object/dictionary operations.
 */

import { NodeExecutor, ExecuteInputs, ExecuteResult, createTemplateContext } from '../../base';
import { interpolateTemplate, evaluateTemplate } from '../../../../executor/ts/utils/template-engine';

const resolve = (value: any, ctx: any): any => {
  if (typeof value === 'string' && value.startsWith('{{')) {
    return interpolateTemplate(value, ctx);
  }
  return value;
};

/**
 * Check if a key is a prototype-polluting key that should be rejected.
 * Prevents prototype pollution attacks where attackers inject __proto__,
 * constructor, or prototype keys to modify Object.prototype.
 */
const isPrototypePollutingKey = (key: string): boolean => {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
};

/**
 * Safely assign a value to an object, rejecting prototype-polluting keys.
 * @throws Error if key is a prototype-polluting key
 */
const safeAssign = (obj: any, key: string, value: any): void => {
  if (isPrototypePollutingKey(key)) {
    throw new Error(`Prototype-polluting key "${key}" is not allowed`);
  }
  obj[key] = value;
};

export class DictGet implements NodeExecutor {
  readonly nodeType = 'dict.get';
  readonly category = 'dict';
  readonly description = 'Get value by key (supports nested dot notation paths)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    const path = resolve(inputs.node.parameters.path, ctx);
    const defaultValue = resolve(inputs.node.parameters.default, ctx);
    if (typeof obj !== 'object' || obj === null) return { result: defaultValue };
    const keys = String(path).split('.');
    let result: any = obj;
    for (const key of keys) {
      if (result === null || result === undefined) break;
      result = result[key];
    }
    return { result: result ?? defaultValue };
  }
}

export class DictSet implements NodeExecutor {
  readonly nodeType = 'dict.set';
  readonly category = 'dict';
  readonly description = 'Set value by key (supports nested paths, returns new object)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    const path = resolve(inputs.node.parameters.path, ctx);
    const value = resolve(inputs.node.parameters.value, ctx);
    if (typeof obj !== 'object' || obj === null) throw new Error('Object is required');
    const result = JSON.parse(JSON.stringify(obj));
    const keys = String(path).split('.');
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (isPrototypePollutingKey(key)) {
        throw new Error(`Prototype-polluting key "${key}" is not allowed in path`);
      }
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    const finalKey = keys[keys.length - 1];
    safeAssign(current, finalKey, value);
    return { result };
  }
}

export class DictDelete implements NodeExecutor {
  readonly nodeType = 'dict.delete';
  readonly category = 'dict';
  readonly description = 'Delete key from object (returns new object)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    const key = resolve(inputs.node.parameters.key, ctx);
    if (typeof obj !== 'object' || obj === null) return { result: {} };
    if (isPrototypePollutingKey(key)) {
      throw new Error(`Prototype-polluting key "${key}" is not allowed`);
    }
    const result = { ...obj };
    delete result[key];
    return { result };
  }
}

export class DictKeys implements NodeExecutor {
  readonly nodeType = 'dict.keys';
  readonly category = 'dict';
  readonly description = 'Get all keys from object as array';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    if (typeof obj !== 'object' || obj === null) return { result: [] };
    return { result: Object.keys(obj) };
  }
}

export class DictValues implements NodeExecutor {
  readonly nodeType = 'dict.values';
  readonly category = 'dict';
  readonly description = 'Get all values from object as array';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    if (typeof obj !== 'object' || obj === null) return { result: [] };
    return { result: Object.values(obj) };
  }
}

export class DictEntries implements NodeExecutor {
  readonly nodeType = 'dict.entries';
  readonly category = 'dict';
  readonly description = 'Get all entries as [key, value] pairs array';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    if (typeof obj !== 'object' || obj === null) return { result: [] };
    return { result: Object.entries(obj) };
  }
}

export class DictFromEntries implements NodeExecutor {
  readonly nodeType = 'dict.fromEntries';
  readonly category = 'dict';
  readonly description = 'Create object from [key, value] entries array';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const entries = resolve(inputs.node.parameters.entries, ctx) || [];
    if (!Array.isArray(entries)) return { result: {} };
    return { result: Object.fromEntries(entries) };
  }
}

export class DictMerge implements NodeExecutor {
  readonly nodeType = 'dict.merge';
  readonly category = 'dict';
  readonly description = 'Shallow merge multiple objects';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const objects = (inputs.node.parameters.objects || []).map((o: any) => resolve(o, ctx) || {});
    const result = Object.assign({}, ...objects);
    return { result };
  }
}

export class DictDeepMerge implements NodeExecutor {
  readonly nodeType = 'dict.deepMerge';
  readonly category = 'dict';
  readonly description = 'Deep merge multiple objects (recursive)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const objects = (inputs.node.parameters.objects || []).map((o: any) => resolve(o, ctx) || {});
    const deepMerge = (target: any, source: any): any => {
      const result = { ...target };
      for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
      return result;
    };
    const result = objects.reduce((acc: any, obj: any) => deepMerge(acc, obj), {});
    return { result };
  }
}

export class DictPick implements NodeExecutor {
  readonly nodeType = 'dict.pick';
  readonly category = 'dict';
  readonly description = 'Pick specific keys from object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    const keys = resolve(inputs.node.parameters.keys, ctx) || [];
    if (typeof obj !== 'object' || obj === null) return { result: {} };
    const result: Record<string, any> = {};
    for (const key of keys) {
      if (isPrototypePollutingKey(key)) {
        throw new Error(`Prototype-polluting key "${key}" is not allowed`);
      }
      if (key in obj) result[key] = obj[key];
    }
    return { result };
  }
}

export class DictOmit implements NodeExecutor {
  readonly nodeType = 'dict.omit';
  readonly category = 'dict';
  readonly description = 'Omit specific keys from object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    const keys = resolve(inputs.node.parameters.keys, ctx) || [];
    if (typeof obj !== 'object' || obj === null) return { result: {} };
    const omitSet = new Set(keys);
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!omitSet.has(key)) result[key] = value;
    }
    return { result };
  }
}

export class DictHas implements NodeExecutor {
  readonly nodeType = 'dict.has';
  readonly category = 'dict';
  readonly description = 'Check if key exists in object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    const key = resolve(inputs.node.parameters.key, ctx);
    if (typeof obj !== 'object' || obj === null) return { result: false };
    return { result: key in obj };
  }
}

export class DictSize implements NodeExecutor {
  readonly nodeType = 'dict.size';
  readonly category = 'dict';
  readonly description = 'Get number of keys in object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    if (typeof obj !== 'object' || obj === null) return { result: 0 };
    return { result: Object.keys(obj).length };
  }
}

export class DictInvert implements NodeExecutor {
  readonly nodeType = 'dict.invert';
  readonly category = 'dict';
  readonly description = 'Swap keys and values in object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    if (typeof obj !== 'object' || obj === null) return { result: {} };
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = String(value);
      if (isPrototypePollutingKey(newKey)) {
        throw new Error(`Prototype-polluting key "${newKey}" is not allowed`);
      }
      result[newKey] = key;
    }
    return { result };
  }
}

export class DictMapValues implements NodeExecutor {
  readonly nodeType = 'dict.mapValues';
  readonly category = 'dict';
  readonly description = 'Transform all values using a template';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    const transform = inputs.node.parameters.transform;
    if (typeof obj !== 'object' || obj === null) return { result: {} };
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const evalCtx = { ...ctx, key, value, $key: key, $value: value };
      result[key] = interpolateTemplate(transform, evalCtx);
    }
    return { result };
  }
}

export class DictFilterEntries implements NodeExecutor {
  readonly nodeType = 'dict.filterEntries';
  readonly category = 'dict';
  readonly description = 'Filter object entries by a condition';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const obj = resolve(inputs.node.parameters.object, ctx) || {};
    const condition = inputs.node.parameters.condition;
    if (typeof obj !== 'object' || obj === null) return { result: {} };
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const evalCtx = { ...ctx, key, value, $key: key, $value: value };
      if (evaluateTemplate(condition, evalCtx)) {
        result[key] = value;
      }
    }
    return { result };
  }
}

// Export all dict plugin classes
export const dictPluginClasses = {
  'dict.get': DictGet,
  'dict.set': DictSet,
  'dict.delete': DictDelete,
  'dict.keys': DictKeys,
  'dict.values': DictValues,
  'dict.entries': DictEntries,
  'dict.fromEntries': DictFromEntries,
  'dict.merge': DictMerge,
  'dict.deepMerge': DictDeepMerge,
  'dict.pick': DictPick,
  'dict.omit': DictOmit,
  'dict.has': DictHas,
  'dict.size': DictSize,
  'dict.invert': DictInvert,
  'dict.mapValues': DictMapValues,
  'dict.filterEntries': DictFilterEntries,
};

export default dictPluginClasses;
