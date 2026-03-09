/**
 * Workflow plugin: Object/dictionary operations.
 */
import { NodeExecutor, ExecuteInputs, ExecuteResult } from '../../base';
export declare class DictGet implements NodeExecutor {
    readonly nodeType = "dict.get";
    readonly category = "dict";
    readonly description = "Get value by key (supports nested dot notation paths)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictSet implements NodeExecutor {
    readonly nodeType = "dict.set";
    readonly category = "dict";
    readonly description = "Set value by key (supports nested paths, returns new object)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictDelete implements NodeExecutor {
    readonly nodeType = "dict.delete";
    readonly category = "dict";
    readonly description = "Delete key from object (returns new object)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictKeys implements NodeExecutor {
    readonly nodeType = "dict.keys";
    readonly category = "dict";
    readonly description = "Get all keys from object as array";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictValues implements NodeExecutor {
    readonly nodeType = "dict.values";
    readonly category = "dict";
    readonly description = "Get all values from object as array";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictEntries implements NodeExecutor {
    readonly nodeType = "dict.entries";
    readonly category = "dict";
    readonly description = "Get all entries as [key, value] pairs array";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictFromEntries implements NodeExecutor {
    readonly nodeType = "dict.fromEntries";
    readonly category = "dict";
    readonly description = "Create object from [key, value] entries array";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictMerge implements NodeExecutor {
    readonly nodeType = "dict.merge";
    readonly category = "dict";
    readonly description = "Shallow merge multiple objects";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictDeepMerge implements NodeExecutor {
    readonly nodeType = "dict.deepMerge";
    readonly category = "dict";
    readonly description = "Deep merge multiple objects (recursive)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictPick implements NodeExecutor {
    readonly nodeType = "dict.pick";
    readonly category = "dict";
    readonly description = "Pick specific keys from object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictOmit implements NodeExecutor {
    readonly nodeType = "dict.omit";
    readonly category = "dict";
    readonly description = "Omit specific keys from object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictHas implements NodeExecutor {
    readonly nodeType = "dict.has";
    readonly category = "dict";
    readonly description = "Check if key exists in object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictSize implements NodeExecutor {
    readonly nodeType = "dict.size";
    readonly category = "dict";
    readonly description = "Get number of keys in object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictInvert implements NodeExecutor {
    readonly nodeType = "dict.invert";
    readonly category = "dict";
    readonly description = "Swap keys and values in object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictMapValues implements NodeExecutor {
    readonly nodeType = "dict.mapValues";
    readonly category = "dict";
    readonly description = "Transform all values using a template";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class DictFilterEntries implements NodeExecutor {
    readonly nodeType = "dict.filterEntries";
    readonly category = "dict";
    readonly description = "Filter object entries by a condition";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare const dictPluginClasses: {
    'dict.get': typeof DictGet;
    'dict.set': typeof DictSet;
    'dict.delete': typeof DictDelete;
    'dict.keys': typeof DictKeys;
    'dict.values': typeof DictValues;
    'dict.entries': typeof DictEntries;
    'dict.fromEntries': typeof DictFromEntries;
    'dict.merge': typeof DictMerge;
    'dict.deepMerge': typeof DictDeepMerge;
    'dict.pick': typeof DictPick;
    'dict.omit': typeof DictOmit;
    'dict.has': typeof DictHas;
    'dict.size': typeof DictSize;
    'dict.invert': typeof DictInvert;
    'dict.mapValues': typeof DictMapValues;
    'dict.filterEntries': typeof DictFilterEntries;
};
export default dictPluginClasses;
//# sourceMappingURL=index.d.ts.map