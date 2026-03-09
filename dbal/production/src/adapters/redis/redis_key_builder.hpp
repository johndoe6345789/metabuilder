#ifndef DBAL_REDIS_KEY_BUILDER_HPP
#define DBAL_REDIS_KEY_BUILDER_HPP

#include <string>

namespace dbal {
namespace adapters {
namespace redis {

/**
 * Key Builder - Static utilities for generating namespaced Redis keys
 *
 * Generates keys in format: "entity:id"
 * Provides consistent key naming across the adapter
 * Handles entity sets and ID counters
 */
class RedisKeyBuilder {
public:
    /**
     * Build key for single entity record
     *
     * Example:
     *   makeKey("users", "123") → "users:123"
     */
    static std::string makeKey(const std::string& entity_name, const std::string& id);

    /**
     * Build key for entity set (stores all IDs for entity type)
     *
     * Example:
     *   makeSetKey("users") → "users:all"
     */
    static std::string makeSetKey(const std::string& entity_name);

    /**
     * Build key for entity ID counter (auto-increment IDs)
     *
     * Example:
     *   makeCounterKey("users") → "users:id_counter"
     */
    static std::string makeCounterKey(const std::string& entity_name);

    /**
     * Build key with tenant namespace
     *
     * Example:
     *   makeTenantKey("acme", "users", "123") → "acme:users:123"
     */
    static std::string makeTenantKey(const std::string& tenant_id,
                                     const std::string& entity_name,
                                     const std::string& id);
};

} // namespace redis
} // namespace adapters
} // namespace dbal

#endif // DBAL_REDIS_KEY_BUILDER_HPP
