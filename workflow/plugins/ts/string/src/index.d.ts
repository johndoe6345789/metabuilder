/**
 * Workflow plugin: String manipulation operations.
 */
import { NodeExecutor, ExecuteInputs, ExecuteResult } from '../../base';
export declare class StringConcat implements NodeExecutor {
    readonly nodeType = "string.concat";
    readonly category = "string";
    readonly description = "Concatenate multiple strings with an optional separator";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringFormat implements NodeExecutor {
    readonly nodeType = "string.format";
    readonly category = "string";
    readonly description = "Format string with variables using {key} placeholders";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringLength implements NodeExecutor {
    readonly nodeType = "string.length";
    readonly category = "string";
    readonly description = "Get the length of a string";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringLower implements NodeExecutor {
    readonly nodeType = "string.lower";
    readonly category = "string";
    readonly description = "Convert string to lowercase";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringUpper implements NodeExecutor {
    readonly nodeType = "string.upper";
    readonly category = "string";
    readonly description = "Convert string to uppercase";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringTrim implements NodeExecutor {
    readonly nodeType = "string.trim";
    readonly category = "string";
    readonly description = "Trim whitespace from string (both ends, start only, or end only)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringReplace implements NodeExecutor {
    readonly nodeType = "string.replace";
    readonly category = "string";
    readonly description = "Replace substring in string (single or all occurrences)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringSplit implements NodeExecutor {
    readonly nodeType = "string.split";
    readonly category = "string";
    readonly description = "Split string into array by separator";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringJoin implements NodeExecutor {
    readonly nodeType = "string.join";
    readonly category = "string";
    readonly description = "Join array elements into string with separator";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringSubstring implements NodeExecutor {
    readonly nodeType = "string.substring";
    readonly category = "string";
    readonly description = "Extract substring from string by start and end index";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringIncludes implements NodeExecutor {
    readonly nodeType = "string.includes";
    readonly category = "string";
    readonly description = "Check if string contains a substring";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringStartsWith implements NodeExecutor {
    readonly nodeType = "string.startsWith";
    readonly category = "string";
    readonly description = "Check if string starts with a prefix";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringEndsWith implements NodeExecutor {
    readonly nodeType = "string.endsWith";
    readonly category = "string";
    readonly description = "Check if string ends with a suffix";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringPadStart implements NodeExecutor {
    readonly nodeType = "string.padStart";
    readonly category = "string";
    readonly description = "Pad string at the start to reach target length";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class StringPadEnd implements NodeExecutor {
    readonly nodeType = "string.padEnd";
    readonly category = "string";
    readonly description = "Pad string at the end to reach target length";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare const stringPluginClasses: {
    'string.concat': typeof StringConcat;
    'string.format': typeof StringFormat;
    'string.length': typeof StringLength;
    'string.lower': typeof StringLower;
    'string.upper': typeof StringUpper;
    'string.trim': typeof StringTrim;
    'string.replace': typeof StringReplace;
    'string.split': typeof StringSplit;
    'string.join': typeof StringJoin;
    'string.substring': typeof StringSubstring;
    'string.includes': typeof StringIncludes;
    'string.startsWith': typeof StringStartsWith;
    'string.endsWith': typeof StringEndsWith;
    'string.padStart': typeof StringPadStart;
    'string.padEnd': typeof StringPadEnd;
};
export default stringPluginClasses;
//# sourceMappingURL=index.d.ts.map