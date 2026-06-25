#include "dbal/core/loaders/schema_cache.hpp"
#include "dbal/core/entity_loader.hpp"
#include <algorithm>

namespace dbal {
namespace core {
namespace loaders {

std::optional<EntitySchema> SchemaCache::get(const std::string& entityName) {
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = cache_.find(entityName);
    if (it != cache_.end()) {
        return it->second;
    }

    return std::nullopt;
}

void SchemaCache::put(const std::string& entityName, const EntitySchema& schema) {
    std::lock_guard<std::mutex> lock(mutex_);
    cache_[entityName] = schema;
}

bool SchemaCache::contains(const std::string& entityName) {
    std::lock_guard<std::mutex> lock(mutex_);
    return cache_.find(entityName) != cache_.end();
}

std::vector<std::string> SchemaCache::getEntityNames() {
    std::lock_guard<std::mutex> lock(mutex_);

    std::vector<std::string> names;
    names.reserve(cache_.size());

    for (const auto& pair : cache_) {
        names.push_back(pair.first);
    }

    return names;
}

std::map<std::string, EntitySchema> SchemaCache::getAll() {
    std::lock_guard<std::mutex> lock(mutex_);
    return cache_;
}

void SchemaCache::clear() {
    std::lock_guard<std::mutex> lock(mutex_);
    cache_.clear();
}

void SchemaCache::remove(const std::string& entityName) {
    std::lock_guard<std::mutex> lock(mutex_);
    cache_.erase(entityName);
}

size_t SchemaCache::size() {
    std::lock_guard<std::mutex> lock(mutex_);
    return cache_.size();
}

}  // namespace loaders
}  // namespace core
}  // namespace dbal
