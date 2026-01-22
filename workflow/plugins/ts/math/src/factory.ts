/**
 * Factory for math plugin classes.
 */

import {
  MathAdd,
  MathSubtract,
  MathMultiply,
  MathDivide,
  MathModulo,
  MathPower,
  MathSqrt,
  MathAbs,
  MathRound,
  MathFloor,
  MathCeil,
  MathMin,
  MathMax,
  MathSum,
  MathAverage,
  MathRandom,
  MathClamp,
} from './index';

export function createMathAdd(): MathAdd {
  return new MathAdd();
}

export function createMathSubtract(): MathSubtract {
  return new MathSubtract();
}

export function createMathMultiply(): MathMultiply {
  return new MathMultiply();
}

export function createMathDivide(): MathDivide {
  return new MathDivide();
}

export function createMathModulo(): MathModulo {
  return new MathModulo();
}

export function createMathPower(): MathPower {
  return new MathPower();
}

export function createMathSqrt(): MathSqrt {
  return new MathSqrt();
}

export function createMathAbs(): MathAbs {
  return new MathAbs();
}

export function createMathRound(): MathRound {
  return new MathRound();
}

export function createMathFloor(): MathFloor {
  return new MathFloor();
}

export function createMathCeil(): MathCeil {
  return new MathCeil();
}

export function createMathMin(): MathMin {
  return new MathMin();
}

export function createMathMax(): MathMax {
  return new MathMax();
}

export function createMathSum(): MathSum {
  return new MathSum();
}

export function createMathAverage(): MathAverage {
  return new MathAverage();
}

export function createMathRandom(): MathRandom {
  return new MathRandom();
}

export function createMathClamp(): MathClamp {
  return new MathClamp();
}

// Factory map for all math plugins
export const factories = {
  'math.add': createMathAdd,
  'math.subtract': createMathSubtract,
  'math.multiply': createMathMultiply,
  'math.divide': createMathDivide,
  'math.modulo': createMathModulo,
  'math.power': createMathPower,
  'math.sqrt': createMathSqrt,
  'math.abs': createMathAbs,
  'math.round': createMathRound,
  'math.floor': createMathFloor,
  'math.ceil': createMathCeil,
  'math.min': createMathMin,
  'math.max': createMathMax,
  'math.sum': createMathSum,
  'math.average': createMathAverage,
  'math.random': createMathRandom,
  'math.clamp': createMathClamp,
};

export default factories;
