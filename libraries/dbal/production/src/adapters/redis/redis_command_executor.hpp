#ifndef DBAL_REDIS_COMMAND_EXECUTOR_HPP
#define DBAL_REDIS_COMMAND_EXECUTOR_HPP

#include <sw/redis++/redis++.h>
#include <string>
#include <vector>
#include <unordered_set>
#include <nlohmann/json.hpp>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace redis {

using Json = nlohmann::json;

/**
 * Command Executor - Wraps Redis commands with error handling
 *
 * Provides type-safe wrappers for Redis operations
 * Handles exceptions and converts to Result<T>
 * Supports GET, SET, DEL, SADD, SREM, SMEMBERS, INCR
 */
class RedisCommandExecutor {
public:
    explicit RedisCommandExecutor(sw::redis::Redis& redis);

    /**
     * SET key value - Store string value
     */
    Result<bool> set(const std::string& key, const std::string& value);

    /**
     * GET key - Retrieve string value
     * Returns std::nullopt if key doesn't exist
     */
    Result<std::optional<std::string>> get(const std::string& key);

    /**
     * DEL key - Delete key(s)
     * Returns number of keys deleted
     */
    Result<long long> del(const std::string& key);
    Result<long long> del(const std::vector<std::string>& keys);

    /**
     * SADD key member - Add member to set
     * Returns number of members added
     */
    Result<long long> sadd(const std::string& key, const std::string& member);

    /**
     * SREM key member - Remove member from set
     * Returns number of members removed
     */
    Result<long long> srem(const std::string& key, const std::string& member);

    /**
     * SMEMBERS key - Get all members from set
     */
    Result<std::unordered_set<std::string>> smembers(const std::string& key);

    /**
     * INCR key - Increment integer value
     * Returns new value after increment
     */
    Result<long long> incr(const std::string& key);

private:
    sw::redis::Redis& redis_;
};

} // namespace redis
} // namespace adapters
} // namespace dbal

#endif // DBAL_REDIS_COMMAND_EXECUTOR_HPP
