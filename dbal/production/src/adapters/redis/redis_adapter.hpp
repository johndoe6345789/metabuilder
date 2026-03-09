#ifndef DBAL_REDIS_ADAPTER_HPP
#define DBAL_REDIS_ADAPTER_HPP

#include <memory>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>

#include "dbal/adapters/adapter.hpp"
#include "dbal/core/compensating_transaction.hpp"
#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "redis_connection_pool.hpp"
#include "redis_command_executor.hpp"
#include "redis_schema_manager.hpp"
#include "redis_operations.hpp"

namespace dbal {
namespace adapters {
namespace redis {

using Json = nlohmann::json;

/**
 * Redis Adapter - Minimal orchestrator for Redis CRUD operations
 *
 * Delegates to helper classes:
 * - RedisConnectionPool: Connection management
 * - RedisCommandExecutor: Command execution
 * - RedisSchemaManager: Schema management
 * - RedisOperations: Bulk/query operations
 * - RedisKeyBuilder: Key generation (static)
 * - RedisValueSerializer: JSON serialization (static)
 */
class RedisAdapter : public Adapter {
public:
    explicit RedisAdapter(const std::string& connection_url);
    ~RedisAdapter() override;

    // ===== Transaction Support (Compensating) =====

    bool supportsNativeTransactions() const override { return false; }
    Result<bool> beginTransaction() override;
    Result<bool> commitTransaction() override;
    Result<bool> rollbackTransaction() override;

    Result<Json> create(const std::string& entityName, const Json& data) override;
    Result<Json> read(const std::string& entityName, const std::string& id) override;
    Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) override;
    Result<bool> remove(const std::string& entityName, const std::string& id) override;
    Result<ListResult<Json>> list(const std::string& entityName, const ListOptions& options) override;

    Result<int> createMany(const std::string& entityName, const std::vector<Json>& records) override;
    Result<int> updateMany(const std::string& entityName, const Json& filter, const Json& data) override;
    Result<int> deleteMany(const std::string& entityName, const Json& filter) override;

    Result<Json> findFirst(const std::string& entityName, const Json& filter) override;
    Result<Json> findByField(const std::string& entityName, const std::string& field, const Json& value) override;
    Result<Json> upsert(const std::string& entityName, const std::string& uniqueField,
                       const Json& uniqueValue, const Json& createData, const Json& updateData) override;

    Result<std::vector<std::string>> getAvailableEntities() override;
    Result<EntitySchema> getEntitySchema(const std::string& entityName) override;

    void close() override;

private:
    std::string generateId(const std::string& entityName);

    std::string connection_url_;
    RedisConnectionPool connection_pool_;
    RedisCommandExecutor command_executor_;
    RedisSchemaManager schema_manager_;
    RedisOperations operations_;
    std::unique_ptr<dbal::core::CompensatingTransaction> compensating_tx_;
};

} // namespace redis
} // namespace adapters
} // namespace dbal

#endif // DBAL_REDIS_ADAPTER_HPP
