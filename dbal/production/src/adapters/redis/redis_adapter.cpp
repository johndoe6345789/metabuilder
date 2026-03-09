#include "redis_adapter.hpp"
#include "redis_connection_pool.hpp"
#include "redis_key_builder.hpp"
#include "redis_schema_manager.hpp"
#include "../../config/env_config.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace redis {

RedisAdapter::RedisAdapter(const std::string& connection_url)
    : connection_url_(connection_url),
      connection_pool_(connection_url),
      command_executor_(connection_pool_.getConnection()),
      schema_manager_(config::EnvConfig::getSchemaDir()),
      operations_(*this) {

    spdlog::info("RedisAdapter: Connecting to Redis at {}", connection_url);

    try {
        schema_manager_.loadSchemas();
        spdlog::info("RedisAdapter: Connected successfully, loaded {} schemas",
                    schema_manager_.getSchemaCount());
    } catch (const std::exception& e) {
        spdlog::error("RedisAdapter: Failed to initialize: {}", e.what());
        throw;
    }
}

RedisAdapter::~RedisAdapter() {
    close();
}

void RedisAdapter::close() {
    connection_pool_.close();
}

// ===== Transaction Support =====

Result<bool> RedisAdapter::beginTransaction() {
    if (compensating_tx_ && compensating_tx_->isActive()) {
        return Error::internal("Transaction already in progress");
    }
    compensating_tx_ = std::make_unique<dbal::core::CompensatingTransaction>(*this);
    return Result<bool>(true);
}

Result<bool> RedisAdapter::commitTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error::internal("No transaction in progress");
    }
    compensating_tx_->commit();
    compensating_tx_.reset();
    return Result<bool>(true);
}

Result<bool> RedisAdapter::rollbackTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error::internal("No transaction in progress");
    }
    auto result = compensating_tx_->rollback();
    compensating_tx_.reset();
    return result;
}

std::string RedisAdapter::generateId(const std::string& entityName) {
    const std::string counter_key = RedisKeyBuilder::makeCounterKey(entityName);
    auto incr_result = command_executor_.incr(counter_key);

    if (!incr_result.isOk()) {
        spdlog::error("RedisAdapter: Failed to generate ID for {}", entityName);
        return "0";
    }

    return std::to_string(incr_result.value());
}

} // namespace redis
} // namespace adapters
} // namespace dbal
