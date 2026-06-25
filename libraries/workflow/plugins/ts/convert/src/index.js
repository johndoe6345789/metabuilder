"use strict";
/**
 * Workflow plugin: Type conversion and parsing operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPluginClasses = exports.ConvertUrlDecode = exports.ConvertUrlEncode = exports.ConvertBase64Decode = exports.ConvertBase64Encode = exports.ConvertFormatDate = exports.ConvertParseDate = exports.ConvertToJson = exports.ConvertParseJson = exports.ConvertToObject = exports.ConvertToArray = exports.ConvertToBoolean = exports.ConvertToFloat = exports.ConvertToInteger = exports.ConvertToNumber = exports.ConvertToString = void 0;
const base_1 = require("../../base");
const template_engine_1 = require("../../../executor/ts/utils/template-engine");
const resolve = (value, ctx) => {
    if (typeof value === 'string' && value.startsWith('{{')) {
        return (0, template_engine_1.interpolateTemplate)(value, ctx);
    }
    return value;
};
class ConvertToString {
    constructor() {
        this.nodeType = 'convert.toString';
        this.category = 'convert';
        this.description = 'Convert value to string';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        let result;
        if (value === null || value === undefined) {
            result = '';
        }
        else if (typeof value === 'object') {
            result = JSON.stringify(value);
        }
        else {
            result = String(value);
        }
        return { result };
    }
}
exports.ConvertToString = ConvertToString;
class ConvertToNumber {
    constructor() {
        this.nodeType = 'convert.toNumber';
        this.category = 'convert';
        this.description = 'Convert value to number';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const defaultValue = inputs.node.parameters.default ?? 0;
        const result = Number(value);
        return { result: isNaN(result) ? defaultValue : result };
    }
}
exports.ConvertToNumber = ConvertToNumber;
class ConvertToInteger {
    constructor() {
        this.nodeType = 'convert.toInteger';
        this.category = 'convert';
        this.description = 'Convert value to integer (with optional radix)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const defaultValue = inputs.node.parameters.default ?? 0;
        const radix = inputs.node.parameters.radix ?? 10;
        const result = parseInt(String(value), radix);
        return { result: isNaN(result) ? defaultValue : result };
    }
}
exports.ConvertToInteger = ConvertToInteger;
class ConvertToFloat {
    constructor() {
        this.nodeType = 'convert.toFloat';
        this.category = 'convert';
        this.description = 'Convert value to floating point number';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const defaultValue = inputs.node.parameters.default ?? 0.0;
        const result = parseFloat(String(value));
        return { result: isNaN(result) ? defaultValue : result };
    }
}
exports.ConvertToFloat = ConvertToFloat;
class ConvertToBoolean {
    constructor() {
        this.nodeType = 'convert.toBoolean';
        this.category = 'convert';
        this.description = 'Convert value to boolean (handles "true", "1", "yes", "on")';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        let result;
        if (typeof value === 'string') {
            const lower = value.toLowerCase().trim();
            result = lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on';
        }
        else {
            result = Boolean(value);
        }
        return { result };
    }
}
exports.ConvertToBoolean = ConvertToBoolean;
class ConvertToArray {
    constructor() {
        this.nodeType = 'convert.toArray';
        this.category = 'convert';
        this.description = 'Convert value to array (parses JSON or splits by separator)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        let result;
        if (Array.isArray(value)) {
            result = value;
        }
        else if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                result = Array.isArray(parsed) ? parsed : [parsed];
            }
            catch {
                const separator = inputs.node.parameters.separator ?? ',';
                result = value.split(separator).map(s => s.trim());
            }
        }
        else if (value === null || value === undefined) {
            result = [];
        }
        else if (typeof value === 'object') {
            result = Object.values(value);
        }
        else {
            result = [value];
        }
        return { result };
    }
}
exports.ConvertToArray = ConvertToArray;
class ConvertToObject {
    constructor() {
        this.nodeType = 'convert.toObject';
        this.category = 'convert';
        this.description = 'Convert value to object';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        let result;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result = value;
        }
        else if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                result = typeof parsed === 'object' && parsed !== null ? parsed : { value: parsed };
            }
            catch {
                result = { value };
            }
        }
        else if (Array.isArray(value)) {
            result = Object.fromEntries(value.map((v, i) => [String(i), v]));
        }
        else {
            result = { value };
        }
        return { result };
    }
}
exports.ConvertToObject = ConvertToObject;
class ConvertParseJson {
    constructor() {
        this.nodeType = 'convert.parseJson';
        this.category = 'convert';
        this.description = 'Parse JSON string to value';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const defaultValue = inputs.node.parameters.default ?? null;
        if (typeof value !== 'string')
            return { result: value };
        try {
            return { result: JSON.parse(value) };
        }
        catch {
            return { result: defaultValue };
        }
    }
}
exports.ConvertParseJson = ConvertParseJson;
class ConvertToJson {
    constructor() {
        this.nodeType = 'convert.toJson';
        this.category = 'convert';
        this.description = 'Stringify value to JSON (optionally pretty-printed)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const pretty = inputs.node.parameters.pretty ?? false;
        const indent = pretty ? (inputs.node.parameters.indent ?? 2) : undefined;
        const result = JSON.stringify(value, null, indent);
        return { result };
    }
}
exports.ConvertToJson = ConvertToJson;
class ConvertParseDate {
    constructor() {
        this.nodeType = 'convert.parseDate';
        this.category = 'convert';
        this.description = 'Parse date string to ISO format';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
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
exports.ConvertParseDate = ConvertParseDate;
class ConvertFormatDate {
    constructor() {
        this.nodeType = 'convert.formatDate';
        this.category = 'convert';
        this.description = 'Format date to various string formats';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const format = inputs.node.parameters.format ?? 'iso';
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            return { result: null };
        }
        let result;
        switch (format) {
            case 'iso':
                result = date.toISOString();
                break;
            case 'date':
                result = date.toDateString();
                break;
            case 'time':
                result = date.toTimeString();
                break;
            case 'locale':
                result = date.toLocaleString();
                break;
            case 'localeDate':
                result = date.toLocaleDateString();
                break;
            case 'localeTime':
                result = date.toLocaleTimeString();
                break;
            case 'timestamp':
                result = String(date.getTime());
                break;
            case 'unix':
                result = String(Math.floor(date.getTime() / 1000));
                break;
            default: result = date.toISOString();
        }
        return { result };
    }
}
exports.ConvertFormatDate = ConvertFormatDate;
class ConvertBase64Encode {
    constructor() {
        this.nodeType = 'convert.base64Encode';
        this.category = 'convert';
        this.description = 'Encode value to Base64 string';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const str = typeof value === 'string' ? value : JSON.stringify(value);
        const result = typeof btoa !== 'undefined'
            ? btoa(unescape(encodeURIComponent(str)))
            : Buffer.from(str).toString('base64');
        return { result };
    }
}
exports.ConvertBase64Encode = ConvertBase64Encode;
class ConvertBase64Decode {
    constructor() {
        this.nodeType = 'convert.base64Decode';
        this.category = 'convert';
        this.description = 'Decode Base64 string to value';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const result = typeof atob !== 'undefined'
            ? decodeURIComponent(escape(atob(value)))
            : Buffer.from(value, 'base64').toString('utf-8');
        return { result };
    }
}
exports.ConvertBase64Decode = ConvertBase64Decode;
class ConvertUrlEncode {
    constructor() {
        this.nodeType = 'convert.urlEncode';
        this.category = 'convert';
        this.description = 'URL encode string';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value, ctx));
        const component = inputs.node.parameters.component ?? true;
        const result = component ? encodeURIComponent(value) : encodeURI(value);
        return { result };
    }
}
exports.ConvertUrlEncode = ConvertUrlEncode;
class ConvertUrlDecode {
    constructor() {
        this.nodeType = 'convert.urlDecode';
        this.category = 'convert';
        this.description = 'URL decode string';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = String(resolve(inputs.node.parameters.value, ctx));
        const component = inputs.node.parameters.component ?? true;
        const result = component ? decodeURIComponent(value) : decodeURI(value);
        return { result };
    }
}
exports.ConvertUrlDecode = ConvertUrlDecode;
// Export all convert plugin classes
exports.convertPluginClasses = {
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
exports.default = exports.convertPluginClasses;
//# sourceMappingURL=index.js.map