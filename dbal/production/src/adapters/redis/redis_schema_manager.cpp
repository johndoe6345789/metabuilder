#include "redis_schema_manager.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace redis {

RedisSchemaManager::RedisSchemaManager(const std::string& schema_dir)
    : schema_dir_(schema_dir) {
}

void RedisSchemaManager::loadSchemas() {
    auto entities = SchemaLoader::loadFromDirectory(schema_dir_);
    for (const auto& entity : entities) {
        schemas_[entity.name] = entity;
    }
    spdlog::debug("RedisSchemaManager: Loaded {} entity schemas", schemas_.size());
}

std::optional<EntityDefinition> RedisSchemaManager::getSchema(const std::string& entity_name) const {
    const auto it = schemas_.find(entity_name);
    if (it != schemas_.end()) {
        return it->second;
    }
    return std::nullopt;
}

std::vector<std::string> RedisSchemaManager::getAvailableEntities() const {
    std::vector<std::string> entities;
    entities.reserve(schemas_.size());

    for (const auto& [name, schema] : schemas_) {
        entities.push_back(name);
    }

    return entities;
}

size_t RedisSchemaManager::getSchemaCount() const {
    return schemas_.size();
}

} // namespace redis
} // namespace adapters
} // namespace dbal
