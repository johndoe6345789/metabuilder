/**
 * Factory for convert plugin classes.
 */

import {
  ConvertToString,
  ConvertToNumber,
  ConvertToInteger,
  ConvertToFloat,
  ConvertToBoolean,
  ConvertToArray,
  ConvertToObject,
  ConvertParseJson,
  ConvertToJson,
  ConvertParseDate,
  ConvertFormatDate,
  ConvertBase64Encode,
  ConvertBase64Decode,
  ConvertUrlEncode,
  ConvertUrlDecode,
} from './index';

export function createConvertToString(): ConvertToString {
  return new ConvertToString();
}

export function createConvertToNumber(): ConvertToNumber {
  return new ConvertToNumber();
}

export function createConvertToInteger(): ConvertToInteger {
  return new ConvertToInteger();
}

export function createConvertToFloat(): ConvertToFloat {
  return new ConvertToFloat();
}

export function createConvertToBoolean(): ConvertToBoolean {
  return new ConvertToBoolean();
}

export function createConvertToArray(): ConvertToArray {
  return new ConvertToArray();
}

export function createConvertToObject(): ConvertToObject {
  return new ConvertToObject();
}

export function createConvertParseJson(): ConvertParseJson {
  return new ConvertParseJson();
}

export function createConvertToJson(): ConvertToJson {
  return new ConvertToJson();
}

export function createConvertParseDate(): ConvertParseDate {
  return new ConvertParseDate();
}

export function createConvertFormatDate(): ConvertFormatDate {
  return new ConvertFormatDate();
}

export function createConvertBase64Encode(): ConvertBase64Encode {
  return new ConvertBase64Encode();
}

export function createConvertBase64Decode(): ConvertBase64Decode {
  return new ConvertBase64Decode();
}

export function createConvertUrlEncode(): ConvertUrlEncode {
  return new ConvertUrlEncode();
}

export function createConvertUrlDecode(): ConvertUrlDecode {
  return new ConvertUrlDecode();
}

// Factory map for all convert plugins
export const factories = {
  'convert.toString': createConvertToString,
  'convert.toNumber': createConvertToNumber,
  'convert.toInteger': createConvertToInteger,
  'convert.toFloat': createConvertToFloat,
  'convert.toBoolean': createConvertToBoolean,
  'convert.toArray': createConvertToArray,
  'convert.toObject': createConvertToObject,
  'convert.parseJson': createConvertParseJson,
  'convert.toJson': createConvertToJson,
  'convert.parseDate': createConvertParseDate,
  'convert.formatDate': createConvertFormatDate,
  'convert.base64Encode': createConvertBase64Encode,
  'convert.base64Decode': createConvertBase64Decode,
  'convert.urlEncode': createConvertUrlEncode,
  'convert.urlDecode': createConvertUrlDecode,
};

export default factories;
