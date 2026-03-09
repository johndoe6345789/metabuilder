#ifndef DBAL_SCHEMA_CACHE_HPP
#define DBAL_SCHEMA_CACHE_HPP

#include <map>
#include <string>
#include <mutex>
#include <optional>
#include <vector>

namespace dbal {
namespace core {

// Forward declaration
struct EntitySchema;

namespace loaders {

/**
 * @brief Thread-safe in-memory cache for loaded schemas
 *
 * Responsible for:
 * - Caching loaded schemas to avoid re-parsing YAML
 * - Thread-safe access to cached schemas
 * - Cache invalidation and updates
 */
class SchemaCache {
public:
    /**
     * @brief Get schema from cache
     * @param entityName Name of entity
     * @return Schema if found, std::nullopt otherwise
     */
    std::optional<EntitySchema> get(const std::string& entityName);

    /**
     * @brief Put schema into cache
     * @param entityName Name of entity
     * @param schema Schema to cache
     */
    void put(const std::string& entityName, const EntitySchema& schema);

    /**
     * @brief Check if schema exists in cache
     * @param entityName Name of entity
     * @return true if schema is cached
     */
    bool contains(const std::string& entityName);

    /**
     * @brief Get all cached schema names
     * @return Vector of entity names in cache
     */
    std::vector<std::string> getEntityNames();

    /**
     * @brief Get all cached schemas
     * @return Map of entity name to schema
     */
    std::map<std::string, EntitySchema> getAll();

    /**
     * @brief Clear entire cache
     */
    void clear();

    /**
     * @brief Remove single schema from cache
     * @param entityName Name of entity to remove
     */
    void remove(const std::string& entityName);

    /**
     * @brief Get cache size
     * @return Number of cached schemas
     */
    size_t size();

private:
    std::map<std::string, EntitySchema> cache_;
    mutable std::mutex mutex_;
};

}  // namespace loaders
}  // namespace core
}  // namespace dbal

#endif  // DBAL_SCHEMA_CACHE_HPP
