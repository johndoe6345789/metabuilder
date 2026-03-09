/**
 * Workflow plugin: Variable management operations.
 */
import { NodeExecutor, ExecuteInputs, ExecuteResult } from '../../base';
export declare class VarGet implements NodeExecutor {
    readonly nodeType = "var.get";
    readonly category = "var";
    readonly description = "Get variable value by name";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarSet implements NodeExecutor {
    readonly nodeType = "var.set";
    readonly category = "var";
    readonly description = "Set variable value by name";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarSetMultiple implements NodeExecutor {
    readonly nodeType = "var.setMultiple";
    readonly category = "var";
    readonly description = "Set multiple variables at once from an object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarDelete implements NodeExecutor {
    readonly nodeType = "var.delete";
    readonly category = "var";
    readonly description = "Delete variable by name";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarExists implements NodeExecutor {
    readonly nodeType = "var.exists";
    readonly category = "var";
    readonly description = "Check if variable exists";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarIncrement implements NodeExecutor {
    readonly nodeType = "var.increment";
    readonly category = "var";
    readonly description = "Increment numeric variable by amount (default 1)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarDecrement implements NodeExecutor {
    readonly nodeType = "var.decrement";
    readonly category = "var";
    readonly description = "Decrement numeric variable by amount (default 1)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarToggle implements NodeExecutor {
    readonly nodeType = "var.toggle";
    readonly category = "var";
    readonly description = "Toggle boolean variable";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarAppend implements NodeExecutor {
    readonly nodeType = "var.append";
    readonly category = "var";
    readonly description = "Append value to array variable";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarConcat implements NodeExecutor {
    readonly nodeType = "var.concat";
    readonly category = "var";
    readonly description = "Concatenate value to string variable with optional separator";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarList implements NodeExecutor {
    readonly nodeType = "var.list";
    readonly category = "var";
    readonly description = "List all variable names";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarGetAll implements NodeExecutor {
    readonly nodeType = "var.getAll";
    readonly category = "var";
    readonly description = "Get all variables as object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarClear implements NodeExecutor {
    readonly nodeType = "var.clear";
    readonly category = "var";
    readonly description = "Clear all variables";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class VarMerge implements NodeExecutor {
    readonly nodeType = "var.merge";
    readonly category = "var";
    readonly description = "Merge object into variable (shallow merge for objects)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare const varPluginClasses: {
    'var.get': typeof VarGet;
    'var.set': typeof VarSet;
    'var.setMultiple': typeof VarSetMultiple;
    'var.delete': typeof VarDelete;
    'var.exists': typeof VarExists;
    'var.increment': typeof VarIncrement;
    'var.decrement': typeof VarDecrement;
    'var.toggle': typeof VarToggle;
    'var.append': typeof VarAppend;
    'var.concat': typeof VarConcat;
    'var.list': typeof VarList;
    'var.getAll': typeof VarGetAll;
    'var.clear': typeof VarClear;
    'var.merge': typeof VarMerge;
};
export default varPluginClasses;
//# sourceMappingURL=index.d.ts.map