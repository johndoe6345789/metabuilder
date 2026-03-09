/**
 * Workflow plugin: Logical and comparison operations.
 */
import { NodeExecutor, ExecuteInputs, ExecuteResult } from '../../base';
export declare class LogicAnd implements NodeExecutor {
    readonly nodeType = "logic.and";
    readonly category = "logic";
    readonly description = "Logical AND - returns true if all values are truthy";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicOr implements NodeExecutor {
    readonly nodeType = "logic.or";
    readonly category = "logic";
    readonly description = "Logical OR - returns true if any value is truthy";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicNot implements NodeExecutor {
    readonly nodeType = "logic.not";
    readonly category = "logic";
    readonly description = "Logical NOT - inverts boolean value";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicXor implements NodeExecutor {
    readonly nodeType = "logic.xor";
    readonly category = "logic";
    readonly description = "Logical XOR - returns true if values are different";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicEquals implements NodeExecutor {
    readonly nodeType = "logic.equals";
    readonly category = "logic";
    readonly description = "Equality check (strict or loose comparison)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicNotEquals implements NodeExecutor {
    readonly nodeType = "logic.notEquals";
    readonly category = "logic";
    readonly description = "Inequality check (strict or loose comparison)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicGt implements NodeExecutor {
    readonly nodeType = "logic.gt";
    readonly category = "logic";
    readonly description = "Greater than comparison";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicGte implements NodeExecutor {
    readonly nodeType = "logic.gte";
    readonly category = "logic";
    readonly description = "Greater than or equal comparison";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicLt implements NodeExecutor {
    readonly nodeType = "logic.lt";
    readonly category = "logic";
    readonly description = "Less than comparison";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicLte implements NodeExecutor {
    readonly nodeType = "logic.lte";
    readonly category = "logic";
    readonly description = "Less than or equal comparison";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicIn implements NodeExecutor {
    readonly nodeType = "logic.in";
    readonly category = "logic";
    readonly description = "Check if value is in array";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicBetween implements NodeExecutor {
    readonly nodeType = "logic.between";
    readonly category = "logic";
    readonly description = "Check if value is between min and max (inclusive or exclusive)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicIsNull implements NodeExecutor {
    readonly nodeType = "logic.isNull";
    readonly category = "logic";
    readonly description = "Check if value is null or undefined";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicIsEmpty implements NodeExecutor {
    readonly nodeType = "logic.isEmpty";
    readonly category = "logic";
    readonly description = "Check if value is empty (null, undefined, empty string, empty array, empty object)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicTypeOf implements NodeExecutor {
    readonly nodeType = "logic.typeOf";
    readonly category = "logic";
    readonly description = "Get type of value (string, number, boolean, array, object, null, undefined)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicTernary implements NodeExecutor {
    readonly nodeType = "logic.ternary";
    readonly category = "logic";
    readonly description = "Ternary conditional - returns then value if condition is truthy, else value otherwise";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class LogicCoalesce implements NodeExecutor {
    readonly nodeType = "logic.coalesce";
    readonly category = "logic";
    readonly description = "Return first non-null/undefined value from list";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare const logicPluginClasses: {
    'logic.and': typeof LogicAnd;
    'logic.or': typeof LogicOr;
    'logic.not': typeof LogicNot;
    'logic.xor': typeof LogicXor;
    'logic.equals': typeof LogicEquals;
    'logic.notEquals': typeof LogicNotEquals;
    'logic.gt': typeof LogicGt;
    'logic.gte': typeof LogicGte;
    'logic.lt': typeof LogicLt;
    'logic.lte': typeof LogicLte;
    'logic.in': typeof LogicIn;
    'logic.between': typeof LogicBetween;
    'logic.isNull': typeof LogicIsNull;
    'logic.isEmpty': typeof LogicIsEmpty;
    'logic.typeOf': typeof LogicTypeOf;
    'logic.ternary': typeof LogicTernary;
    'logic.coalesce': typeof LogicCoalesce;
};
export default logicPluginClasses;
//# sourceMappingURL=index.d.ts.map