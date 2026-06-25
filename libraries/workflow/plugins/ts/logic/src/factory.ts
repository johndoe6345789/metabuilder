/**
 * Factory for logic plugin classes.
 */

import {
  LogicAnd,
  LogicOr,
  LogicNot,
  LogicXor,
  LogicEquals,
  LogicNotEquals,
  LogicGt,
  LogicGte,
  LogicLt,
  LogicLte,
  LogicIn,
  LogicBetween,
  LogicIsNull,
  LogicIsEmpty,
  LogicTypeOf,
  LogicTernary,
  LogicCoalesce,
} from './index';

export function createLogicAnd(): LogicAnd {
  return new LogicAnd();
}

export function createLogicOr(): LogicOr {
  return new LogicOr();
}

export function createLogicNot(): LogicNot {
  return new LogicNot();
}

export function createLogicXor(): LogicXor {
  return new LogicXor();
}

export function createLogicEquals(): LogicEquals {
  return new LogicEquals();
}

export function createLogicNotEquals(): LogicNotEquals {
  return new LogicNotEquals();
}

export function createLogicGt(): LogicGt {
  return new LogicGt();
}

export function createLogicGte(): LogicGte {
  return new LogicGte();
}

export function createLogicLt(): LogicLt {
  return new LogicLt();
}

export function createLogicLte(): LogicLte {
  return new LogicLte();
}

export function createLogicIn(): LogicIn {
  return new LogicIn();
}

export function createLogicBetween(): LogicBetween {
  return new LogicBetween();
}

export function createLogicIsNull(): LogicIsNull {
  return new LogicIsNull();
}

export function createLogicIsEmpty(): LogicIsEmpty {
  return new LogicIsEmpty();
}

export function createLogicTypeOf(): LogicTypeOf {
  return new LogicTypeOf();
}

export function createLogicTernary(): LogicTernary {
  return new LogicTernary();
}

export function createLogicCoalesce(): LogicCoalesce {
  return new LogicCoalesce();
}

// Factory map for all logic plugins
export const factories = {
  'logic.and': createLogicAnd,
  'logic.or': createLogicOr,
  'logic.not': createLogicNot,
  'logic.xor': createLogicXor,
  'logic.equals': createLogicEquals,
  'logic.notEquals': createLogicNotEquals,
  'logic.gt': createLogicGt,
  'logic.gte': createLogicGte,
  'logic.lt': createLogicLt,
  'logic.lte': createLogicLte,
  'logic.in': createLogicIn,
  'logic.between': createLogicBetween,
  'logic.isNull': createLogicIsNull,
  'logic.isEmpty': createLogicIsEmpty,
  'logic.typeOf': createLogicTypeOf,
  'logic.ternary': createLogicTernary,
  'logic.coalesce': createLogicCoalesce,
};

export default factories;
