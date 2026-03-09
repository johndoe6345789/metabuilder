#include "redis_key_builder.hpp"

namespace dbal {
namespace adapters {
namespace redis {

std::string RedisKeyBuilder::makeKey(const std::string& entity_name, const std::string& id) {
    return entity_name + ":" + id;
}

std::string RedisKeyBuilder::makeSetKey(const std::string& entity_name) {
    return entity_name + ":all";
}

std::string RedisKeyBuilder::makeCounterKey(const std::string& entity_name) {
    return entity_name + ":id_counter";
}

std::string RedisKeyBuilder::makeTenantKey(const std::string& tenant_id,
                                          const std::string& entity_name,
                                          const std::string& id) {
    return tenant_id + ":" + entity_name + ":" + id;
}

} // namespace redis
} // namespace adapters
} // namespace dbal
