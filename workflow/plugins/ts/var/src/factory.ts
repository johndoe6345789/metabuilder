/**
 * Factory for var plugin classes.
 */

import {
  VarGet,
  VarSet,
  VarSetMultiple,
  VarDelete,
  VarExists,
  VarIncrement,
  VarDecrement,
  VarToggle,
  VarAppend,
  VarConcat,
  VarList,
  VarGetAll,
  VarClear,
  VarMerge,
} from './index';

export function createVarGet(): VarGet {
  return new VarGet();
}

export function createVarSet(): VarSet {
  return new VarSet();
}

export function createVarSetMultiple(): VarSetMultiple {
  return new VarSetMultiple();
}

export function createVarDelete(): VarDelete {
  return new VarDelete();
}

export function createVarExists(): VarExists {
  return new VarExists();
}

export function createVarIncrement(): VarIncrement {
  return new VarIncrement();
}

export function createVarDecrement(): VarDecrement {
  return new VarDecrement();
}

export function createVarToggle(): VarToggle {
  return new VarToggle();
}

export function createVarAppend(): VarAppend {
  return new VarAppend();
}

export function createVarConcat(): VarConcat {
  return new VarConcat();
}

export function createVarList(): VarList {
  return new VarList();
}

export function createVarGetAll(): VarGetAll {
  return new VarGetAll();
}

export function createVarClear(): VarClear {
  return new VarClear();
}

export function createVarMerge(): VarMerge {
  return new VarMerge();
}

// Factory map for all var plugins
export const factories = {
  'var.get': createVarGet,
  'var.set': createVarSet,
  'var.setMultiple': createVarSetMultiple,
  'var.delete': createVarDelete,
  'var.exists': createVarExists,
  'var.increment': createVarIncrement,
  'var.decrement': createVarDecrement,
  'var.toggle': createVarToggle,
  'var.append': createVarAppend,
  'var.concat': createVarConcat,
  'var.list': createVarList,
  'var.getAll': createVarGetAll,
  'var.clear': createVarClear,
  'var.merge': createVarMerge,
};

export default factories;
