#ifndef DBAL_CORE_METADATA_CACHE_HPP
#define DBAL_CORE_METADATA_CACHE_HPP

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <mutex>
#include <chrono>
#include <nlohmann/json.hpp>

namespace dbal {
namespace core {

/**
 * Cache entry with TTL (time-to-live) support.
 */
template<typename T>
struct CacheEntry {
    T value;
    std::chrono::steady_clock::time_point expiry;

    bool isExpired() const {
        return std::chrono::steady_clock::now() >= expiry;
    }
};

/**
 * Thread-safe cache for entity metadata.
 *
 * Caches:
 * - Available entity names (getAvailableEntities)
 * - Entity schemas (getEntitySchema)
 * - Field metadata
 * - Relationship definitions
 *
 * Features:
 * - TTL-based expiration (default: 5 minutes)
 * - Thread-safe read/write operations
 * - Configurable cache size limits
 * - Manual invalidation support
 */
class MetadataCache {
public:
    /**
     * Construct cache with default TTL.
     *
     * @param ttl_seconds Time-to-live for cache entries (default: 300s = 5min)
     */
    explicit MetadataCache(int ttl_seconds = 300);

    /**
     * Cache available entity names.
     *
     * @param entities List of entity names
     */
    void cacheAvailableEntities(const std::vector<std::string>& entities);

    /**
     * Get cached available entities.
     *
     * @return Cached entity list, or empty vector if cache miss/expired
     */
    std::vector<std::string> getAvailableEntities() const;

    /**
     * Check if available entities are cached and valid.
     */
    bool hasAvailableEntities() const;

    /**
     * Cache entity schema.
     *
     * @param entity_name Entity name
     * @param schema JSON schema definition
     */
    void cacheEntitySchema(const std::string& entity_name, const nlohmann::json& schema);

    /**
     * Get cached entity schema.
     *
     * @param entity_name Entity name
     * @return Cached schema, or empty JSON if cache miss/expired
     */
    nlohmann::json getEntitySchema(const std::string& entity_name) const;

    /**
     * Check if entity schema is cached and valid.
     *
     * @param entity_name Entity name
     */
    bool hasEntitySchema(const std::string& entity_name) const;

    /**
     * Invalidate all cached data.
     */
    void invalidateAll();

    /**
     * Invalidate specific entity schema.
     *
     * @param entity_name Entity name
     */
    void invalidateSchema(const std::string& entity_name);

    /**
     * Get cache statistics.
     *
     * @return JSON object with hit/miss counts, entry counts
     */
    nlohmann::json getStatistics() const;

private:
    std::chrono::seconds ttl_;
    mutable std::mutex mutex_;

    // Cached data
    CacheEntry<std::vector<std::string>> available_entities_;
    std::map<std::string, CacheEntry<nlohmann::json>> entity_schemas_;

    // Statistics
    mutable size_t hits_;
    mutable size_t misses_;

    std::chrono::steady_clock::time_point calculateExpiry() const;
};

} // namespace core
} // namespace dbal

#endif // DBAL_CORE_METADATA_CACHE_HPP
