"use strict";
/**
 * Workflow plugin: Logical and comparison operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logicPluginClasses = exports.LogicCoalesce = exports.LogicTernary = exports.LogicTypeOf = exports.LogicIsEmpty = exports.LogicIsNull = exports.LogicBetween = exports.LogicIn = exports.LogicLte = exports.LogicLt = exports.LogicGte = exports.LogicGt = exports.LogicNotEquals = exports.LogicEquals = exports.LogicXor = exports.LogicNot = exports.LogicOr = exports.LogicAnd = void 0;
const base_1 = require("../../base");
const template_engine_1 = require("../../../executor/ts/utils/template-engine");
const resolve = (value, ctx) => {
    if (typeof value === 'string' && value.startsWith('{{')) {
        return (0, template_engine_1.interpolateTemplate)(value, ctx);
    }
    return value;
};
class LogicAnd {
    constructor() {
        this.nodeType = 'logic.and';
        this.category = 'logic';
        this.description = 'Logical AND - returns true if all values are truthy';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => Boolean(resolve(v, ctx)));
        return { result: values.every(v => v) };
    }
}
exports.LogicAnd = LogicAnd;
class LogicOr {
    constructor() {
        this.nodeType = 'logic.or';
        this.category = 'logic';
        this.description = 'Logical OR - returns true if any value is truthy';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => Boolean(resolve(v, ctx)));
        return { result: values.some(v => v) };
    }
}
exports.LogicOr = LogicOr;
class LogicNot {
    constructor() {
        this.nodeType = 'logic.not';
        this.category = 'logic';
        this.description = 'Logical NOT - inverts boolean value';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = Boolean(resolve(inputs.node.parameters.value, ctx));
        return { result: !value };
    }
}
exports.LogicNot = LogicNot;
class LogicXor {
    constructor() {
        this.nodeType = 'logic.xor';
        this.category = 'logic';
        this.description = 'Logical XOR - returns true if values are different';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = Boolean(resolve(inputs.node.parameters.a, ctx));
        const b = Boolean(resolve(inputs.node.parameters.b, ctx));
        return { result: a !== b };
    }
}
exports.LogicXor = LogicXor;
class LogicEquals {
    constructor() {
        this.nodeType = 'logic.equals';
        this.category = 'logic';
        this.description = 'Equality check (strict or loose comparison)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        const strict = inputs.node.parameters.strict ?? true;
        const result = strict ? a === b : a == b;
        return { result };
    }
}
exports.LogicEquals = LogicEquals;
class LogicNotEquals {
    constructor() {
        this.nodeType = 'logic.notEquals';
        this.category = 'logic';
        this.description = 'Inequality check (strict or loose comparison)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        const strict = inputs.node.parameters.strict ?? true;
        const result = strict ? a !== b : a != b;
        return { result };
    }
}
exports.LogicNotEquals = LogicNotEquals;
class LogicGt {
    constructor() {
        this.nodeType = 'logic.gt';
        this.category = 'logic';
        this.description = 'Greater than comparison';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        return { result: a > b };
    }
}
exports.LogicGt = LogicGt;
class LogicGte {
    constructor() {
        this.nodeType = 'logic.gte';
        this.category = 'logic';
        this.description = 'Greater than or equal comparison';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        return { result: a >= b };
    }
}
exports.LogicGte = LogicGte;
class LogicLt {
    constructor() {
        this.nodeType = 'logic.lt';
        this.category = 'logic';
        this.description = 'Less than comparison';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        return { result: a < b };
    }
}
exports.LogicLt = LogicLt;
class LogicLte {
    constructor() {
        this.nodeType = 'logic.lte';
        this.category = 'logic';
        this.description = 'Less than or equal comparison';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        return { result: a <= b };
    }
}
exports.LogicLte = LogicLte;
class LogicIn {
    constructor() {
        this.nodeType = 'logic.in';
        this.category = 'logic';
        this.description = 'Check if value is in array';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        return { result: Array.isArray(array) && array.includes(value) };
    }
}
exports.LogicIn = LogicIn;
class LogicBetween {
    constructor() {
        this.nodeType = 'logic.between';
        this.category = 'logic';
        this.description = 'Check if value is between min and max (inclusive or exclusive)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const min = resolve(inputs.node.parameters.min, ctx);
        const max = resolve(inputs.node.parameters.max, ctx);
        const inclusive = inputs.node.parameters.inclusive ?? true;
        const result = inclusive ? (value >= min && value <= max) : (value > min && value < max);
        return { result };
    }
}
exports.LogicBetween = LogicBetween;
class LogicIsNull {
    constructor() {
        this.nodeType = 'logic.isNull';
        this.category = 'logic';
        this.description = 'Check if value is null or undefined';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        return { result: value === null || value === undefined };
    }
}
exports.LogicIsNull = LogicIsNull;
class LogicIsEmpty {
    constructor() {
        this.nodeType = 'logic.isEmpty';
        this.category = 'logic';
        this.description = 'Check if value is empty (null, undefined, empty string, empty array, empty object)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        let isEmpty = false;
        if (value === null || value === undefined)
            isEmpty = true;
        else if (typeof value === 'string')
            isEmpty = value.length === 0;
        else if (Array.isArray(value))
            isEmpty = value.length === 0;
        else if (typeof value === 'object')
            isEmpty = Object.keys(value).length === 0;
        return { result: isEmpty };
    }
}
exports.LogicIsEmpty = LogicIsEmpty;
class LogicTypeOf {
    constructor() {
        this.nodeType = 'logic.typeOf';
        this.category = 'logic';
        this.description = 'Get type of value (string, number, boolean, array, object, null, undefined)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        let type;
        if (value === null)
            type = 'null';
        else if (Array.isArray(value))
            type = 'array';
        else
            type = typeof value;
        return { result: type };
    }
}
exports.LogicTypeOf = LogicTypeOf;
class LogicTernary {
    constructor() {
        this.nodeType = 'logic.ternary';
        this.category = 'logic';
        this.description = 'Ternary conditional - returns then value if condition is truthy, else value otherwise';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const condition = Boolean(resolve(inputs.node.parameters.condition, ctx));
        const thenValue = resolve(inputs.node.parameters.then, ctx);
        const elseValue = resolve(inputs.node.parameters.else, ctx);
        return { result: condition ? thenValue : elseValue };
    }
}
exports.LogicTernary = LogicTernary;
class LogicCoalesce {
    constructor() {
        this.nodeType = 'logic.coalesce';
        this.category = 'logic';
        this.description = 'Return first non-null/undefined value from list';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => resolve(v, ctx));
        const result = values.find(v => v !== null && v !== undefined) ?? null;
        return { result };
    }
}
exports.LogicCoalesce = LogicCoalesce;
// Export all logic plugin classes
exports.logicPluginClasses = {
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
exports.default = exports.logicPluginClasses;
//# sourceMappingURL=index.js.map