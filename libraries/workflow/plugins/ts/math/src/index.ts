/**
 * Workflow plugin: Mathematical operations.
 */

import { NodeExecutor, ExecuteInputs, ExecuteResult, createTemplateContext } from '../../base';
import { interpolateTemplate } from '../../../../executor/ts/utils/template-engine';

const resolve = (value: any, ctx: any): number => {
  if (typeof value === 'string' && value.startsWith('{{')) {
    value = interpolateTemplate(value, ctx);
  }
  return Number(value);
};

export class MathAdd implements NodeExecutor {
  readonly nodeType = 'math.add';
  readonly category = 'math';
  readonly description = 'Add multiple numbers together';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => resolve(v, ctx));
    const result = values.reduce((sum: number, val: number) => sum + val, 0);
    return { result };
  }
}

export class MathSubtract implements NodeExecutor {
  readonly nodeType = 'math.subtract';
  readonly category = 'math';
  readonly description = 'Subtract one number from another';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    return { result: a - b };
  }
}

export class MathMultiply implements NodeExecutor {
  readonly nodeType = 'math.multiply';
  readonly category = 'math';
  readonly description = 'Multiply multiple numbers together';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => resolve(v, ctx));
    const result = values.reduce((prod: number, val: number) => prod * val, 1);
    return { result };
  }
}

export class MathDivide implements NodeExecutor {
  readonly nodeType = 'math.divide';
  readonly category = 'math';
  readonly description = 'Divide one number by another';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    if (b === 0) throw new Error('Division by zero');
    return { result: a / b };
  }
}

export class MathModulo implements NodeExecutor {
  readonly nodeType = 'math.modulo';
  readonly category = 'math';
  readonly description = 'Get the remainder of division (modulo operation)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const a = resolve(inputs.node.parameters.a, ctx);
    const b = resolve(inputs.node.parameters.b, ctx);
    if (b === 0) throw new Error('Modulo by zero');
    return { result: a % b };
  }
}

export class MathPower implements NodeExecutor {
  readonly nodeType = 'math.power';
  readonly category = 'math';
  readonly description = 'Raise a number to a power (exponentiation)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const base = resolve(inputs.node.parameters.base, ctx);
    const exponent = resolve(inputs.node.parameters.exponent, ctx);
    return { result: Math.pow(base, exponent) };
  }
}

export class MathSqrt implements NodeExecutor {
  readonly nodeType = 'math.sqrt';
  readonly category = 'math';
  readonly description = 'Calculate the square root of a number';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    if (value < 0) throw new Error('Cannot calculate square root of negative number');
    return { result: Math.sqrt(value) };
  }
}

export class MathAbs implements NodeExecutor {
  readonly nodeType = 'math.abs';
  readonly category = 'math';
  readonly description = 'Get the absolute value of a number';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    return { result: Math.abs(value) };
  }
}

export class MathRound implements NodeExecutor {
  readonly nodeType = 'math.round';
  readonly category = 'math';
  readonly description = 'Round a number to specified decimal places';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const decimals = inputs.node.parameters.decimals ?? 0;
    const factor = Math.pow(10, decimals);
    return { result: Math.round(value * factor) / factor };
  }
}

export class MathFloor implements NodeExecutor {
  readonly nodeType = 'math.floor';
  readonly category = 'math';
  readonly description = 'Round a number down to the nearest integer';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    return { result: Math.floor(value) };
  }
}

export class MathCeil implements NodeExecutor {
  readonly nodeType = 'math.ceil';
  readonly category = 'math';
  readonly description = 'Round a number up to the nearest integer';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    return { result: Math.ceil(value) };
  }
}

export class MathMin implements NodeExecutor {
  readonly nodeType = 'math.min';
  readonly category = 'math';
  readonly description = 'Get the minimum value from a list of numbers';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => resolve(v, ctx));
    return { result: Math.min(...values) };
  }
}

export class MathMax implements NodeExecutor {
  readonly nodeType = 'math.max';
  readonly category = 'math';
  readonly description = 'Get the maximum value from a list of numbers';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => resolve(v, ctx));
    return { result: Math.max(...values) };
  }
}

export class MathSum implements NodeExecutor {
  readonly nodeType = 'math.sum';
  readonly category = 'math';
  readonly description = 'Calculate the sum of a list of numbers';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => resolve(v, ctx));
    return { result: values.reduce((a: number, b: number) => a + b, 0) };
  }
}

export class MathAverage implements NodeExecutor {
  readonly nodeType = 'math.average';
  readonly category = 'math';
  readonly description = 'Calculate the average of a list of numbers';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => resolve(v, ctx));
    if (values.length === 0) return { result: 0 };
    const sum = values.reduce((a: number, b: number) => a + b, 0);
    return { result: sum / values.length };
  }
}

export class MathRandom implements NodeExecutor {
  readonly nodeType = 'math.random';
  readonly category = 'math';
  readonly description = 'Generate a random number within a range';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const min = inputs.node.parameters.min !== undefined ? resolve(inputs.node.parameters.min, ctx) : 0;
    const max = inputs.node.parameters.max !== undefined ? resolve(inputs.node.parameters.max, ctx) : 1;
    const integer = inputs.node.parameters.integer ?? false;
    let result = Math.random() * (max - min) + min;
    if (integer) result = Math.floor(result);
    return { result };
  }
}

export class MathClamp implements NodeExecutor {
  readonly nodeType = 'math.clamp';
  readonly category = 'math';
  readonly description = 'Clamp a value between a minimum and maximum';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const min = resolve(inputs.node.parameters.min, ctx);
    const max = resolve(inputs.node.parameters.max, ctx);
    return { result: Math.min(Math.max(value, min), max) };
  }
}

// Export all math plugin classes
export const mathPluginClasses = {
  'math.add': MathAdd,
  'math.subtract': MathSubtract,
  'math.multiply': MathMultiply,
  'math.divide': MathDivide,
  'math.modulo': MathModulo,
  'math.power': MathPower,
  'math.sqrt': MathSqrt,
  'math.abs': MathAbs,
  'math.round': MathRound,
  'math.floor': MathFloor,
  'math.ceil': MathCeil,
  'math.min': MathMin,
  'math.max': MathMax,
  'math.sum': MathSum,
  'math.average': MathAverage,
  'math.random': MathRandom,
  'math.clamp': MathClamp,
};

export default mathPluginClasses;
