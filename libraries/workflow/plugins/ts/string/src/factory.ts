/**
 * Factory for string plugin classes.
 */

import {
  StringConcat,
  StringFormat,
  StringLength,
  StringLower,
  StringUpper,
  StringTrim,
  StringReplace,
  StringSplit,
  StringJoin,
  StringSubstring,
  StringIncludes,
  StringStartsWith,
  StringEndsWith,
  StringPadStart,
  StringPadEnd,
} from './index';

export function createStringConcat(): StringConcat {
  return new StringConcat();
}

export function createStringFormat(): StringFormat {
  return new StringFormat();
}

export function createStringLength(): StringLength {
  return new StringLength();
}

export function createStringLower(): StringLower {
  return new StringLower();
}

export function createStringUpper(): StringUpper {
  return new StringUpper();
}

export function createStringTrim(): StringTrim {
  return new StringTrim();
}

export function createStringReplace(): StringReplace {
  return new StringReplace();
}

export function createStringSplit(): StringSplit {
  return new StringSplit();
}

export function createStringJoin(): StringJoin {
  return new StringJoin();
}

export function createStringSubstring(): StringSubstring {
  return new StringSubstring();
}

export function createStringIncludes(): StringIncludes {
  return new StringIncludes();
}

export function createStringStartsWith(): StringStartsWith {
  return new StringStartsWith();
}

export function createStringEndsWith(): StringEndsWith {
  return new StringEndsWith();
}

export function createStringPadStart(): StringPadStart {
  return new StringPadStart();
}

export function createStringPadEnd(): StringPadEnd {
  return new StringPadEnd();
}

// Factory map for all string plugins
export const factories = {
  'string.concat': createStringConcat,
  'string.format': createStringFormat,
  'string.length': createStringLength,
  'string.lower': createStringLower,
  'string.upper': createStringUpper,
  'string.trim': createStringTrim,
  'string.replace': createStringReplace,
  'string.split': createStringSplit,
  'string.join': createStringJoin,
  'string.substring': createStringSubstring,
  'string.includes': createStringIncludes,
  'string.startsWith': createStringStartsWith,
  'string.endsWith': createStringEndsWith,
  'string.padStart': createStringPadStart,
  'string.padEnd': createStringPadEnd,
};

export default factories;
