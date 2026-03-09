/**
 * Workflow plugin: Type conversion and parsing operations.
 */
import { NodeExecutor, ExecuteInputs, ExecuteResult } from '../../base';
export declare class ConvertToString implements NodeExecutor {
    readonly nodeType = "convert.toString";
    readonly category = "convert";
    readonly description = "Convert value to string";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertToNumber implements NodeExecutor {
    readonly nodeType = "convert.toNumber";
    readonly category = "convert";
    readonly description = "Convert value to number";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertToInteger implements NodeExecutor {
    readonly nodeType = "convert.toInteger";
    readonly category = "convert";
    readonly description = "Convert value to integer (with optional radix)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertToFloat implements NodeExecutor {
    readonly nodeType = "convert.toFloat";
    readonly category = "convert";
    readonly description = "Convert value to floating point number";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertToBoolean implements NodeExecutor {
    readonly nodeType = "convert.toBoolean";
    readonly category = "convert";
    readonly description = "Convert value to boolean (handles \"true\", \"1\", \"yes\", \"on\")";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertToArray implements NodeExecutor {
    readonly nodeType = "convert.toArray";
    readonly category = "convert";
    readonly description = "Convert value to array (parses JSON or splits by separator)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertToObject implements NodeExecutor {
    readonly nodeType = "convert.toObject";
    readonly category = "convert";
    readonly description = "Convert value to object";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertParseJson implements NodeExecutor {
    readonly nodeType = "convert.parseJson";
    readonly category = "convert";
    readonly description = "Parse JSON string to value";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertToJson implements NodeExecutor {
    readonly nodeType = "convert.toJson";
    readonly category = "convert";
    readonly description = "Stringify value to JSON (optionally pretty-printed)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertParseDate implements NodeExecutor {
    readonly nodeType = "convert.parseDate";
    readonly category = "convert";
    readonly description = "Parse date string to ISO format";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertFormatDate implements NodeExecutor {
    readonly nodeType = "convert.formatDate";
    readonly category = "convert";
    readonly description = "Format date to various string formats";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertBase64Encode implements NodeExecutor {
    readonly nodeType = "convert.base64Encode";
    readonly category = "convert";
    readonly description = "Encode value to Base64 string";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertBase64Decode implements NodeExecutor {
    readonly nodeType = "convert.base64Decode";
    readonly category = "convert";
    readonly description = "Decode Base64 string to value";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertUrlEncode implements NodeExecutor {
    readonly nodeType = "convert.urlEncode";
    readonly category = "convert";
    readonly description = "URL encode string";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class ConvertUrlDecode implements NodeExecutor {
    readonly nodeType = "convert.urlDecode";
    readonly category = "convert";
    readonly description = "URL decode string";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare const convertPluginClasses: {
    'convert.toString': typeof ConvertToString;
    'convert.toNumber': typeof ConvertToNumber;
    'convert.toInteger': typeof ConvertToInteger;
    'convert.toFloat': typeof ConvertToFloat;
    'convert.toBoolean': typeof ConvertToBoolean;
    'convert.toArray': typeof ConvertToArray;
    'convert.toObject': typeof ConvertToObject;
    'convert.parseJson': typeof ConvertParseJson;
    'convert.toJson': typeof ConvertToJson;
    'convert.parseDate': typeof ConvertParseDate;
    'convert.formatDate': typeof ConvertFormatDate;
    'convert.base64Encode': typeof ConvertBase64Encode;
    'convert.base64Decode': typeof ConvertBase64Decode;
    'convert.urlEncode': typeof ConvertUrlEncode;
    'convert.urlDecode': typeof ConvertUrlDecode;
};
export default convertPluginClasses;
//# sourceMappingURL=index.d.ts.map