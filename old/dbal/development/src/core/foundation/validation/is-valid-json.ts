import { isValidJsonString as isValidJsonStringPredicate } from '../../validation/predicates/string/is-valid-json'

export const isValidJsonString = (value: string): boolean => isValidJsonStringPredicate(value)
