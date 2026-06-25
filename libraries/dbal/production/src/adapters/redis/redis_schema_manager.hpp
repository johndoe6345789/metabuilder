#ifndef DBAL_REDIS_SCHEMA_MANAGER_HPP
#define DBAL_REDIS_SCHEMA_MANAGER_HPP

#include <string>
#include <vector>
#include <unordered_map>
#include <optional>
#include "dbal/types.hpp"
#include "dbal/adapters/adapter.hpp"
#include "../schema_loader.hpp"

namespace dbal {
namespace adapters {
namespace redis {

/**
 * Schema Manager - Manages entity schema loading and lookup
 *
 * Handles schema loading from YAML definitions
 * Provides schema lookup and validation
 * Caches schemas for fast access
 */
class RedisSchemaManager {
public:
    explicit RedisSchemaManager(const std::string& schema_dir);

    /**
     * Load all schemas from directory
     */
    void loadSchemas();

    /**
     * Get schema by entity name
     * Returns std::nullopt if not found
     */
    std::optional<EntityDefinition> getSchema(const std::string& entity_name) const;

    /**
     * Get list of all available entities
     */
    std::vector<std::string> getAvailableEntities() const;

    /**
     * Get count of loaded schemas
     */
    size_t getSchemaCount() const;

private:
    std::string schema_dir_;
    std::unordered_map<std::string, EntityDefinition> schemas_;
};

} // namespace redis
} // namespace adapters
} // namespace dbal

#endif // DBAL_REDIS_SCHEMA_MANAGER_HPP
