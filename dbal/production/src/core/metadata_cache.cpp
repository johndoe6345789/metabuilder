#include "dbal/core/metadata_cache.hpp"

namespace dbal {
namespace core {

MetadataCache::MetadataCache(int ttl_seconds)
    : ttl_(ttl_seconds), hits_(0), misses_(0)
{
}

void MetadataCache::cacheAvailableEntities(const std::vector<std::string>& entities) {
    std::lock_guard<std::mutex> lock(mutex_);
    available_entities_.value = entities;
    available_entities_.expiry = calculateExpiry();
}

std::vector<std::string> MetadataCache::getAvailableEntities() const {
    std::lock_guard<std::mutex> lock(mutex_);

    if (available_entities_.isExpired()) {
        ++misses_;
        return {};
    }

    ++hits_;
    return available_entities_.value;
}

bool MetadataCache::hasAvailableEntities() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return !available_entities_.isExpired();
}

void MetadataCache::cacheEntitySchema(const std::string& entity_name, const nlohmann::json& schema) {
    std::lock_guard<std::mutex> lock(mutex_);

    CacheEntry<nlohmann::json> entry;
    entry.value = schema;
    entry.expiry = calculateExpiry();

    entity_schemas_[entity_name] = entry;
}

nlohmann::json MetadataCache::getEntitySchema(const std::string& entity_name) const {
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = entity_schemas_.find(entity_name);
    if (it == entity_schemas_.end() || it->second.isExpired()) {
        ++misses_;
        return nlohmann::json::object();
    }

    ++hits_;
    return it->second.value;
}

bool MetadataCache::hasEntitySchema(const std::string& entity_name) const {
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = entity_schemas_.find(entity_name);
    return it != entity_schemas_.end() && !it->second.isExpired();
}

void MetadataCache::invalidateAll() {
    std::lock_guard<std::mutex> lock(mutex_);

    // Set all entries to expired
    available_entities_.expiry = std::chrono::steady_clock::now();

    for (auto& pair : entity_schemas_) {
        pair.second.expiry = std::chrono::steady_clock::now();
    }
}

void MetadataCache::invalidateSchema(const std::string& entity_name) {
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = entity_schemas_.find(entity_name);
    if (it != entity_schemas_.end()) {
        it->second.expiry = std::chrono::steady_clock::now();
    }
}

nlohmann::json MetadataCache::getStatistics() const {
    std::lock_guard<std::mutex> lock(mutex_);

    nlohmann::json stats;
    stats["hits"] = hits_;
    stats["misses"] = misses_;
    stats["hit_rate"] = (hits_ + misses_ > 0)
        ? static_cast<double>(hits_) / (hits_ + misses_)
        : 0.0;
    stats["cached_entities"] = entity_schemas_.size();
    stats["has_available_entities"] = !available_entities_.isExpired();
    stats["ttl_seconds"] = ttl_.count();

    return stats;
}

std::chrono::steady_clock::time_point MetadataCache::calculateExpiry() const {
    return std::chrono::steady_clock::now() + ttl_;
}

} // namespace core
} // namespace dbal
