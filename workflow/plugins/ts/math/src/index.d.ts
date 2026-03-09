/**
 * Workflow plugin: Mathematical operations.
 */
import { NodeExecutor, ExecuteInputs, ExecuteResult } from '../../base';
export declare class MathAdd implements NodeExecutor {
    readonly nodeType = "math.add";
    readonly category = "math";
    readonly description = "Add multiple numbers together";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathSubtract implements NodeExecutor {
    readonly nodeType = "math.subtract";
    readonly category = "math";
    readonly description = "Subtract one number from another";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathMultiply implements NodeExecutor {
    readonly nodeType = "math.multiply";
    readonly category = "math";
    readonly description = "Multiply multiple numbers together";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathDivide implements NodeExecutor {
    readonly nodeType = "math.divide";
    readonly category = "math";
    readonly description = "Divide one number by another";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathModulo implements NodeExecutor {
    readonly nodeType = "math.modulo";
    readonly category = "math";
    readonly description = "Get the remainder of division (modulo operation)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathPower implements NodeExecutor {
    readonly nodeType = "math.power";
    readonly category = "math";
    readonly description = "Raise a number to a power (exponentiation)";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathSqrt implements NodeExecutor {
    readonly nodeType = "math.sqrt";
    readonly category = "math";
    readonly description = "Calculate the square root of a number";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathAbs implements NodeExecutor {
    readonly nodeType = "math.abs";
    readonly category = "math";
    readonly description = "Get the absolute value of a number";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathRound implements NodeExecutor {
    readonly nodeType = "math.round";
    readonly category = "math";
    readonly description = "Round a number to specified decimal places";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathFloor implements NodeExecutor {
    readonly nodeType = "math.floor";
    readonly category = "math";
    readonly description = "Round a number down to the nearest integer";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathCeil implements NodeExecutor {
    readonly nodeType = "math.ceil";
    readonly category = "math";
    readonly description = "Round a number up to the nearest integer";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathMin implements NodeExecutor {
    readonly nodeType = "math.min";
    readonly category = "math";
    readonly description = "Get the minimum value from a list of numbers";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathMax implements NodeExecutor {
    readonly nodeType = "math.max";
    readonly category = "math";
    readonly description = "Get the maximum value from a list of numbers";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathSum implements NodeExecutor {
    readonly nodeType = "math.sum";
    readonly category = "math";
    readonly description = "Calculate the sum of a list of numbers";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathAverage implements NodeExecutor {
    readonly nodeType = "math.average";
    readonly category = "math";
    readonly description = "Calculate the average of a list of numbers";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathRandom implements NodeExecutor {
    readonly nodeType = "math.random";
    readonly category = "math";
    readonly description = "Generate a random number within a range";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare class MathClamp implements NodeExecutor {
    readonly nodeType = "math.clamp";
    readonly category = "math";
    readonly description = "Clamp a value between a minimum and maximum";
    execute(inputs: ExecuteInputs): ExecuteResult;
}
export declare const mathPluginClasses: {
    'math.add': typeof MathAdd;
    'math.subtract': typeof MathSubtract;
    'math.multiply': typeof MathMultiply;
    'math.divide': typeof MathDivide;
    'math.modulo': typeof MathModulo;
    'math.power': typeof MathPower;
    'math.sqrt': typeof MathSqrt;
    'math.abs': typeof MathAbs;
    'math.round': typeof MathRound;
    'math.floor': typeof MathFloor;
    'math.ceil': typeof MathCeil;
    'math.min': typeof MathMin;
    'math.max': typeof MathMax;
    'math.sum': typeof MathSum;
    'math.average': typeof MathAverage;
    'math.random': typeof MathRandom;
    'math.clamp': typeof MathClamp;
};
export default mathPluginClasses;
//# sourceMappingURL=index.d.ts.map