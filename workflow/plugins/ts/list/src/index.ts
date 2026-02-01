/**
 * Workflow plugin: Array/list operations.
 */

import { NodeExecutor, ExecuteInputs, ExecuteResult, createTemplateContext } from '../../base';
import { interpolateTemplate, evaluateTemplate } from '../../../executor/ts/utils/template-engine';

const resolve = (value: any, ctx: any): any => {
  if (typeof value === 'string' && value.startsWith('{{')) {
    return interpolateTemplate(value, ctx);
  }
  return value;
};

export class ListConcat implements NodeExecutor {
  readonly nodeType = 'list.concat';
  readonly category = 'list';
  readonly description = 'Concatenate multiple arrays into one';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const arrays = (inputs.node.parameters.arrays || []).map((a: any) => resolve(a, ctx) || []);
    return { result: arrays.flat() };
  }
}

export class ListLength implements NodeExecutor {
  readonly nodeType = 'list.length';
  readonly category = 'list';
  readonly description = 'Get the length of an array';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    return { result: Array.isArray(array) ? array.length : 0 };
  }
}

export class ListSlice implements NodeExecutor {
  readonly nodeType = 'list.slice';
  readonly category = 'list';
  readonly description = 'Extract a portion of an array by start and end indices';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const startIdx = inputs.node.parameters.start ?? 0;
    const endIdx = inputs.node.parameters.end;
    return { result: Array.isArray(array) ? array.slice(startIdx, endIdx) : [] };
  }
}

export class ListFind implements NodeExecutor {
  readonly nodeType = 'list.find';
  readonly category = 'list';
  readonly description = 'Find first element matching a condition';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const condition = inputs.node.parameters.condition;
    if (!Array.isArray(array)) return { result: null };
    const result = array.find((item, index) => {
      const evalCtx = { ...ctx, item, index, $item: item, $index: index };
      return evaluateTemplate(condition, evalCtx);
    });
    return { result: result ?? null };
  }
}

export class ListFindIndex implements NodeExecutor {
  readonly nodeType = 'list.findIndex';
  readonly category = 'list';
  readonly description = 'Find index of first element matching a condition';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const condition = inputs.node.parameters.condition;
    if (!Array.isArray(array)) return { result: -1 };
    const result = array.findIndex((item, index) => {
      const evalCtx = { ...ctx, item, index, $item: item, $index: index };
      return evaluateTemplate(condition, evalCtx);
    });
    return { result };
  }
}

export class ListFilter implements NodeExecutor {
  readonly nodeType = 'list.filter';
  readonly category = 'list';
  readonly description = 'Filter array elements by a condition';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const condition = inputs.node.parameters.condition;
    if (!Array.isArray(array)) return { result: [] };
    const result = array.filter((item, index) => {
      const evalCtx = { ...ctx, item, index, $item: item, $index: index };
      return evaluateTemplate(condition, evalCtx);
    });
    return { result };
  }
}

export class ListMap implements NodeExecutor {
  readonly nodeType = 'list.map';
  readonly category = 'list';
  readonly description = 'Transform each element using a template';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const transform = inputs.node.parameters.transform;
    if (!Array.isArray(array)) return { result: [] };
    const result = array.map((item, index) => {
      const evalCtx = { ...ctx, item, index, $item: item, $index: index };
      return interpolateTemplate(transform, evalCtx);
    });
    return { result };
  }
}

export class ListReduce implements NodeExecutor {
  readonly nodeType = 'list.reduce';
  readonly category = 'list';
  readonly description = 'Reduce array to a single value using a reducer expression';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const reducer = inputs.node.parameters.reducer;
    const initial = resolve(inputs.node.parameters.initial, ctx);
    if (!Array.isArray(array)) return { result: initial };
    const result = array.reduce((acc, item, index) => {
      const evalCtx = { ...ctx, acc, item, index, $acc: acc, $item: item, $index: index };
      return evaluateTemplate(reducer, evalCtx);
    }, initial);
    return { result };
  }
}

export class ListEvery implements NodeExecutor {
  readonly nodeType = 'list.every';
  readonly category = 'list';
  readonly description = 'Check if all elements match a condition';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const condition = inputs.node.parameters.condition;
    if (!Array.isArray(array)) return { result: true };
    const result = array.every((item, index) => {
      const evalCtx = { ...ctx, item, index, $item: item, $index: index };
      return evaluateTemplate(condition, evalCtx);
    });
    return { result };
  }
}

export class ListSome implements NodeExecutor {
  readonly nodeType = 'list.some';
  readonly category = 'list';
  readonly description = 'Check if any element matches a condition';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const condition = inputs.node.parameters.condition;
    if (!Array.isArray(array)) return { result: false };
    const result = array.some((item, index) => {
      const evalCtx = { ...ctx, item, index, $item: item, $index: index };
      return evaluateTemplate(condition, evalCtx);
    });
    return { result };
  }
}

export class ListSort implements NodeExecutor {
  readonly nodeType = 'list.sort';
  readonly category = 'list';
  readonly description = 'Sort array by key in ascending or descending order';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const key = inputs.node.parameters.key;
    const order = inputs.node.parameters.order ?? 'asc';
    if (!Array.isArray(array)) return { result: [] };
    const sorted = [...array].sort((a, b) => {
      const valA = key ? a[key] : a;
      const valB = key ? b[key] : b;
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return { result: sorted };
  }
}

export class ListReverse implements NodeExecutor {
  readonly nodeType = 'list.reverse';
  readonly category = 'list';
  readonly description = 'Reverse the order of array elements';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    return { result: Array.isArray(array) ? [...array].reverse() : [] };
  }
}

export class ListUnique implements NodeExecutor {
  readonly nodeType = 'list.unique';
  readonly category = 'list';
  readonly description = 'Remove duplicate elements from array';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const key = inputs.node.parameters.key;
    if (!Array.isArray(array)) return { result: [] };
    let result: any[];
    if (key) {
      const seen = new Set();
      result = array.filter(item => {
        const val = item[key];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    } else {
      result = [...new Set(array)];
    }
    return { result };
  }
}

export class ListFlatten implements NodeExecutor {
  readonly nodeType = 'list.flatten';
  readonly category = 'list';
  readonly description = 'Flatten nested arrays to specified depth';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const depth = inputs.node.parameters.depth ?? 1;
    return { result: Array.isArray(array) ? array.flat(depth) : [] };
  }
}

export class ListPush implements NodeExecutor {
  readonly nodeType = 'list.push';
  readonly category = 'list';
  readonly description = 'Add element to end of array (immutable)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const value = resolve(inputs.node.parameters.value, ctx);
    return { result: Array.isArray(array) ? [...array, value] : [value] };
  }
}

export class ListPop implements NodeExecutor {
  readonly nodeType = 'list.pop';
  readonly category = 'list';
  readonly description = 'Remove and return last element from array (immutable)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    if (!Array.isArray(array) || array.length === 0) return { result: [], removed: null };
    const removed = array[array.length - 1];
    return { result: array.slice(0, -1), removed };
  }
}

export class ListShift implements NodeExecutor {
  readonly nodeType = 'list.shift';
  readonly category = 'list';
  readonly description = 'Remove and return first element from array (immutable)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    if (!Array.isArray(array) || array.length === 0) return { result: [], removed: null };
    const removed = array[0];
    return { result: array.slice(1), removed };
  }
}

export class ListUnshift implements NodeExecutor {
  readonly nodeType = 'list.unshift';
  readonly category = 'list';
  readonly description = 'Add element to beginning of array (immutable)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const value = resolve(inputs.node.parameters.value, ctx);
    return { result: Array.isArray(array) ? [value, ...array] : [value] };
  }
}

export class ListIncludes implements NodeExecutor {
  readonly nodeType = 'list.includes';
  readonly category = 'list';
  readonly description = 'Check if array includes a specific value';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const value = resolve(inputs.node.parameters.value, ctx);
    return { result: Array.isArray(array) && array.includes(value) };
  }
}

export class ListIndexOf implements NodeExecutor {
  readonly nodeType = 'list.indexOf';
  readonly category = 'list';
  readonly description = 'Get the index of a value in array';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const value = resolve(inputs.node.parameters.value, ctx);
    return { result: Array.isArray(array) ? array.indexOf(value) : -1 };
  }
}

export class ListAt implements NodeExecutor {
  readonly nodeType = 'list.at';
  readonly category = 'list';
  readonly description = 'Get element at index (supports negative indices)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const index = inputs.node.parameters.index ?? 0;
    if (!Array.isArray(array)) return { result: null };
    const result = array.at(index) ?? null;
    return { result };
  }
}

export class ListGroupBy implements NodeExecutor {
  readonly nodeType = 'list.groupBy';
  readonly category = 'list';
  readonly description = 'Group array elements by a key into an object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const array = resolve(inputs.node.parameters.array, ctx) || [];
    const key = inputs.node.parameters.key;
    if (!Array.isArray(array)) return { result: {} };
    const groups: Record<string, any[]> = {};
    for (const item of array) {
      const groupKey = String(item[key] ?? 'undefined');
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    }
    return { result: groups };
  }
}

// Export all list plugin classes
export const listPluginClasses = {
  'list.concat': ListConcat,
  'list.length': ListLength,
  'list.slice': ListSlice,
  'list.find': ListFind,
  'list.findIndex': ListFindIndex,
  'list.filter': ListFilter,
  'list.map': ListMap,
  'list.reduce': ListReduce,
  'list.every': ListEvery,
  'list.some': ListSome,
  'list.sort': ListSort,
  'list.reverse': ListReverse,
  'list.unique': ListUnique,
  'list.flatten': ListFlatten,
  'list.push': ListPush,
  'list.pop': ListPop,
  'list.shift': ListShift,
  'list.unshift': ListUnshift,
  'list.includes': ListIncludes,
  'list.indexOf': ListIndexOf,
  'list.at': ListAt,
  'list.groupBy': ListGroupBy,
};

export default listPluginClasses;
