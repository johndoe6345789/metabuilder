/**
 * Workflow plugin: Variable management operations.
 */

import { NodeExecutor, ExecuteInputs, ExecuteResult, createTemplateContext } from '../../base';
import { interpolateTemplate } from '../../../executor/ts/utils/template-engine';

const resolve = (value: any, ctx: any): any => {
  if (typeof value === 'string' && value.startsWith('{{')) {
    return interpolateTemplate(value, ctx);
  }
  return value;
};

// Ensure state.variables exists
const ensureVariables = (state: Record<string, any>): Record<string, any> => {
  if (!state.variables) state.variables = {};
  return state.variables;
};

export class VarGet implements NodeExecutor {
  readonly nodeType = 'var.get';
  readonly category = 'var';
  readonly description = 'Get variable value by name';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const defaultValue = resolve(inputs.node.parameters.default, ctx);
    const vars = ensureVariables(inputs.state);
    const result = name in vars ? vars[name] : defaultValue;
    return { result };
  }
}

export class VarSet implements NodeExecutor {
  readonly nodeType = 'var.set';
  readonly category = 'var';
  readonly description = 'Set variable value by name';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const value = resolve(inputs.node.parameters.value, ctx);
    const vars = ensureVariables(inputs.state);
    vars[name] = value;
    return { result: value, name };
  }
}

export class VarSetMultiple implements NodeExecutor {
  readonly nodeType = 'var.setMultiple';
  readonly category = 'var';
  readonly description = 'Set multiple variables at once from an object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const variables = inputs.node.parameters.variables || {};
    const vars = ensureVariables(inputs.state);
    const set: Record<string, any> = {};
    for (const [name, value] of Object.entries(variables)) {
      const resolvedValue = resolve(value, ctx);
      vars[name] = resolvedValue;
      set[name] = resolvedValue;
    }
    return { result: set, count: Object.keys(set).length };
  }
}

export class VarDelete implements NodeExecutor {
  readonly nodeType = 'var.delete';
  readonly category = 'var';
  readonly description = 'Delete variable by name';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const vars = ensureVariables(inputs.state);
    const existed = name in vars;
    const previousValue = vars[name];
    delete vars[name];
    return { result: existed, previousValue };
  }
}

export class VarExists implements NodeExecutor {
  readonly nodeType = 'var.exists';
  readonly category = 'var';
  readonly description = 'Check if variable exists';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const vars = ensureVariables(inputs.state);
    return { result: name in vars };
  }
}

export class VarIncrement implements NodeExecutor {
  readonly nodeType = 'var.increment';
  readonly category = 'var';
  readonly description = 'Increment numeric variable by amount (default 1)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const amount = inputs.node.parameters.amount ?? 1;
    const vars = ensureVariables(inputs.state);
    const current = Number(vars[name] ?? 0);
    const result = current + amount;
    vars[name] = result;
    return { result, previous: current };
  }
}

export class VarDecrement implements NodeExecutor {
  readonly nodeType = 'var.decrement';
  readonly category = 'var';
  readonly description = 'Decrement numeric variable by amount (default 1)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const amount = inputs.node.parameters.amount ?? 1;
    const vars = ensureVariables(inputs.state);
    const current = Number(vars[name] ?? 0);
    const result = current - amount;
    vars[name] = result;
    return { result, previous: current };
  }
}

export class VarToggle implements NodeExecutor {
  readonly nodeType = 'var.toggle';
  readonly category = 'var';
  readonly description = 'Toggle boolean variable';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const vars = ensureVariables(inputs.state);
    const current = Boolean(vars[name]);
    const result = !current;
    vars[name] = result;
    return { result, previous: current };
  }
}

export class VarAppend implements NodeExecutor {
  readonly nodeType = 'var.append';
  readonly category = 'var';
  readonly description = 'Append value to array variable';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const value = resolve(inputs.node.parameters.value, ctx);
    const vars = ensureVariables(inputs.state);
    if (!Array.isArray(vars[name])) vars[name] = [];
    vars[name].push(value);
    return { result: vars[name], length: vars[name].length };
  }
}

export class VarConcat implements NodeExecutor {
  readonly nodeType = 'var.concat';
  readonly category = 'var';
  readonly description = 'Concatenate value to string variable with optional separator';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const value = resolve(inputs.node.parameters.value, ctx);
    const separator = resolve(inputs.node.parameters.separator ?? '', ctx);
    const vars = ensureVariables(inputs.state);
    const current = String(vars[name] ?? '');
    const result = current ? `${current}${separator}${value}` : String(value);
    vars[name] = result;
    return { result };
  }
}

export class VarList implements NodeExecutor {
  readonly nodeType = 'var.list';
  readonly category = 'var';
  readonly description = 'List all variable names';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const vars = ensureVariables(inputs.state);
    return {
      result: Object.keys(vars),
      count: Object.keys(vars).length,
    };
  }
}

export class VarGetAll implements NodeExecutor {
  readonly nodeType = 'var.getAll';
  readonly category = 'var';
  readonly description = 'Get all variables as object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const vars = ensureVariables(inputs.state);
    return { result: { ...vars } };
  }
}

export class VarClear implements NodeExecutor {
  readonly nodeType = 'var.clear';
  readonly category = 'var';
  readonly description = 'Clear all variables';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const vars = ensureVariables(inputs.state);
    const count = Object.keys(vars).length;
    const previous = { ...vars };
    for (const key of Object.keys(vars)) {
      delete vars[key];
    }
    return { result: count, previous };
  }
}

export class VarMerge implements NodeExecutor {
  readonly nodeType = 'var.merge';
  readonly category = 'var';
  readonly description = 'Merge object into variable (shallow merge for objects)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const name = resolve(inputs.node.parameters.name, ctx);
    const value = resolve(inputs.node.parameters.value, ctx);
    const vars = ensureVariables(inputs.state);
    const current = vars[name];
    if (typeof current === 'object' && typeof value === 'object' && !Array.isArray(current) && !Array.isArray(value)) {
      vars[name] = { ...current, ...value };
    } else {
      vars[name] = value;
    }
    return { result: vars[name] };
  }
}

// Export all var plugin classes
export const varPluginClasses = {
  'var.get': VarGet,
  'var.set': VarSet,
  'var.setMultiple': VarSetMultiple,
  'var.delete': VarDelete,
  'var.exists': VarExists,
  'var.increment': VarIncrement,
  'var.decrement': VarDecrement,
  'var.toggle': VarToggle,
  'var.append': VarAppend,
  'var.concat': VarConcat,
  'var.list': VarList,
  'var.getAll': VarGetAll,
  'var.clear': VarClear,
  'var.merge': VarMerge,
};

export default varPluginClasses;
