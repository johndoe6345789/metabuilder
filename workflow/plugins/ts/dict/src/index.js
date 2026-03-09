"use strict";
/**
 * Workflow plugin: Object/dictionary operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dictPluginClasses = exports.DictFilterEntries = exports.DictMapValues = exports.DictInvert = exports.DictSize = exports.DictHas = exports.DictOmit = exports.DictPick = exports.DictDeepMerge = exports.DictMerge = exports.DictFromEntries = exports.DictEntries = exports.DictValues = exports.DictKeys = exports.DictDelete = exports.DictSet = exports.DictGet = void 0;
const base_1 = require("../../base");
const template_engine_1 = require("../../../executor/ts/utils/template-engine");
const resolve = (value, ctx) => {
    if (typeof value === 'string' && value.startsWith('{{')) {
        return (0, template_engine_1.interpolateTemplate)(value, ctx);
    }
    return value;
};
/**
 * Check if a key is a prototype-polluting key that should be rejected.
 * Prevents prototype pollution attacks where attackers inject __proto__,
 * constructor, or prototype keys to modify Object.prototype.
 */
const isPrototypePollutingKey = (key) => {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
};
/**
 * Safely assign a value to an object, rejecting prototype-polluting keys.
 * @throws Error if key is a prototype-polluting key
 */
const safeAssign = (obj, key, value) => {
    if (isPrototypePollutingKey(key)) {
        throw new Error(`Prototype-polluting key "${key}" is not allowed`);
    }
    obj[key] = value;
};
class DictGet {
    constructor() {
        this.nodeType = 'dict.get';
        this.category = 'dict';
        this.description = 'Get value by key (supports nested dot notation paths)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        const path = resolve(inputs.node.parameters.path, ctx);
        const defaultValue = resolve(inputs.node.parameters.default, ctx);
        if (typeof obj !== 'object' || obj === null)
            return { result: defaultValue };
        const keys = String(path).split('.');
        let result = obj;
        for (const key of keys) {
            if (result === null || result === undefined)
                break;
            result = result[key];
        }
        return { result: result ?? defaultValue };
    }
}
exports.DictGet = DictGet;
class DictSet {
    constructor() {
        this.nodeType = 'dict.set';
        this.category = 'dict';
        this.description = 'Set value by key (supports nested paths, returns new object)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        const path = resolve(inputs.node.parameters.path, ctx);
        const value = resolve(inputs.node.parameters.value, ctx);
        if (typeof obj !== 'object' || obj === null)
            throw new Error('Object is required');
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
exports.DictSet = DictSet;
class DictDelete {
    constructor() {
        this.nodeType = 'dict.delete';
        this.category = 'dict';
        this.description = 'Delete key from object (returns new object)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        const key = resolve(inputs.node.parameters.key, ctx);
        if (typeof obj !== 'object' || obj === null)
            return { result: {} };
        if (isPrototypePollutingKey(key)) {
            throw new Error(`Prototype-polluting key "${key}" is not allowed`);
        }
        const result = { ...obj };
        delete result[key];
        return { result };
    }
}
exports.DictDelete = DictDelete;
class DictKeys {
    constructor() {
        this.nodeType = 'dict.keys';
        this.category = 'dict';
        this.description = 'Get all keys from object as array';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        if (typeof obj !== 'object' || obj === null)
            return { result: [] };
        return { result: Object.keys(obj) };
    }
}
exports.DictKeys = DictKeys;
class DictValues {
    constructor() {
        this.nodeType = 'dict.values';
        this.category = 'dict';
        this.description = 'Get all values from object as array';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        if (typeof obj !== 'object' || obj === null)
            return { result: [] };
        return { result: Object.values(obj) };
    }
}
exports.DictValues = DictValues;
class DictEntries {
    constructor() {
        this.nodeType = 'dict.entries';
        this.category = 'dict';
        this.description = 'Get all entries as [key, value] pairs array';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        if (typeof obj !== 'object' || obj === null)
            return { result: [] };
        return { result: Object.entries(obj) };
    }
}
exports.DictEntries = DictEntries;
class DictFromEntries {
    constructor() {
        this.nodeType = 'dict.fromEntries';
        this.category = 'dict';
        this.description = 'Create object from [key, value] entries array';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const entries = resolve(inputs.node.parameters.entries, ctx) || [];
        if (!Array.isArray(entries))
            return { result: {} };
        return { result: Object.fromEntries(entries) };
    }
}
exports.DictFromEntries = DictFromEntries;
class DictMerge {
    constructor() {
        this.nodeType = 'dict.merge';
        this.category = 'dict';
        this.description = 'Shallow merge multiple objects';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const objects = (inputs.node.parameters.objects || []).map((o) => resolve(o, ctx) || {});
        const result = Object.assign({}, ...objects);
        return { result };
    }
}
exports.DictMerge = DictMerge;
class DictDeepMerge {
    constructor() {
        this.nodeType = 'dict.deepMerge';
        this.category = 'dict';
        this.description = 'Deep merge multiple objects (recursive)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const objects = (inputs.node.parameters.objects || []).map((o) => resolve(o, ctx) || {});
        const deepMerge = (target, source) => {
            const result = { ...target };
            for (const key of Object.keys(source)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = deepMerge(result[key] || {}, source[key]);
                }
                else {
                    result[key] = source[key];
                }
            }
            return result;
        };
        const result = objects.reduce((acc, obj) => deepMerge(acc, obj), {});
        return { result };
    }
}
exports.DictDeepMerge = DictDeepMerge;
class DictPick {
    constructor() {
        this.nodeType = 'dict.pick';
        this.category = 'dict';
        this.description = 'Pick specific keys from object';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        const keys = resolve(inputs.node.parameters.keys, ctx) || [];
        if (typeof obj !== 'object' || obj === null)
            return { result: {} };
        const result = {};
        for (const key of keys) {
            if (isPrototypePollutingKey(key)) {
                throw new Error(`Prototype-polluting key "${key}" is not allowed`);
            }
            if (key in obj)
                result[key] = obj[key];
        }
        return { result };
    }
}
exports.DictPick = DictPick;
class DictOmit {
    constructor() {
        this.nodeType = 'dict.omit';
        this.category = 'dict';
        this.description = 'Omit specific keys from object';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        const keys = resolve(inputs.node.parameters.keys, ctx) || [];
        if (typeof obj !== 'object' || obj === null)
            return { result: {} };
        const omitSet = new Set(keys);
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (!omitSet.has(key))
                result[key] = value;
        }
        return { result };
    }
}
exports.DictOmit = DictOmit;
class DictHas {
    constructor() {
        this.nodeType = 'dict.has';
        this.category = 'dict';
        this.description = 'Check if key exists in object';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        const key = resolve(inputs.node.parameters.key, ctx);
        if (typeof obj !== 'object' || obj === null)
            return { result: false };
        return { result: key in obj };
    }
}
exports.DictHas = DictHas;
class DictSize {
    constructor() {
        this.nodeType = 'dict.size';
        this.category = 'dict';
        this.description = 'Get number of keys in object';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        if (typeof obj !== 'object' || obj === null)
            return { result: 0 };
        return { result: Object.keys(obj).length };
    }
}
exports.DictSize = DictSize;
class DictInvert {
    constructor() {
        this.nodeType = 'dict.invert';
        this.category = 'dict';
        this.description = 'Swap keys and values in object';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        if (typeof obj !== 'object' || obj === null)
            return { result: {} };
        const result = {};
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
exports.DictInvert = DictInvert;
class DictMapValues {
    constructor() {
        this.nodeType = 'dict.mapValues';
        this.category = 'dict';
        this.description = 'Transform all values using a template';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        const transform = inputs.node.parameters.transform;
        if (typeof obj !== 'object' || obj === null)
            return { result: {} };
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const evalCtx = { ...ctx, key, value, $key: key, $value: value };
            result[key] = (0, template_engine_1.interpolateTemplate)(transform, evalCtx);
        }
        return { result };
    }
}
exports.DictMapValues = DictMapValues;
class DictFilterEntries {
    constructor() {
        this.nodeType = 'dict.filterEntries';
        this.category = 'dict';
        this.description = 'Filter object entries by a condition';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const obj = resolve(inputs.node.parameters.object, ctx) || {};
        const condition = inputs.node.parameters.condition;
        if (typeof obj !== 'object' || obj === null)
            return { result: {} };
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const evalCtx = { ...ctx, key, value, $key: key, $value: value };
            if ((0, template_engine_1.evaluateTemplate)(condition, evalCtx)) {
                result[key] = value;
            }
        }
        return { result };
    }
}
exports.DictFilterEntries = DictFilterEntries;
// Export all dict plugin classes
exports.dictPluginClasses = {
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
exports.default = exports.dictPluginClasses;
//# sourceMappingURL=index.js.map