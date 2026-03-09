"use strict";
/**
 * Workflow plugin: String manipulation operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringPluginClasses = exports.StringPadEnd = exports.StringPadStart = exports.StringEndsWith = exports.StringStartsWith = exports.StringIncludes = exports.StringSubstring = exports.StringJoin = exports.StringSplit = exports.StringReplace = exports.StringTrim = exports.StringUpper = exports.StringLower = exports.StringLength = exports.StringFormat = exports.StringConcat = void 0;
const base_1 = require("../../base");
const template_engine_1 = require("../../../executor/ts/utils/template-engine");
const resolve = (value, ctx) => {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        return (0, template_engine_1.interpolateTemplate)(value, ctx);
    }
    return value;
};
class StringConcat {
    constructor() {
        this.nodeType = 'string.concat';
        this.category = 'string';
        this.description = 'Concatenate multiple strings with an optional separator';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => resolve(v, ctx));
        const separator = resolve(inputs.node.parameters.separator ?? '', ctx);
        return { result: values.join(separator) };
    }
}
exports.StringConcat = StringConcat;
class StringFormat {
    constructor() {
        this.nodeType = 'string.format';
        this.category = 'string';
        this.description = 'Format string with variables using {key} placeholders';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const template = resolve(inputs.node.parameters.template || '', ctx);
        const variables = inputs.node.parameters.variables || {};
        const result = template.replace(/\{(\w+)\}/g, (_, key) => variables[key] !== undefined ? String(variables[key]) : `{${key}}`);
        return { result };
    }
}
exports.StringFormat = StringFormat;
class StringLength {
    constructor() {
        this.nodeType = 'string.length';
        this.category = 'string';
        this.description = 'Get the length of a string';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        return { result: value.length };
    }
}
exports.StringLength = StringLength;
class StringLower {
    constructor() {
        this.nodeType = 'string.lower';
        this.category = 'string';
        this.description = 'Convert string to lowercase';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        return { result: value.toLowerCase() };
    }
}
exports.StringLower = StringLower;
class StringUpper {
    constructor() {
        this.nodeType = 'string.upper';
        this.category = 'string';
        this.description = 'Convert string to uppercase';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        return { result: value.toUpperCase() };
    }
}
exports.StringUpper = StringUpper;
class StringTrim {
    constructor() {
        this.nodeType = 'string.trim';
        this.category = 'string';
        this.description = 'Trim whitespace from string (both ends, start only, or end only)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        const mode = inputs.node.parameters.mode || 'both';
        let result;
        switch (mode) {
            case 'start':
                result = value.trimStart();
                break;
            case 'end':
                result = value.trimEnd();
                break;
            default: result = value.trim();
        }
        return { result };
    }
}
exports.StringTrim = StringTrim;
class StringReplace {
    constructor() {
        this.nodeType = 'string.replace';
        this.category = 'string';
        this.description = 'Replace substring in string (single or all occurrences)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
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
exports.StringReplace = StringReplace;
class StringSplit {
    constructor() {
        this.nodeType = 'string.split';
        this.category = 'string';
        this.description = 'Split string into array by separator';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        const separator = resolve(inputs.node.parameters.separator ?? ',', ctx);
        const limit = inputs.node.parameters.limit;
        const result = limit ? value.split(separator, limit) : value.split(separator);
        return { result };
    }
}
exports.StringSplit = StringSplit;
class StringJoin {
    constructor() {
        this.nodeType = 'string.join';
        this.category = 'string';
        this.description = 'Join array elements into string with separator';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = resolve(inputs.node.parameters.values || [], ctx);
        const separator = resolve(inputs.node.parameters.separator ?? ',', ctx);
        const result = Array.isArray(values) ? values.join(separator) : String(values);
        return { result };
    }
}
exports.StringJoin = StringJoin;
class StringSubstring {
    constructor() {
        this.nodeType = 'string.substring';
        this.category = 'string';
        this.description = 'Extract substring from string by start and end index';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        const startIdx = inputs.node.parameters.start ?? 0;
        const endIdx = inputs.node.parameters.end;
        const result = endIdx !== undefined ? value.substring(startIdx, endIdx) : value.substring(startIdx);
        return { result };
    }
}
exports.StringSubstring = StringSubstring;
class StringIncludes {
    constructor() {
        this.nodeType = 'string.includes';
        this.category = 'string';
        this.description = 'Check if string contains a substring';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        const search = String(resolve(inputs.node.parameters.search || '', ctx));
        return { result: value.includes(search) };
    }
}
exports.StringIncludes = StringIncludes;
class StringStartsWith {
    constructor() {
        this.nodeType = 'string.startsWith';
        this.category = 'string';
        this.description = 'Check if string starts with a prefix';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        const prefix = String(resolve(inputs.node.parameters.prefix || '', ctx));
        return { result: value.startsWith(prefix) };
    }
}
exports.StringStartsWith = StringStartsWith;
class StringEndsWith {
    constructor() {
        this.nodeType = 'string.endsWith';
        this.category = 'string';
        this.description = 'Check if string ends with a suffix';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        const suffix = String(resolve(inputs.node.parameters.suffix || '', ctx));
        return { result: value.endsWith(suffix) };
    }
}
exports.StringEndsWith = StringEndsWith;
class StringPadStart {
    constructor() {
        this.nodeType = 'string.padStart';
        this.category = 'string';
        this.description = 'Pad string at the start to reach target length';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        const length = inputs.node.parameters.length || value.length;
        const fillString = resolve(inputs.node.parameters.fillString ?? ' ', ctx);
        return { result: value.padStart(length, fillString) };
    }
}
exports.StringPadStart = StringPadStart;
class StringPadEnd {
    constructor() {
        this.nodeType = 'string.padEnd';
        this.category = 'string';
        this.description = 'Pad string at the end to reach target length';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value || '', ctx));
        const length = inputs.node.parameters.length || value.length;
        const fillString = resolve(inputs.node.parameters.fillString ?? ' ', ctx);
        return { result: value.padEnd(length, fillString) };
    }
}
exports.StringPadEnd = StringPadEnd;
// Export all string plugin classes
exports.stringPluginClasses = {
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
exports.default = exports.stringPluginClasses;
//# sourceMappingURL=index.js.map