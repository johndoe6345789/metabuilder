-- Type definitions for codegen_studio package
-- Central types for code generation and blueprint management
-- @meta

---@alias TemplateLanguage "typescript"|"javascript"|"python"|"lua"|"rust"|"go"|"java"|"csharp"

---@alias FileType "component"|"service"|"model"|"util"|"test"|"config"|"schema"|"api"

---@class BlueprintFile
---@field path string File path relative to output directory
---@field content string File content (may be template)
---@field type FileType File type category
---@field language TemplateLanguage Target language
---@field overwrite boolean Whether to overwrite if exists

---@class BlueprintVariable
---@field name string Variable name
---@field type "string"|"number"|"boolean"|"array"|"object" Variable type
---@field default any Default value
---@field required boolean Whether variable is required
---@field description string Variable description
---@field validation? string Validation regex pattern

---@class Blueprint
---@field id string Blueprint identifier
---@field name string Blueprint name
---@field description string Blueprint description
---@field version string Blueprint version
---@field author string Blueprint author
---@field category string Blueprint category
---@field tags string[] Blueprint tags
---@field variables BlueprintVariable[] Template variables
---@field files BlueprintFile[] Files to generate
---@field dependencies? string[] Required package dependencies
---@field postGenerate? string[] Post-generation commands

---@class GenerationContext
---@field blueprint Blueprint Blueprint being generated
---@field variables table<string, any> Variable values
---@field outputDir string Output directory path
---@field dryRun boolean Whether to simulate generation

---@class GenerationResult
---@field success boolean Whether generation succeeded
---@field files string[] Generated file paths
---@field errors string[] Error messages
---@field warnings string[] Warning messages
---@field duration number Generation duration in ms

---@class ZipPlan
---@field name string Archive name
---@field files BlueprintFile[] Files to include
---@field includeReadme boolean Include README
---@field includeManifest boolean Include manifest.json

---@class ZipResult
---@field success boolean Whether zip creation succeeded
---@field path string Output zip path
---@field size number Archive size in bytes
---@field error? string Error message if failed

---@class CodegenPermissions
---@field canCreate boolean Can create blueprints
---@field canEdit boolean Can edit blueprints
---@field canDelete boolean Can delete blueprints
---@field canExport boolean Can export blueprints
---@field canImport boolean Can import blueprints
---@field maxBlueprints number Maximum blueprints allowed

---@class CodegenStudioConfig
---@field blueprints Blueprint[] Available blueprints
---@field permissions CodegenPermissions User permissions
---@field defaultLanguage TemplateLanguage Default target language
---@field outputDirectory string Default output directory
---@field templateEngine "mustache"|"handlebars"|"ejs" Template engine

---@class CodegenStudioProps
---@field config CodegenStudioConfig Studio configuration
---@field onGenerate? fun(result: GenerationResult): void Generation callback
---@field onExport? fun(result: ZipResult): void Export callback
---@field onImport? fun(blueprint: Blueprint): void Import callback

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
