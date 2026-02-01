/**
 * Workflow plugin: Type conversion and parsing operations.
 */

import { NodeExecutor, ExecuteInputs, ExecuteResult, createTemplateContext } from '../../base';
import { interpolateTemplate } from '../../../executor/ts/utils/template-engine';

const resolve = (value: any, ctx: any): any => {
  if (typeof value === 'string' && value.startsWith('{{')) {
    return interpolateTemplate(value, ctx);
  }
  return value;
};

export class ConvertToString implements NodeExecutor {
  readonly nodeType = 'convert.toString';
  readonly category = 'convert';
  readonly description = 'Convert value to string';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    let result: string;
    if (value === null || value === undefined) {
      result = '';
    } else if (typeof value === 'object') {
      result = JSON.stringify(value);
    } else {
      result = String(value);
    }
    return { result };
  }
}

export class ConvertToNumber implements NodeExecutor {
  readonly nodeType = 'convert.toNumber';
  readonly category = 'convert';
  readonly description = 'Convert value to number';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const defaultValue = inputs.node.parameters.default ?? 0;
    const result = Number(value);
    return { result: isNaN(result) ? defaultValue : result };
  }
}

export class ConvertToInteger implements NodeExecutor {
  readonly nodeType = 'convert.toInteger';
  readonly category = 'convert';
  readonly description = 'Convert value to integer (with optional radix)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const defaultValue = inputs.node.parameters.default ?? 0;
    const radix = inputs.node.parameters.radix ?? 10;
    const result = parseInt(String(value), radix);
    return { result: isNaN(result) ? defaultValue : result };
  }
}

export class ConvertToFloat implements NodeExecutor {
  readonly nodeType = 'convert.toFloat';
  readonly category = 'convert';
  readonly description = 'Convert value to floating point number';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const defaultValue = inputs.node.parameters.default ?? 0.0;
    const result = parseFloat(String(value));
    return { result: isNaN(result) ? defaultValue : result };
  }
}

export class ConvertToBoolean implements NodeExecutor {
  readonly nodeType = 'convert.toBoolean';
  readonly category = 'convert';
  readonly description = 'Convert value to boolean (handles "true", "1", "yes", "on")';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    let result: boolean;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      result = lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on';
    } else {
      result = Boolean(value);
    }
    return { result };
  }
}

export class ConvertToArray implements NodeExecutor {
  readonly nodeType = 'convert.toArray';
  readonly category = 'convert';
  readonly description = 'Convert value to array (parses JSON or splits by separator)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    let result: any[];
    if (Array.isArray(value)) {
      result = value;
    } else if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        result = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        const separator = inputs.node.parameters.separator ?? ',';
        result = value.split(separator).map(s => s.trim());
      }
    } else if (value === null || value === undefined) {
      result = [];
    } else if (typeof value === 'object') {
      result = Object.values(value);
    } else {
      result = [value];
    }
    return { result };
  }
}

export class ConvertToObject implements NodeExecutor {
  readonly nodeType = 'convert.toObject';
  readonly category = 'convert';
  readonly description = 'Convert value to object';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    let result: Record<string, any>;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result = value;
    } else if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        result = typeof parsed === 'object' && parsed !== null ? parsed : { value: parsed };
      } catch {
        result = { value };
      }
    } else if (Array.isArray(value)) {
      result = Object.fromEntries(value.map((v, i) => [String(i), v]));
    } else {
      result = { value };
    }
    return { result };
  }
}

export class ConvertParseJson implements NodeExecutor {
  readonly nodeType = 'convert.parseJson';
  readonly category = 'convert';
  readonly description = 'Parse JSON string to value';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const defaultValue = inputs.node.parameters.default ?? null;
    if (typeof value !== 'string') return { result: value };
    try {
      return { result: JSON.parse(value) };
    } catch {
      return { result: defaultValue };
    }
  }
}

export class ConvertToJson implements NodeExecutor {
  readonly nodeType = 'convert.toJson';
  readonly category = 'convert';
  readonly description = 'Stringify value to JSON (optionally pretty-printed)';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const pretty = inputs.node.parameters.pretty ?? false;
    const indent = pretty ? (inputs.node.parameters.indent ?? 2) : undefined;
    const result = JSON.stringify(value, null, indent);
    return { result };
  }
}

export class ConvertParseDate implements NodeExecutor {
  readonly nodeType = 'convert.parseDate';
  readonly category = 'convert';
  readonly description = 'Parse date string to ISO format';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { result: null, valid: false };
    }
    return {
      result: date.toISOString(),
      timestamp: date.getTime(),
      valid: true,
    };
  }
}

export class ConvertFormatDate implements NodeExecutor {
  readonly nodeType = 'convert.formatDate';
  readonly category = 'convert';
  readonly description = 'Format date to various string formats';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const format = inputs.node.parameters.format ?? 'iso';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return { result: null };
    }
    let result: string;
    switch (format) {
      case 'iso': result = date.toISOString(); break;
      case 'date': result = date.toDateString(); break;
      case 'time': result = date.toTimeString(); break;
      case 'locale': result = date.toLocaleString(); break;
      case 'localeDate': result = date.toLocaleDateString(); break;
      case 'localeTime': result = date.toLocaleTimeString(); break;
      case 'timestamp': result = String(date.getTime()); break;
      case 'unix': result = String(Math.floor(date.getTime() / 1000)); break;
      default: result = date.toISOString();
    }
    return { result };
  }
}

export class ConvertBase64Encode implements NodeExecutor {
  readonly nodeType = 'convert.base64Encode';
  readonly category = 'convert';
  readonly description = 'Encode value to Base64 string';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    const result = typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(str)))
      : Buffer.from(str).toString('base64');
    return { result };
  }
}

export class ConvertBase64Decode implements NodeExecutor {
  readonly nodeType = 'convert.base64Decode';
  readonly category = 'convert';
  readonly description = 'Decode Base64 string to value';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = resolve(inputs.node.parameters.value, ctx);
    const result = typeof atob !== 'undefined'
      ? decodeURIComponent(escape(atob(value)))
      : Buffer.from(value, 'base64').toString('utf-8');
    return { result };
  }
}

export class ConvertUrlEncode implements NodeExecutor {
  readonly nodeType = 'convert.urlEncode';
  readonly category = 'convert';
  readonly description = 'URL encode string';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value, ctx));
    const component = inputs.node.parameters.component ?? true;
    const result = component ? encodeURIComponent(value) : encodeURI(value);
    return { result };
  }
}

export class ConvertUrlDecode implements NodeExecutor {
  readonly nodeType = 'convert.urlDecode';
  readonly category = 'convert';
  readonly description = 'URL decode string';

  execute(inputs: ExecuteInputs): ExecuteResult {
    const ctx = createTemplateContext(inputs);
    const value = String(resolve(inputs.node.parameters.value, ctx));
    const component = inputs.node.parameters.component ?? true;
    const result = component ? decodeURIComponent(value) : decodeURI(value);
    return { result };
  }
}

// Export all convert plugin classes
export const convertPluginClasses = {
  'convert.toString': ConvertToString,
  'convert.toNumber': ConvertToNumber,
  'convert.toInteger': ConvertToInteger,
  'convert.toFloat': ConvertToFloat,
  'convert.toBoolean': ConvertToBoolean,
  'convert.toArray': ConvertToArray,
  'convert.toObject': ConvertToObject,
  'convert.parseJson': ConvertParseJson,
  'convert.toJson': ConvertToJson,
  'convert.parseDate': ConvertParseDate,
  'convert.formatDate': ConvertFormatDate,
  'convert.base64Encode': ConvertBase64Encode,
  'convert.base64Decode': ConvertBase64Decode,
  'convert.urlEncode': ConvertUrlEncode,
  'convert.urlDecode': ConvertUrlDecode,
};

export default convertPluginClasses;
