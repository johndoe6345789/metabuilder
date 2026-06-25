#include "redis_connection_pool.hpp"
#include <spdlog/spdlog.h>
#include <stdexcept>

namespace dbal {
namespace adapters {
namespace redis {

RedisConnectionPool::RedisConnectionPool(const std::string& connection_url)
    : connection_url_(connection_url),
      is_valid_(false) {

    spdlog::debug("RedisConnectionPool: Connecting to {}", connection_url);

    try {
        redis_ = std::make_unique<sw::redis::Redis>(connection_url);
        is_valid_ = testConnection();

        if (!is_valid_) {
            throw std::runtime_error("Failed to ping Redis server");
        }

        spdlog::info("RedisConnectionPool: Connected successfully");
    } catch (const std::exception& e) {
        spdlog::error("RedisConnectionPool: Connection failed: {}", e.what());
        throw;
    }
}

bool RedisConnectionPool::testConnection() {
    if (!redis_) {
        return false;
    }

    try {
        redis_->ping();
        return true;
    } catch (const std::exception& e) {
        spdlog::error("RedisConnectionPool: PING failed: {}", e.what());
        return false;
    }
}

sw::redis::Redis& RedisConnectionPool::getConnection() const {
    if (!redis_) {
        throw std::runtime_error("Redis connection not initialized");
    }
    return *redis_;
}

bool RedisConnectionPool::isValid() const {
    return is_valid_ && redis_ != nullptr;
}

void RedisConnectionPool::close() {
    if (redis_) {
        spdlog::info("RedisConnectionPool: Closing connection");
        redis_.reset();
        is_valid_ = false;
    }
}

} // namespace redis
} // namespace adapters
} // namespace dbal
