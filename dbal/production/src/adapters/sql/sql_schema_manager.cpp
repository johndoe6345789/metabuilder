#include "sql_schema_manager.hpp"
#include <spdlog/spdlog.h>
#include <unordered_set>
#include "dbal/adapters/adapter.hpp"

namespace dbal {
namespace adapters {
namespace sql {

SqlSchemaManager::SqlSchemaManager(const std::string& schema_dir)
    : schema_dir_(schema_dir) {
}

void SqlSchemaManager::loadSchemas() {
    spdlog::info("SqlSchemaManager: Loading schemas from {}", schema_dir_);

    // Load all entity definitions from YAML files
    auto entities = SchemaLoader::loadFromDirectory(schema_dir_);

    // Convert to EntitySchema format and cache
    for (const auto& entity_def : entities) {
        EntitySchema schema;
        convertToEntitySchema(entity_def, schema);

        // Store with both original and lowercase names for flexible lookup
        schemas_[entity_def.name] = schema;

        // Also store lowercase version
        std::string lowercase_name = entity_def.name;
        std::transform(lowercase_name.begin(), lowercase_name.end(),
                      lowercase_name.begin(), ::tolower);
        schemas_[lowercase_name] = schema;
    }

    spdlog::info("SqlSchemaManager: Loaded {} schemas", entities.size());
}

std::optional<EntitySchema> SqlSchemaManager::getSchema(const std::string& entity_name) const {
    auto it = schemas_.find(entity_name);
    if (it != schemas_.end()) {
        return it->second;
    }
    return std::nullopt;
}

std::vector<std::string> SqlSchemaManager::getAvailableEntities() const {
    std::vector<std::string> entities;
    entities.reserve(schemas_.size() / 2); // Divided by 2 because we store both cases

    // Collect unique entity names (avoid duplicates from lowercase variants)
    std::unordered_set<std::string> seen;
    for (const auto& [name, schema] : schemas_) {
        if (seen.find(schema.name) == seen.end()) {
            entities.push_back(schema.name);
            seen.insert(schema.name);
        }
    }

    return entities;
}

size_t SqlSchemaManager::getSchemaCount() const {
    return schemas_.size() / 2; // Divided by 2 because we store both cases
}

void SqlSchemaManager::convertToEntitySchema(const EntityDefinition& def,
                                             EntitySchema& schema) {
    schema.name = def.name;
    schema.displayName = def.description;  // EntityDefinition has description, not display_name

    // Convert fields
    schema.fields.reserve(def.fields.size());
    for (const auto& field_def : def.fields) {  // def.fields is a vector, not a map
        EntityField field;
        field.name = field_def.name;
        field.type = field_def.type;
        field.required = field_def.required;
        field.unique = field_def.unique;

        if (field_def.default_value.has_value()) {
            field.defaultValue = field_def.default_value.value();
        }

        schema.fields.push_back(field);
    }
}

} // namespace sql
} // namespace adapters
} // namespace dbal
