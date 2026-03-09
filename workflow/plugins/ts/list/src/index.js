"use strict";
/**
 * Workflow plugin: Array/list operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPluginClasses = exports.ListGroupBy = exports.ListAt = exports.ListIndexOf = exports.ListIncludes = exports.ListUnshift = exports.ListShift = exports.ListPop = exports.ListPush = exports.ListFlatten = exports.ListUnique = exports.ListReverse = exports.ListSort = exports.ListSome = exports.ListEvery = exports.ListReduce = exports.ListMap = exports.ListFilter = exports.ListFindIndex = exports.ListFind = exports.ListSlice = exports.ListLength = exports.ListConcat = void 0;
const base_1 = require("../../base");
const template_engine_1 = require("../../../executor/ts/utils/template-engine");
const resolve = (value, ctx) => {
    if (typeof value === 'string' && value.startsWith('{{')) {
        return (0, template_engine_1.interpolateTemplate)(value, ctx);
    }
    return value;
};
class ListConcat {
    constructor() {
        this.nodeType = 'list.concat';
        this.category = 'list';
        this.description = 'Concatenate multiple arrays into one';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const arrays = (inputs.node.parameters.arrays || []).map((a) => resolve(a, ctx) || []);
        return { result: arrays.flat() };
    }
}
exports.ListConcat = ListConcat;
class ListLength {
    constructor() {
        this.nodeType = 'list.length';
        this.category = 'list';
        this.description = 'Get the length of an array';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        return { result: Array.isArray(array) ? array.length : 0 };
    }
}
exports.ListLength = ListLength;
class ListSlice {
    constructor() {
        this.nodeType = 'list.slice';
        this.category = 'list';
        this.description = 'Extract a portion of an array by start and end indices';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const startIdx = inputs.node.parameters.start ?? 0;
        const endIdx = inputs.node.parameters.end;
        return { result: Array.isArray(array) ? array.slice(startIdx, endIdx) : [] };
    }
}
exports.ListSlice = ListSlice;
class ListFind {
    constructor() {
        this.nodeType = 'list.find';
        this.category = 'list';
        this.description = 'Find first element matching a condition';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const condition = inputs.node.parameters.condition;
        if (!Array.isArray(array))
            return { result: null };
        const result = array.find((item, index) => {
            const evalCtx = { ...ctx, item, index, $item: item, $index: index };
            return (0, template_engine_1.evaluateTemplate)(condition, evalCtx);
        });
        return { result: result ?? null };
    }
}
exports.ListFind = ListFind;
class ListFindIndex {
    constructor() {
        this.nodeType = 'list.findIndex';
        this.category = 'list';
        this.description = 'Find index of first element matching a condition';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const condition = inputs.node.parameters.condition;
        if (!Array.isArray(array))
            return { result: -1 };
        const result = array.findIndex((item, index) => {
            const evalCtx = { ...ctx, item, index, $item: item, $index: index };
            return (0, template_engine_1.evaluateTemplate)(condition, evalCtx);
        });
        return { result };
    }
}
exports.ListFindIndex = ListFindIndex;
class ListFilter {
    constructor() {
        this.nodeType = 'list.filter';
        this.category = 'list';
        this.description = 'Filter array elements by a condition';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const condition = inputs.node.parameters.condition;
        if (!Array.isArray(array))
            return { result: [] };
        const result = array.filter((item, index) => {
            const evalCtx = { ...ctx, item, index, $item: item, $index: index };
            return (0, template_engine_1.evaluateTemplate)(condition, evalCtx);
        });
        return { result };
    }
}
exports.ListFilter = ListFilter;
class ListMap {
    constructor() {
        this.nodeType = 'list.map';
        this.category = 'list';
        this.description = 'Transform each element using a template';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const transform = inputs.node.parameters.transform;
        if (!Array.isArray(array))
            return { result: [] };
        const result = array.map((item, index) => {
            const evalCtx = { ...ctx, item, index, $item: item, $index: index };
            return (0, template_engine_1.interpolateTemplate)(transform, evalCtx);
        });
        return { result };
    }
}
exports.ListMap = ListMap;
class ListReduce {
    constructor() {
        this.nodeType = 'list.reduce';
        this.category = 'list';
        this.description = 'Reduce array to a single value using a reducer expression';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const reducer = inputs.node.parameters.reducer;
        const initial = resolve(inputs.node.parameters.initial, ctx);
        if (!Array.isArray(array))
            return { result: initial };
        const result = array.reduce((acc, item, index) => {
            const evalCtx = { ...ctx, acc, item, index, $acc: acc, $item: item, $index: index };
            return (0, template_engine_1.evaluateTemplate)(reducer, evalCtx);
        }, initial);
        return { result };
    }
}
exports.ListReduce = ListReduce;
class ListEvery {
    constructor() {
        this.nodeType = 'list.every';
        this.category = 'list';
        this.description = 'Check if all elements match a condition';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const condition = inputs.node.parameters.condition;
        if (!Array.isArray(array))
            return { result: true };
        const result = array.every((item, index) => {
            const evalCtx = { ...ctx, item, index, $item: item, $index: index };
            return (0, template_engine_1.evaluateTemplate)(condition, evalCtx);
        });
        return { result };
    }
}
exports.ListEvery = ListEvery;
class ListSome {
    constructor() {
        this.nodeType = 'list.some';
        this.category = 'list';
        this.description = 'Check if any element matches a condition';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const condition = inputs.node.parameters.condition;
        if (!Array.isArray(array))
            return { result: false };
        const result = array.some((item, index) => {
            const evalCtx = { ...ctx, item, index, $item: item, $index: index };
            return (0, template_engine_1.evaluateTemplate)(condition, evalCtx);
        });
        return { result };
    }
}
exports.ListSome = ListSome;
class ListSort {
    constructor() {
        this.nodeType = 'list.sort';
        this.category = 'list';
        this.description = 'Sort array by key in ascending or descending order';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const key = inputs.node.parameters.key;
        const order = inputs.node.parameters.order ?? 'asc';
        if (!Array.isArray(array))
            return { result: [] };
        const sorted = [...array].sort((a, b) => {
            const valA = key ? a[key] : a;
            const valB = key ? b[key] : b;
            if (valA < valB)
                return order === 'asc' ? -1 : 1;
            if (valA > valB)
                return order === 'asc' ? 1 : -1;
            return 0;
        });
        return { result: sorted };
    }
}
exports.ListSort = ListSort;
class ListReverse {
    constructor() {
        this.nodeType = 'list.reverse';
        this.category = 'list';
        this.description = 'Reverse the order of array elements';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        return { result: Array.isArray(array) ? [...array].reverse() : [] };
    }
}
exports.ListReverse = ListReverse;
class ListUnique {
    constructor() {
        this.nodeType = 'list.unique';
        this.category = 'list';
        this.description = 'Remove duplicate elements from array';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const key = inputs.node.parameters.key;
        if (!Array.isArray(array))
            return { result: [] };
        let result;
        if (key) {
            const seen = new Set();
            result = array.filter(item => {
                const val = item[key];
                if (seen.has(val))
                    return false;
                seen.add(val);
                return true;
            });
        }
        else {
            result = [...new Set(array)];
        }
        return { result };
    }
}
exports.ListUnique = ListUnique;
class ListFlatten {
    constructor() {
        this.nodeType = 'list.flatten';
        this.category = 'list';
        this.description = 'Flatten nested arrays to specified depth';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const depth = inputs.node.parameters.depth ?? 1;
        return { result: Array.isArray(array) ? array.flat(depth) : [] };
    }
}
exports.ListFlatten = ListFlatten;
class ListPush {
    constructor() {
        this.nodeType = 'list.push';
        this.category = 'list';
        this.description = 'Add element to end of array (immutable)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const value = resolve(inputs.node.parameters.value, ctx);
        return { result: Array.isArray(array) ? [...array, value] : [value] };
    }
}
exports.ListPush = ListPush;
class ListPop {
    constructor() {
        this.nodeType = 'list.pop';
        this.category = 'list';
        this.description = 'Remove and return last element from array (immutable)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        if (!Array.isArray(array) || array.length === 0)
            return { result: [], removed: null };
        const removed = array[array.length - 1];
        return { result: array.slice(0, -1), removed };
    }
}
exports.ListPop = ListPop;
class ListShift {
    constructor() {
        this.nodeType = 'list.shift';
        this.category = 'list';
        this.description = 'Remove and return first element from array (immutable)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        if (!Array.isArray(array) || array.length === 0)
            return { result: [], removed: null };
        const removed = array[0];
        return { result: array.slice(1), removed };
    }
}
exports.ListShift = ListShift;
class ListUnshift {
    constructor() {
        this.nodeType = 'list.unshift';
        this.category = 'list';
        this.description = 'Add element to beginning of array (immutable)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const value = resolve(inputs.node.parameters.value, ctx);
        return { result: Array.isArray(array) ? [value, ...array] : [value] };
    }
}
exports.ListUnshift = ListUnshift;
class ListIncludes {
    constructor() {
        this.nodeType = 'list.includes';
        this.category = 'list';
        this.description = 'Check if array includes a specific value';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const value = resolve(inputs.node.parameters.value, ctx);
        return { result: Array.isArray(array) && array.includes(value) };
    }
}
exports.ListIncludes = ListIncludes;
class ListIndexOf {
    constructor() {
        this.nodeType = 'list.indexOf';
        this.category = 'list';
        this.description = 'Get the index of a value in array';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const value = resolve(inputs.node.parameters.value, ctx);
        return { result: Array.isArray(array) ? array.indexOf(value) : -1 };
    }
}
exports.ListIndexOf = ListIndexOf;
class ListAt {
    constructor() {
        this.nodeType = 'list.at';
        this.category = 'list';
        this.description = 'Get element at index (supports negative indices)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const index = inputs.node.parameters.index ?? 0;
        if (!Array.isArray(array))
            return { result: null };
        const result = array.at(index) ?? null;
        return { result };
    }
}
exports.ListAt = ListAt;
class ListGroupBy {
    constructor() {
        this.nodeType = 'list.groupBy';
        this.category = 'list';
        this.description = 'Group array elements by a key into an object';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const array = resolve(inputs.node.parameters.array, ctx) || [];
        const key = inputs.node.parameters.key;
        if (!Array.isArray(array))
            return { result: {} };
        const groups = {};
        for (const item of array) {
            const groupKey = String(item[key] ?? 'undefined');
            if (!groups[groupKey])
                groups[groupKey] = [];
            groups[groupKey].push(item);
        }
        return { result: groups };
    }
}
exports.ListGroupBy = ListGroupBy;
// Export all list plugin classes
exports.listPluginClasses = {
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
exports.default = exports.listPluginClasses;
//# sourceMappingURL=index.js.map