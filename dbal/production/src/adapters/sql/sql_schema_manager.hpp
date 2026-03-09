#ifndef DBAL_SQL_SCHEMA_MANAGER_HPP
#define DBAL_SQL_SCHEMA_MANAGER_HPP

#include <string>
#include <vector>
#include <unordered_map>
#include <optional>
#include "dbal/types.hpp"
#include "dbal/adapters/adapter.hpp"
#include "../schema_loader.hpp"

namespace dbal {
namespace adapters {
namespace sql {

/**
 * SQL Schema Manager - Loads and caches entity schemas from YAML files
 *
 * Handles:
 * - Schema loading from directory
 * - Schema caching (name → EntitySchema)
 * - Schema lookup by entity name
 * - CREATE TABLE generation and execution
 */
class SqlSchemaManager {
public:
    explicit SqlSchemaManager(const std::string& schema_dir);

    /**
     * Load all entity schemas from directory
     */
    void loadSchemas();

    /**
     * Get schema for specific entity
     */
    std::optional<EntitySchema> getSchema(const std::string& entity_name) const;

    /**
     * Get list of all available entities
     */
    std::vector<std::string> getAvailableEntities() const;

    /**
     * Get number of loaded schemas
     */
    size_t getSchemaCount() const;

private:
    void convertToEntitySchema(const EntityDefinition& def, EntitySchema& schema);

    std::string schema_dir_;
    std::unordered_map<std::string, EntitySchema> schemas_;
};

} // namespace sql
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_SCHEMA_MANAGER_HPP
