/**
 * Workflow plugin: Logical and comparison operations.
 */

import { NodeExecutor, ExecuteInputs, ExecuteResult, createTemplateContext } from '../../base';
import { interpolateTemplate } from '../../../executor/ts/utils/template-engine';

const resolve = (value: any, ctx: any): any => {
  if (typeof value === 'string' && value.startsWith('{{')) {
    return interpolateTemplate(value, ctx);
  }
  return value;
};

export class LogicAnd implements NodeExecutor {
  readonly nodeType = 'logic.and';
  readonly category = 'logic';
  readonly description = 'Logical AND - returns true if all values are truthy';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => Boolean(resolve(v, ctx)));
    return { result: values.every(v => v) };
  }
}

export class LogicOr implements NodeExecutor {
  readonly nodeType = 'logic.or';
  readonly category = 'logic';
  readonly description = 'Logical OR - returns true if any value is truthy';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => Boolean(resolve(v, ctx)));
    return { result: values.some(v => v) };
  }
}

export class LogicNot implements NodeExecutor {
  readonly nodeType = 'logic.not';
  readonly category = 'logic';
  readonly description = 'Logical NOT - inverts boolean value';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = Boolean(resolve(inputs.node.parameters.value, ctx));
    return { result: !value };
  }
}

export class LogicXor implements NodeExecutor {
  readonly nodeType = 'logic.xor';
  readonly category = 'logic';
  readonly description = 'Logical XOR - returns true if values are different';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = Boolean(resolve(inputs.node.parameters.a, ctx));
    const b = Boolean(resolve(inputs.node.parameters.b, ctx));
    return { result: a !== b };
  }
}

export class LogicEquals implements NodeExecutor {
  readonly nodeType = 'logic.equals';
  readonly category = 'logic';
  readonly description = 'Equality check (strict or loose comparison)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    const strict = inputs.node.parameters.strict ?? true;
    const result = strict ? a === b : a == b;
    return { result };
  }
}

export class LogicNotEquals implements NodeExecutor {
  readonly nodeType = 'logic.notEquals';
  readonly category = 'logic';
  readonly description = 'Inequality check (strict or loose comparison)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    const strict = inputs.node.parameters.strict ?? true;
    const result = strict ? a !== b : a != b;
    return { result };
  }
}

export class LogicGt implements NodeExecutor {
  readonly nodeType = 'logic.gt';
  readonly category = 'logic';
  readonly description = 'Greater than comparison';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    return { result: a > b };
  }
}

export class LogicGte implements NodeExecutor {
  readonly nodeType = 'logic.gte';
  readonly category = 'logic';
  readonly description = 'Greater than or equal comparison';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    return { result: a >= b };
  }
}

export class LogicLt implements NodeExecutor {
  readonly nodeType = 'logic.lt';
  readonly category = 'logic';
  readonly description = 'Less than comparison';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    return { result: a < b };
  }
}

export class LogicLte implements NodeExecutor {
  readonly nodeType = 'logic.lte';
  readonly category = 'logic';
  readonly description = 'Less than or equal comparison';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    return { result: a <= b };
  }
}

export class LogicIn implements NodeExecutor {
  readonly nodeType = 'logic.in';
  readonly category = 'logic';
  readonly description = 'Check if value is in array';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    return { result: Array.isArray(array) && array.includes(value) };
  }
}

export class LogicBetween implements NodeExecutor {
  readonly nodeType = 'logic.between';
  readonly category = 'logic';
  readonly description = 'Check if value is between min and max (inclusive or exclusive)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const min = resolve(inputs.node.parameters.min, ctx);
    const max = resolve(inputs.node.parameters.max, ctx);
    const inclusive = inputs.node.parameters.inclusive ?? true;
    const result = inclusive ? (value >= min && value <= max) : (value > min && value < max);
    return { result };
  }
}

export class LogicIsNull implements NodeExecutor {
  readonly nodeType = 'logic.isNull';
  readonly category = 'logic';
  readonly description = 'Check if value is null or undefined';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    return { result: value === null || value === undefined };
  }
}

export class LogicIsEmpty implements NodeExecutor {
  readonly nodeType = 'logic.isEmpty';
  readonly category = 'logic';
  readonly description = 'Check if value is empty (null, undefined, empty string, empty array, empty object)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    let isEmpty = false;
    if (value === null || value === undefined) isEmpty = true;
    else if (typeof value === 'string') isEmpty = value.length === 0;
    else if (Array.isArray(value)) isEmpty = value.length === 0;
    else if (typeof value === 'object') isEmpty = Object.keys(value).length === 0;
    return { result: isEmpty };
  }
}

export class LogicTypeOf implements NodeExecutor {
  readonly nodeType = 'logic.typeOf';
  readonly category = 'logic';
  readonly description = 'Get type of value (string, number, boolean, array, object, null, undefined)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    let type: string;
    if (value === null) type = 'null';
    else if (Array.isArray(value)) type = 'array';
    else type = typeof value;
    return { result: type };
  }
}

export class LogicTernary implements NodeExecutor {
  readonly nodeType = 'logic.ternary';
  readonly category = 'logic';
  readonly description = 'Ternary conditional - returns then value if condition is truthy, else value otherwise';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const condition = Boolean(resolve(inputs.node.parameters.condition, ctx));
    const thenValue = resolve(inputs.node.parameters.then, ctx);
    const elseValue = resolve(inputs.node.parameters.else, ctx);
    return { result: condition ? thenValue : elseValue };
  }
}

export class LogicCoalesce implements NodeExecutor {
  readonly nodeType = 'logic.coalesce';
  readonly category = 'logic';
  readonly description = 'Return first non-null/undefined value from list';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => resolve(v, ctx));
    const result = values.find(v => v !== null && v !== undefined) ?? null;
    return { result };
  }
}

// Export all logic plugin classes
export const logicPluginClasses = {
  'logic.and': LogicAnd,
  'logic.or': LogicOr,
  'logic.not': LogicNot,
  'logic.xor': LogicXor,
  'logic.equals': LogicEquals,
  'logic.notEquals': LogicNotEquals,
  'logic.gt': LogicGt,
  'logic.gte': LogicGte,
  'logic.lt': LogicLt,
  'logic.lte': LogicLte,
  'logic.in': LogicIn,
  'logic.between': LogicBetween,
  'logic.isNull': LogicIsNull,
  'logic.isEmpty': LogicIsEmpty,
  'logic.typeOf': LogicTypeOf,
  'logic.ternary': LogicTernary,
  'logic.coalesce': LogicCoalesce,
};

export default logicPluginClasses;
