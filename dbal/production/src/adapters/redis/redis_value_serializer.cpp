#include "redis_value_serializer.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace redis {

std::string RedisValueSerializer::serialize(const Json& data) {
    try {
        return data.dump();
    } catch (const std::exception& e) {
        spdlog::error("RedisValueSerializer: Serialization failed: {}", e.what());
        return {};  // Empty string indicates error - callers must check
    }
}

Result<Json> RedisValueSerializer::deserialize(const std::string& data) {
    try {
        return Json::parse(data);
    } catch (const std::exception& e) {
        spdlog::error("RedisValueSerializer: Deserialization failed: {}", e.what());
        return Error(ErrorCode::InternalError,
                    std::string("Failed to parse JSON: ") + e.what());
    }
}

bool RedisValueSerializer::isValidJson(const std::string& data) {
    try {
        Json::parse(data);
        return true;
    } catch (const std::exception&) {
        return false;
    }
}

std::string RedisValueSerializer::serializePretty(const Json& data) {
    try {
        return data.dump(2); // Indent with 2 spaces
    } catch (const std::exception& e) {
        spdlog::error("RedisValueSerializer: Pretty serialization failed: {}", e.what());
        return {};  // Empty string indicates error - callers must check
    }
}

} // namespace redis
} // namespace adapters
} // namespace dbal
