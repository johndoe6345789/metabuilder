#include "redis_command_executor.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace redis {

RedisCommandExecutor::RedisCommandExecutor(sw::redis::Redis& redis)
    : redis_(redis) {
}

Result<bool> RedisCommandExecutor::set(const std::string& key, const std::string& value) {
    try {
        redis_.set(key, value);
        return true;
    } catch (const std::exception& e) {
        spdlog::error("RedisCommandExecutor: SET failed for key '{}': {}", key, e.what());
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<std::optional<std::string>> RedisCommandExecutor::get(const std::string& key) {
    try {
        auto value = redis_.get(key);
        return value;
    } catch (const std::exception& e) {
        spdlog::error("RedisCommandExecutor: GET failed for key '{}': {}", key, e.what());
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<long long> RedisCommandExecutor::del(const std::string& key) {
    try {
        const long long deleted = redis_.del(key);
        return deleted;
    } catch (const std::exception& e) {
        spdlog::error("RedisCommandExecutor: DEL failed for key '{}': {}", key, e.what());
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<long long> RedisCommandExecutor::del(const std::vector<std::string>& keys) {
    try {
        const long long deleted = redis_.del(keys.begin(), keys.end());
        return deleted;
    } catch (const std::exception& e) {
        spdlog::error("RedisCommandExecutor: DEL failed for multiple keys: {}", e.what());
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<long long> RedisCommandExecutor::sadd(const std::string& key, const std::string& member) {
    try {
        const long long added = redis_.sadd(key, member);
        return added;
    } catch (const std::exception& e) {
        spdlog::error("RedisCommandExecutor: SADD failed for key '{}': {}", key, e.what());
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<long long> RedisCommandExecutor::srem(const std::string& key, const std::string& member) {
    try {
        const long long removed = redis_.srem(key, member);
        return removed;
    } catch (const std::exception& e) {
        spdlog::error("RedisCommandExecutor: SREM failed for key '{}': {}", key, e.what());
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<std::unordered_set<std::string>> RedisCommandExecutor::smembers(const std::string& key) {
    try {
        std::unordered_set<std::string> members;
        redis_.smembers(key, std::inserter(members, members.begin()));
        return members;
    } catch (const std::exception& e) {
        spdlog::error("RedisCommandExecutor: SMEMBERS failed for key '{}': {}", key, e.what());
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<long long> RedisCommandExecutor::incr(const std::string& key) {
    try {
        const long long new_value = redis_.incr(key);
        return new_value;
    } catch (const std::exception& e) {
        spdlog::error("RedisCommandExecutor: INCR failed for key '{}': {}", key, e.what());
        return Error(ErrorCode::InternalError, e.what());
    }
}

} // namespace redis
} // namespace adapters
} // namespace dbal
