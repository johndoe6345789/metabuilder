-- Schema fields module

---@class FieldsModule
---@field string fun(name: string, required?: boolean, min_length?: number, max_length?: number): StringFieldDefinition
---@field number fun(name: string, required?: boolean, min?: number, max?: number): NumberFieldDefinition
---@field boolean fun(name: string, required?: boolean, default_value?: boolean): BooleanFieldDefinition
---@field array fun(name: string, items_type: string, required?: boolean): ArrayFieldDefinition

---@type FieldsModule
local fields = {
  string = require("fields.string"),
  number = require("fields.number"),
  boolean = require("fields.boolean"),
  array = require("fields.array")
}

return fields
