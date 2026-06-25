/**
 * Workflow plugin: String manipulation operations.
 */

import { NodeExecutor, ExecuteInputs, ExecuteResult, createTemplateContext } from '../../base';
import { interpolateTemplate } from '../../../../executor/ts/utils/template-engine';

const resolve = (value: any, ctx: any): any => {
  if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
    return interpolateTemplate(value, ctx);
  }
  return value;
};

export class StringConcat implements NodeExecutor {
  readonly nodeType = 'string.concat';
  readonly category = 'string';
  readonly description = 'Concatenate multiple strings with an optional separator';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = (inputs.node.parameters.values || []).map((v: any) => resolve(v, ctx));
    const separator = resolve(inputs.node.parameters.separator ?? '', ctx);
    return { result: values.join(separator) };
  }
}

export class StringFormat implements NodeExecutor {
  readonly nodeType = 'string.format';
  readonly category = 'string';
  readonly description = 'Format string with variables using {key} placeholders';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const template = resolve(inputs.node.parameters.template || '', ctx);
    const variables = inputs.node.parameters.variables || {};
    const result = template.replace(/\{(\w+)\}/g, (_: string, key: string) =>
      variables[key] !== undefined ? String(variables[key]) : `{${key}}`
    );
    return { result };
  }
}

export class StringLength implements NodeExecutor {
  readonly nodeType = 'string.length';
  readonly category = 'string';
  readonly description = 'Get the length of a string';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    return { result: value.length };
  }
}

export class StringLower implements NodeExecutor {
  readonly nodeType = 'string.lower';
  readonly category = 'string';
  readonly description = 'Convert string to lowercase';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    return { result: value.toLowerCase() };
  }
}

export class StringUpper implements NodeExecutor {
  readonly nodeType = 'string.upper';
  readonly category = 'string';
  readonly description = 'Convert string to uppercase';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    return { result: value.toUpperCase() };
  }
}

export class StringTrim implements NodeExecutor {
  readonly nodeType = 'string.trim';
  readonly category = 'string';
  readonly description = 'Trim whitespace from string (both ends, start only, or end only)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const mode = inputs.node.parameters.mode || 'both';
    let result: string;
    switch (mode) {
      case 'start': result = value.trimStart(); break;
      case 'end': result = value.trimEnd(); break;
      default: result = value.trim();
    }
    return { result };
  }
}

export class StringReplace implements NodeExecutor {
  readonly nodeType = 'string.replace';
  readonly category = 'string';
  readonly description = 'Replace substring in string (single or all occurrences)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const search = resolve(inputs.node.parameters.search || '', ctx);
    const replacement = resolve(inputs.node.parameters.replacement ?? '', ctx);
    const all = inputs.node.parameters.all ?? false;
    const result = all
      ? value.replaceAll(search, replacement)
      : value.replace(search, replacement);
    return { result };
  }
}

export class StringSplit implements NodeExecutor {
  readonly nodeType = 'string.split';
  readonly category = 'string';
  readonly description = 'Split string into array by separator';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const separator = resolve(inputs.node.parameters.separator ?? ',', ctx);
    const limit = inputs.node.parameters.limit;
    const result = limit ? value.split(separator, limit) : value.split(separator);
    return { result };
  }
}

export class StringJoin implements NodeExecutor {
  readonly nodeType = 'string.join';
  readonly category = 'string';
  readonly description = 'Join array elements into string with separator';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const values = resolve(inputs.node.parameters.values || [], ctx);
    const separator = resolve(inputs.node.parameters.separator ?? ',', ctx);
    const result = Array.isArray(values) ? values.join(separator) : String(values);
    return { result };
  }
}

export class StringSubstring implements NodeExecutor {
  readonly nodeType = 'string.substring';
  readonly category = 'string';
  readonly description = 'Extract substring from string by start and end index';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const startIdx = inputs.node.parameters.start ?? 0;
    const endIdx = inputs.node.parameters.end;
    const result = endIdx !== undefined ? value.substring(startIdx, endIdx) : value.substring(startIdx);
    return { result };
  }
}

export class StringIncludes implements NodeExecutor {
  readonly nodeType = 'string.includes';
  readonly category = 'string';
  readonly description = 'Check if string contains a substring';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const search = String(resolve(inputs.node.parameters.search || '', ctx));
    return { result: value.includes(search) };
  }
}

export class StringStartsWith implements NodeExecutor {
  readonly nodeType = 'string.startsWith';
  readonly category = 'string';
  readonly description = 'Check if string starts with a prefix';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const prefix = String(resolve(inputs.node.parameters.prefix || '', ctx));
    return { result: value.startsWith(prefix) };
  }
}

export class StringEndsWith implements NodeExecutor {
  readonly nodeType = 'string.endsWith';
  readonly category = 'string';
  readonly description = 'Check if string ends with a suffix';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const suffix = String(resolve(inputs.node.parameters.suffix || '', ctx));
    return { result: value.endsWith(suffix) };
  }
}

export class StringPadStart implements NodeExecutor {
  readonly nodeType = 'string.padStart';
  readonly category = 'string';
  readonly description = 'Pad string at the start to reach target length';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const length = inputs.node.parameters.length || value.length;
    const fillString = resolve(inputs.node.parameters.fillString ?? ' ', ctx);
    return { result: value.padStart(length, fillString) };
  }
}

export class StringPadEnd implements NodeExecutor {
  readonly nodeType = 'string.padEnd';
  readonly category = 'string';
  readonly description = 'Pad string at the end to reach target length';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value || '', ctx));
    const length = inputs.node.parameters.length || value.length;
    const fillString = resolve(inputs.node.parameters.fillString ?? ' ', ctx);
    return { result: value.padEnd(length, fillString) };
  }
}

// Export all string plugin classes
export const stringPluginClasses = {
  'string.concat': StringConcat,
  'string.format': StringFormat,
  'string.length': StringLength,
  'string.lower': StringLower,
  'string.upper': StringUpper,
  'string.trim': StringTrim,
  'string.replace': StringReplace,
  'string.split': StringSplit,
  'string.join': StringJoin,
  'string.substring': StringSubstring,
  'string.includes': StringIncludes,
  'string.startsWith': StringStartsWith,
  'string.endsWith': StringEndsWith,
  'string.padStart': StringPadStart,
  'string.padEnd': StringPadEnd,
};

export default stringPluginClasses;
