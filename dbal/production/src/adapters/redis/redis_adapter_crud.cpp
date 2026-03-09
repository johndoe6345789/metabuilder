#include "redis_adapter.hpp"
#include "redis_key_builder.hpp"
#include "redis_value_serializer.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace redis {

Result<Json> RedisAdapter::create(const std::string& entityName, const Json& data) {
    if (!schema_manager_.getSchema(entityName)) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }

    std::string id = data.contains("id") && !data["id"].is_null()
        ? data["id"].get<std::string>()
        : generateId(entityName);

    Json record = data;
    record["id"] = id;

    const std::string key = RedisKeyBuilder::makeKey(entityName, id);
    const std::string value = RedisValueSerializer::serialize(record);

    auto set_result = command_executor_.set(key, value);
    if (!set_result.isOk()) {
        return Error(set_result.error().code(), set_result.error().what());
    }

    const std::string set_key = RedisKeyBuilder::makeSetKey(entityName);
    command_executor_.sadd(set_key, id);

    // Record operation for compensating transaction
    if (compensating_tx_ && compensating_tx_->isActive()) {
        compensating_tx_->recordCreate(entityName, id);
    }

    spdlog::debug("RedisAdapter: Created {} with id {}", entityName, id);
    return record;
}

Result<Json> RedisAdapter::read(const std::string& entityName, const std::string& id) {
    if (!schema_manager_.getSchema(entityName)) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }

    const std::string key = RedisKeyBuilder::makeKey(entityName, id);
    auto get_result = command_executor_.get(key);

    if (!get_result.isOk()) {
        return Error(get_result.error().code(), get_result.error().what());
    }

    if (!get_result.value()) {
        return Error(ErrorCode::NotFound, entityName + " with id " + id + " not found");
    }

    return RedisValueSerializer::deserialize(*get_result.value());
}

Result<Json> RedisAdapter::update(const std::string& entityName, const std::string& id, const Json& data) {
    auto read_result = read(entityName, id);
    if (!read_result.isOk()) {
        return read_result;
    }

    // Snapshot old data for compensating transaction before update
    if (compensating_tx_ && compensating_tx_->isActive()) {
        compensating_tx_->recordUpdate(entityName, id, read_result.value());
    }

    Json record = read_result.value();
    for (auto it = data.begin(); it != data.end(); ++it) {
        record[it.key()] = it.value();
    }

    const std::string key = RedisKeyBuilder::makeKey(entityName, id);
    const std::string value = RedisValueSerializer::serialize(record);

    auto set_result = command_executor_.set(key, value);
    if (!set_result.isOk()) {
        return Error(set_result.error().code(), set_result.error().what());
    }

    spdlog::debug("RedisAdapter: Updated {} {}", entityName, id);
    return record;
}

Result<bool> RedisAdapter::remove(const std::string& entityName, const std::string& id) {
    // Snapshot old data for compensating transaction before delete
    if (compensating_tx_ && compensating_tx_->isActive()) {
        auto oldData = read(entityName, id);
        if (oldData.isOk()) {
            compensating_tx_->recordDelete(entityName, oldData.value());
        }
    }

    const std::string key = RedisKeyBuilder::makeKey(entityName, id);
    auto del_result = command_executor_.del(key);

    if (!del_result.isOk()) {
        return Error(del_result.error().code(), del_result.error().what());
    }

    if (del_result.value() == 0) {
        return Error(ErrorCode::NotFound, entityName + " with id " + id + " not found");
    }

    const std::string set_key = RedisKeyBuilder::makeSetKey(entityName);
    command_executor_.srem(set_key, id);

    spdlog::debug("RedisAdapter: Deleted {} {}", entityName, id);
    return true;
}

} // namespace redis
} // namespace adapters
} // namespace dbal
