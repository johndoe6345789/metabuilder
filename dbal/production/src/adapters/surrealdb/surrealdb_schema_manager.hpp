#ifndef DBAL_SURREALDB_SCHEMA_MANAGER_HPP
#define DBAL_SURREALDB_SCHEMA_MANAGER_HPP

#include <string>
#include <vector>
#include <unordered_map>
#include <optional>
#include "dbal/adapters/adapter.hpp"
#include "../schema_loader.hpp"

namespace dbal {
namespace adapters {
namespace surrealdb {

/**
 * Schema Manager - Loads and caches entity schemas from YAML files
 */
class SurrealDBSchemaManager {
public:
    explicit SurrealDBSchemaManager(const std::string& schema_dir);
    
    void loadSchemas();
    std::optional<EntitySchema> getSchema(const std::string& entity_name) const;
    std::vector<std::string> getAvailableEntities() const;
    size_t getSchemaCount() const;
    
private:
    void convertToEntitySchema(const EntityDefinition& def, EntitySchema& schema);
    
    std::string schema_dir_;
    std::unordered_map<std::string, EntitySchema> schemas_;
};

} // namespace surrealdb
} // namespace adapters
} // namespace dbal

#endif
