/**
 * Factory for dict plugin classes.
 */

import {
  DictGet,
  DictSet,
  DictDelete,
  DictKeys,
  DictValues,
  DictEntries,
  DictFromEntries,
  DictMerge,
  DictDeepMerge,
  DictPick,
  DictOmit,
  DictHas,
  DictSize,
  DictInvert,
  DictMapValues,
  DictFilterEntries,
} from './index';

export function createDictGet(): DictGet {
  return new DictGet();
}

export function createDictSet(): DictSet {
  return new DictSet();
}

export function createDictDelete(): DictDelete {
  return new DictDelete();
}

export function createDictKeys(): DictKeys {
  return new DictKeys();
}

export function createDictValues(): DictValues {
  return new DictValues();
}

export function createDictEntries(): DictEntries {
  return new DictEntries();
}

export function createDictFromEntries(): DictFromEntries {
  return new DictFromEntries();
}

export function createDictMerge(): DictMerge {
  return new DictMerge();
}

export function createDictDeepMerge(): DictDeepMerge {
  return new DictDeepMerge();
}

export function createDictPick(): DictPick {
  return new DictPick();
}

export function createDictOmit(): DictOmit {
  return new DictOmit();
}

export function createDictHas(): DictHas {
  return new DictHas();
}

export function createDictSize(): DictSize {
  return new DictSize();
}

export function createDictInvert(): DictInvert {
  return new DictInvert();
}

export function createDictMapValues(): DictMapValues {
  return new DictMapValues();
}

export function createDictFilterEntries(): DictFilterEntries {
  return new DictFilterEntries();
}

// Factory map for all dict plugins
export const factories = {
  'dict.get': createDictGet,
  'dict.set': createDictSet,
  'dict.delete': createDictDelete,
  'dict.keys': createDictKeys,
  'dict.values': createDictValues,
  'dict.entries': createDictEntries,
  'dict.fromEntries': createDictFromEntries,
  'dict.merge': createDictMerge,
  'dict.deepMerge': createDictDeepMerge,
  'dict.pick': createDictPick,
  'dict.omit': createDictOmit,
  'dict.has': createDictHas,
  'dict.size': createDictSize,
  'dict.invert': createDictInvert,
  'dict.mapValues': createDictMapValues,
  'dict.filterEntries': createDictFilterEntries,
};

export default factories;
