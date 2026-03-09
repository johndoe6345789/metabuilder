"use strict";
/**
 * Workflow plugin: Variable management operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.varPluginClasses = exports.VarMerge = exports.VarClear = exports.VarGetAll = exports.VarList = exports.VarConcat = exports.VarAppend = exports.VarToggle = exports.VarDecrement = exports.VarIncrement = exports.VarExists = exports.VarDelete = exports.VarSetMultiple = exports.VarSet = exports.VarGet = void 0;
const base_1 = require("../../base");
const template_engine_1 = require("../../../executor/ts/utils/template-engine");
const resolve = (value, ctx) => {
    if (typeof value === 'string' && value.startsWith('{{')) {
        return (0, template_engine_1.interpolateTemplate)(value, ctx);
    }
    return value;
};
// Ensure state.variables exists
const ensureVariables = (state) => {
    if (!state.variables)
        state.variables = {};
    return state.variables;
};
class VarGet {
    constructor() {
        this.nodeType = 'var.get';
        this.category = 'var';
        this.description = 'Get variable value by name';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const defaultValue = resolve(inputs.node.parameters.default, ctx);
        const vars = ensureVariables(inputs.state);
        const result = name in vars ? vars[name] : defaultValue;
        return { result };
    }
}
exports.VarGet = VarGet;
class VarSet {
    constructor() {
        this.nodeType = 'var.set';
        this.category = 'var';
        this.description = 'Set variable value by name';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const value = resolve(inputs.node.parameters.value, ctx);
        const vars = ensureVariables(inputs.state);
        vars[name] = value;
        return { result: value, name };
    }
}
exports.VarSet = VarSet;
class VarSetMultiple {
    constructor() {
        this.nodeType = 'var.setMultiple';
        this.category = 'var';
        this.description = 'Set multiple variables at once from an object';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const variables = inputs.node.parameters.variables || {};
        const vars = ensureVariables(inputs.state);
        const set = {};
        for (const [name, value] of Object.entries(variables)) {
            const resolvedValue = resolve(value, ctx);
            vars[name] = resolvedValue;
            set[name] = resolvedValue;
        }
        return { result: set, count: Object.keys(set).length };
    }
}
exports.VarSetMultiple = VarSetMultiple;
class VarDelete {
    constructor() {
        this.nodeType = 'var.delete';
        this.category = 'var';
        this.description = 'Delete variable by name';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const vars = ensureVariables(inputs.state);
        const existed = name in vars;
        const previousValue = vars[name];
        delete vars[name];
        return { result: existed, previousValue };
    }
}
exports.VarDelete = VarDelete;
class VarExists {
    constructor() {
        this.nodeType = 'var.exists';
        this.category = 'var';
        this.description = 'Check if variable exists';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const vars = ensureVariables(inputs.state);
        return { result: name in vars };
    }
}
exports.VarExists = VarExists;
class VarIncrement {
    constructor() {
        this.nodeType = 'var.increment';
        this.category = 'var';
        this.description = 'Increment numeric variable by amount (default 1)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const amount = inputs.node.parameters.amount ?? 1;
        const vars = ensureVariables(inputs.state);
        const current = Number(vars[name] ?? 0);
        const result = current + amount;
        vars[name] = result;
        return { result, previous: current };
    }
}
exports.VarIncrement = VarIncrement;
class VarDecrement {
    constructor() {
        this.nodeType = 'var.decrement';
        this.category = 'var';
        this.description = 'Decrement numeric variable by amount (default 1)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const amount = inputs.node.parameters.amount ?? 1;
        const vars = ensureVariables(inputs.state);
        const current = Number(vars[name] ?? 0);
        const result = current - amount;
        vars[name] = result;
        return { result, previous: current };
    }
}
exports.VarDecrement = VarDecrement;
class VarToggle {
    constructor() {
        this.nodeType = 'var.toggle';
        this.category = 'var';
        this.description = 'Toggle boolean variable';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const vars = ensureVariables(inputs.state);
        const current = Boolean(vars[name]);
        const result = !current;
        vars[name] = result;
        return { result, previous: current };
    }
}
exports.VarToggle = VarToggle;
class VarAppend {
    constructor() {
        this.nodeType = 'var.append';
        this.category = 'var';
        this.description = 'Append value to array variable';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const value = resolve(inputs.node.parameters.value, ctx);
        const vars = ensureVariables(inputs.state);
        if (!Array.isArray(vars[name]))
            vars[name] = [];
        vars[name].push(value);
        return { result: vars[name], length: vars[name].length };
    }
}
exports.VarAppend = VarAppend;
class VarConcat {
    constructor() {
        this.nodeType = 'var.concat';
        this.category = 'var';
        this.description = 'Concatenate value to string variable with optional separator';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const value = resolve(inputs.node.parameters.value, ctx);
        const separator = resolve(inputs.node.parameters.separator ?? '', ctx);
        const vars = ensureVariables(inputs.state);
        const current = String(vars[name] ?? '');
        const result = current ? `${current}${separator}${value}` : String(value);
        vars[name] = result;
        return { result };
    }
}
exports.VarConcat = VarConcat;
class VarList {
    constructor() {
        this.nodeType = 'var.list';
        this.category = 'var';
        this.description = 'List all variable names';
    }
    execute(inputs) {
        const vars = ensureVariables(inputs.state);
        return {
            result: Object.keys(vars),
            count: Object.keys(vars).length,
        };
    }
}
exports.VarList = VarList;
class VarGetAll {
    constructor() {
        this.nodeType = 'var.getAll';
        this.category = 'var';
        this.description = 'Get all variables as object';
    }
    execute(inputs) {
        const vars = ensureVariables(inputs.state);
        return { result: { ...vars } };
    }
}
exports.VarGetAll = VarGetAll;
class VarClear {
    constructor() {
        this.nodeType = 'var.clear';
        this.category = 'var';
        this.description = 'Clear all variables';
    }
    execute(inputs) {
        const vars = ensureVariables(inputs.state);
        const count = Object.keys(vars).length;
        const previous = { ...vars };
        for (const key of Object.keys(vars)) {
            delete vars[key];
        }
        return { result: count, previous };
    }
}
exports.VarClear = VarClear;
class VarMerge {
    constructor() {
        this.nodeType = 'var.merge';
        this.category = 'var';
        this.description = 'Merge object into variable (shallow merge for objects)';
    }
    execute(inputs) {
        const ctx = (0, base_1.createTemplateContext)(inputs);
        const name = resolve(inputs.node.parameters.name, ctx);
        const value = resolve(inputs.node.parameters.value, ctx);
        const vars = ensureVariables(inputs.state);
        const current = vars[name];
        if (typeof current === 'object' && typeof value === 'object' && !Array.isArray(current) && !Array.isArray(value)) {
            vars[name] = { ...current, ...value };
        }
        else {
            vars[name] = value;
        }
        return { result: vars[name] };
    }
}
exports.VarMerge = VarMerge;
// Export all var plugin classes
exports.varPluginClasses = {
    'var.get': VarGet,
    'var.set': VarSet,
    'var.setMultiple': VarSetMultiple,
    'var.delete': VarDelete,
    'var.exists': VarExists,
    'var.increment': VarIncrement,
    'var.decrement': VarDecrement,
    'var.toggle': VarToggle,
    'var.append': VarAppend,
    'var.concat': VarConcat,
    'var.list': VarList,
    'var.getAll': VarGetAll,
    'var.clear': VarClear,
    'var.merge': VarMerge,
};
exports.default = exports.varPluginClasses;
//# sourceMappingURL=index.js.map