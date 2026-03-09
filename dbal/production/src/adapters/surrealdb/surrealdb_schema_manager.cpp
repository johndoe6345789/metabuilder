#include "surrealdb_schema_manager.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace surrealdb {

SurrealDBSchemaManager::SurrealDBSchemaManager(const std::string& schema_dir)
    : schema_dir_(schema_dir) {
}

void SurrealDBSchemaManager::loadSchemas() {
    auto entities = SchemaLoader::loadFromDirectory(schema_dir_);

    for (const auto& entity_def : entities) {
        EntitySchema schema;
        convertToEntitySchema(entity_def, schema);
        schemas_[entity_def.name] = schema;
    }

    spdlog::info("SurrealDBSchemaManager: Loaded {} entity schemas", schemas_.size());
}

std::optional<EntitySchema> SurrealDBSchemaManager::getSchema(const std::string& entity_name) const {
    auto it = schemas_.find(entity_name);
    if (it != schemas_.end()) {
        return it->second;
    }
    return std::nullopt;
}

std::vector<std::string> SurrealDBSchemaManager::getAvailableEntities() const {
    std::vector<std::string> entities;
    entities.reserve(schemas_.size());

    for (const auto& [name, schema] : schemas_) {
        entities.push_back(name);
    }

    return entities;
}

size_t SurrealDBSchemaManager::getSchemaCount() const {
    return schemas_.size();
}

void SurrealDBSchemaManager::convertToEntitySchema(const EntityDefinition& def, EntitySchema& schema) {
    schema.name = def.name;
    schema.displayName = def.description;

    for (const auto& field : def.fields) {
        EntityField f;
        f.name = field.name;
        f.type = field.type;
        f.required = field.required;
        f.unique = field.unique;
        if (field.default_value.has_value()) {
            f.defaultValue = field.default_value.value();
        }
        schema.fields.push_back(f);
    }
}

} // namespace surrealdb
} // namespace adapters
} // namespace dbal
