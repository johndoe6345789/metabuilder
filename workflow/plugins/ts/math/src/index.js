"use strict";
/**
 * Workflow plugin: Mathematical operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mathPluginClasses = exports.MathClamp = exports.MathRandom = exports.MathAverage = exports.MathSum = exports.MathMax = exports.MathMin = exports.MathCeil = exports.MathFloor = exports.MathRound = exports.MathAbs = exports.MathSqrt = exports.MathPower = exports.MathModulo = exports.MathDivide = exports.MathMultiply = exports.MathSubtract = exports.MathAdd = void 0;
const base_1 = require("../../base");
const template_engine_1 = require("../../../executor/ts/utils/template-engine");
const resolve = (value, ctx) => {
    if (typeof value === 'string' && value.startsWith('{{')) {
        value = (0, template_engine_1.interpolateTemplate)(value, ctx);
    }
    return Number(value);
};
class MathAdd {
    constructor() {
        this.nodeType = 'math.add';
        this.category = 'math';
        this.description = 'Add multiple numbers together';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => resolve(v, ctx));
        const result = values.reduce((sum, val) => sum + val, 0);
        return { result };
    }
}
exports.MathAdd = MathAdd;
class MathSubtract {
    constructor() {
        this.nodeType = 'math.subtract';
        this.category = 'math';
        this.description = 'Subtract one number from another';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        return { result: a - b };
    }
}
exports.MathSubtract = MathSubtract;
class MathMultiply {
    constructor() {
        this.nodeType = 'math.multiply';
        this.category = 'math';
        this.description = 'Multiply multiple numbers together';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => resolve(v, ctx));
        const result = values.reduce((prod, val) => prod * val, 1);
        return { result };
    }
}
exports.MathMultiply = MathMultiply;
class MathDivide {
    constructor() {
        this.nodeType = 'math.divide';
        this.category = 'math';
        this.description = 'Divide one number by another';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        if (b === 0)
            throw new Error('Division by zero');
        return { result: a / b };
    }
}
exports.MathDivide = MathDivide;
class MathModulo {
    constructor() {
        this.nodeType = 'math.modulo';
        this.category = 'math';
        this.description = 'Get the remainder of division (modulo operation)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const a = resolve(inputs.node.parameters.a, ctx);
        const b = resolve(inputs.node.parameters.b, ctx);
        if (b === 0)
            throw new Error('Modulo by zero');
        return { result: a % b };
    }
}
exports.MathModulo = MathModulo;
class MathPower {
    constructor() {
        this.nodeType = 'math.power';
        this.category = 'math';
        this.description = 'Raise a number to a power (exponentiation)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const base = resolve(inputs.node.parameters.base, ctx);
        const exponent = resolve(inputs.node.parameters.exponent, ctx);
        return { result: Math.pow(base, exponent) };
    }
}
exports.MathPower = MathPower;
class MathSqrt {
    constructor() {
        this.nodeType = 'math.sqrt';
        this.category = 'math';
        this.description = 'Calculate the square root of a number';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        if (value < 0)
            throw new Error('Cannot calculate square root of negative number');
        return { result: Math.sqrt(value) };
    }
}
exports.MathSqrt = MathSqrt;
class MathAbs {
    constructor() {
        this.nodeType = 'math.abs';
        this.category = 'math';
        this.description = 'Get the absolute value of a number';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        return { result: Math.abs(value) };
    }
}
exports.MathAbs = MathAbs;
class MathRound {
    constructor() {
        this.nodeType = 'math.round';
        this.category = 'math';
        this.description = 'Round a number to specified decimal places';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const decimals = inputs.node.parameters.decimals ?? 0;
        const factor = Math.pow(10, decimals);
        return { result: Math.round(value * factor) / factor };
    }
}
exports.MathRound = MathRound;
class MathFloor {
    constructor() {
        this.nodeType = 'math.floor';
        this.category = 'math';
        this.description = 'Round a number down to the nearest integer';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        return { result: Math.floor(value) };
    }
}
exports.MathFloor = MathFloor;
class MathCeil {
    constructor() {
        this.nodeType = 'math.ceil';
        this.category = 'math';
        this.description = 'Round a number up to the nearest integer';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        return { result: Math.ceil(value) };
    }
}
exports.MathCeil = MathCeil;
class MathMin {
    constructor() {
        this.nodeType = 'math.min';
        this.category = 'math';
        this.description = 'Get the minimum value from a list of numbers';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => resolve(v, ctx));
        return { result: Math.min(...values) };
    }
}
exports.MathMin = MathMin;
class MathMax {
    constructor() {
        this.nodeType = 'math.max';
        this.category = 'math';
        this.description = 'Get the maximum value from a list of numbers';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => resolve(v, ctx));
        return { result: Math.max(...values) };
    }
}
exports.MathMax = MathMax;
class MathSum {
    constructor() {
        this.nodeType = 'math.sum';
        this.category = 'math';
        this.description = 'Calculate the sum of a list of numbers';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => resolve(v, ctx));
        return { result: values.reduce((a, b) => a + b, 0) };
    }
}
exports.MathSum = MathSum;
class MathAverage {
    constructor() {
        this.nodeType = 'math.average';
        this.category = 'math';
        this.description = 'Calculate the average of a list of numbers';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const values = (inputs.node.parameters.values || []).map((v) => resolve(v, ctx));
        if (values.length === 0)
            return { result: 0 };
        const sum = values.reduce((a, b) => a + b, 0);
        return { result: sum / values.length };
    }
}
exports.MathAverage = MathAverage;
class MathRandom {
    constructor() {
        this.nodeType = 'math.random';
        this.category = 'math';
        this.description = 'Generate a random number within a range';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const min = inputs.node.parameters.min !== undefined ? resolve(inputs.node.parameters.min, ctx) : 0;
        const max = inputs.node.parameters.max !== undefined ? resolve(inputs.node.parameters.max, ctx) : 1;
        const integer = inputs.node.parameters.integer ?? false;
        let result = Math.random() * (max - min) + min;
        if (integer)
            result = Math.floor(result);
        return { result };
    }
}
exports.MathRandom = MathRandom;
class MathClamp {
    constructor() {
        this.nodeType = 'math.clamp';
        this.category = 'math';
        this.description = 'Clamp a value between a minimum and maximum';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const value = resolve(inputs.node.parameters.value, ctx);
        const min = resolve(inputs.node.parameters.min, ctx);
        const max = resolve(inputs.node.parameters.max, ctx);
        return { result: Math.min(Math.max(value, min), max) };
    }
}
exports.MathClamp = MathClamp;
// Export all math plugin classes
exports.mathPluginClasses = {
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
exports.default = exports.mathPluginClasses;
//# sourceMappingURL=index.js.map