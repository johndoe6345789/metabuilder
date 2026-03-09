/**
 * Workflow plugin: Array/list operations.
 */
import { NodeExecutor, ExecuteInputs, ExecuteResult } from '../../base';
export declare class ListConcat implements NodeExecutor {
    readonly nodeType = "list.concat";
    readonly category = "list";
    readonly description = "Concatenate multiple arrays into one";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListLength implements NodeExecutor {
    readonly nodeType = "list.length";
    readonly category = "list";
    readonly description = "Get the length of an array";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListSlice implements NodeExecutor {
    readonly nodeType = "list.slice";
    readonly category = "list";
    readonly description = "Extract a portion of an array by start and end indices";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListFind implements NodeExecutor {
    readonly nodeType = "list.find";
    readonly category = "list";
    readonly description = "Find first element matching a condition";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListFindIndex implements NodeExecutor {
    readonly nodeType = "list.findIndex";
    readonly category = "list";
    readonly description = "Find index of first element matching a condition";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListFilter implements NodeExecutor {
    readonly nodeType = "list.filter";
    readonly category = "list";
    readonly description = "Filter array elements by a condition";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListMap implements NodeExecutor {
    readonly nodeType = "list.map";
    readonly category = "list";
    readonly description = "Transform each element using a template";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListReduce implements NodeExecutor {
    readonly nodeType = "list.reduce";
    readonly category = "list";
    readonly description = "Reduce array to a single value using a reducer expression";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListEvery implements NodeExecutor {
    readonly nodeType = "list.every";
    readonly category = "list";
    readonly description = "Check if all elements match a condition";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListSome implements NodeExecutor {
    readonly nodeType = "list.some";
    readonly category = "list";
    readonly description = "Check if any element matches a condition";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListSort implements NodeExecutor {
    readonly nodeType = "list.sort";
    readonly category = "list";
    readonly description = "Sort array by key in ascending or descending order";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListReverse implements NodeExecutor {
    readonly nodeType = "list.reverse";
    readonly category = "list";
    readonly description = "Reverse the order of array elements";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListUnique implements NodeExecutor {
    readonly nodeType = "list.unique";
    readonly category = "list";
    readonly description = "Remove duplicate elements from array";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListFlatten implements NodeExecutor {
    readonly nodeType = "list.flatten";
    readonly category = "list";
    readonly description = "Flatten nested arrays to specified depth";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListPush implements NodeExecutor {
    readonly nodeType = "list.push";
    readonly category = "list";
    readonly description = "Add element to end of array (immutable)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListPop implements NodeExecutor {
    readonly nodeType = "list.pop";
    readonly category = "list";
    readonly description = "Remove and return last element from array (immutable)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListShift implements NodeExecutor {
    readonly nodeType = "list.shift";
    readonly category = "list";
    readonly description = "Remove and return first element from array (immutable)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListUnshift implements NodeExecutor {
    readonly nodeType = "list.unshift";
    readonly category = "list";
    readonly description = "Add element to beginning of array (immutable)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListIncludes implements NodeExecutor {
    readonly nodeType = "list.includes";
    readonly category = "list";
    readonly description = "Check if array includes a specific value";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListIndexOf implements NodeExecutor {
    readonly nodeType = "list.indexOf";
    readonly category = "list";
    readonly description = "Get the index of a value in array";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListAt implements NodeExecutor {
    readonly nodeType = "list.at";
    readonly category = "list";
    readonly description = "Get element at index (supports negative indices)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ListGroupBy implements NodeExecutor {
    readonly nodeType = "list.groupBy";
    readonly category = "list";
    readonly description = "Group array elements by a key into an object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare const listPluginClasses: {
    'list.concat': typeof ListConcat;
    'list.length': typeof ListLength;
    'list.slice': typeof ListSlice;
    'list.find': typeof ListFind;
    'list.findIndex': typeof ListFindIndex;
    'list.filter': typeof ListFilter;
    'list.map': typeof ListMap;
    'list.reduce': typeof ListReduce;
    'list.every': typeof ListEvery;
    'list.some': typeof ListSome;
    'list.sort': typeof ListSort;
    'list.reverse': typeof ListReverse;
    'list.unique': typeof ListUnique;
    'list.flatten': typeof ListFlatten;
    'list.push': typeof ListPush;
    'list.pop': typeof ListPop;
    'list.shift': typeof ListShift;
    'list.unshift': typeof ListUnshift;
    'list.includes': typeof ListIncludes;
    'list.indexOf': typeof ListIndexOf;
    'list.at': typeof ListAt;
    'list.groupBy': typeof ListGroupBy;
};
export default listPluginClasses;
//# sourceMappingURL=index.d.ts.map