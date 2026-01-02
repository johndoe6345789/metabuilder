-- Type definitions for schema_editor package
-- Central types file for database schema editing
-- @meta

-- Re-export fields types
local fields = require("fields")

---@alias FieldType "string"|"integer"|"float"|"boolean"|"date"|"datetime"|"text"|"json"

---@alias IndexType "btree"|"hash"|"gin"|"gist"

---@alias OnDeleteAction "CASCADE"|"SET NULL"|"RESTRICT"|"NO ACTION"|"SET DEFAULT"

---@alias OnUpdateAction "CASCADE"|"SET NULL"|"RESTRICT"|"NO ACTION"|"SET DEFAULT"

---@class ColumnConstraint
---@field type "primaryKey"|"unique"|"notNull"|"check"|"default"|"foreignKey"
---@field value? any Constraint value (for check/default)
---@field expression? string Check expression

---@class ColumnDefinition
---@field name string Column name
---@field type FieldType Column data type
---@field nullable boolean Whether column can be null
---@field default? any Default value
---@field unique boolean Whether column must be unique
---@field primaryKey boolean Whether column is primary key
---@field autoIncrement boolean Whether column auto-increments
---@field references? ForeignKeyReference Foreign key reference
---@field constraints ColumnConstraint[] Additional constraints
---@field comment? string Column comment/description

---@class ForeignKeyReference
---@field table string Referenced table name
---@field column string Referenced column name
---@field onDelete OnDeleteAction On delete action
---@field onUpdate OnUpdateAction On update action

---@class IndexDefinition
---@field name string Index name
---@field columns string[] Columns in index
---@field type IndexType Index type
---@field unique boolean Whether index is unique
---@field where? string Partial index condition

---@class TableDefinition
---@field name string Table name
---@field schema? string Schema name (default: public)
---@field columns ColumnDefinition[] Table columns
---@field indexes IndexDefinition[] Table indexes
---@field primaryKey string[] Primary key columns
---@field comment? string Table comment/description

---@class RelationDefinition
---@field name string Relation name
---@field type "one-to-one"|"one-to-many"|"many-to-many"
---@field sourceTable string Source table name
---@field sourceColumn string Source column name
---@field targetTable string Target table name
---@field targetColumn string Target column name
---@field throughTable? string Junction table for many-to-many
---@field sourceThrough? string Source foreign key in junction
---@field targetThrough? string Target foreign key in junction

---@class SchemaDefinition
---@field name string Schema name
---@field tables TableDefinition[] Tables in schema
---@field relations RelationDefinition[] Relations between tables
---@field version string Schema version

---@class MigrationStep
---@field type "createTable"|"dropTable"|"addColumn"|"dropColumn"|"addIndex"|"dropIndex"|"renameTable"|"renameColumn"|"alterColumn"
---@field table string Target table
---@field column? string Target column
---@field definition? ColumnDefinition|TableDefinition|IndexDefinition New definition
---@field newName? string New name for rename operations

---@class Migration
---@field id string Migration identifier
---@field description string Migration description
---@field timestamp number Creation timestamp
---@field up MigrationStep[] Steps to apply migration
---@field down MigrationStep[] Steps to revert migration

---@class SchemaEditorProps
---@field schema SchemaDefinition Current schema
---@field onSave fun(schema: SchemaDefinition): void Save callback
---@field onCancel fun(): void Cancel callback
---@field readonly? boolean Read-only mode

---@class SchemaValidationResult
---@field valid boolean Whether schema is valid
---@field errors SchemaError[] Validation errors
---@field warnings SchemaWarning[] Validation warnings

---@class SchemaError
---@field table string Table name
---@field column? string Column name
---@field message string Error message
---@field code string Error code

---@class SchemaWarning
---@field table string Table name
---@field column? string Column name
---@field message string Warning message
---@field suggestion? string Suggested fix

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
