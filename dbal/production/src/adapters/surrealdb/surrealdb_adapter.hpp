#ifndef DBAL_SURREALDB_ADAPTER_HPP
#define DBAL_SURREALDB_ADAPTER_HPP

#include <cpr/cpr.h>
#include <memory>
#include <string>
#include <vector>
#include <unordered_map>

#include "dbal/adapters/adapter.hpp"
#include "dbal/core/compensating_transaction.hpp"
#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "surrealdb_auth.hpp"
#include "surrealdb_http_client.hpp"
#include "surrealdb_schema_manager.hpp"

namespace dbal {
namespace adapters {
namespace surrealdb {

using Json = nlohmann::json;

/**
 * SurrealDB Adapter - Multi-Model Database implementation for DBAL
 *
 * Uses SurrealDB REST API for flexible multi-model database:
 * - Supports documents, graphs, key-value, and more
 * - Schema-driven table creation from YAML definitions
 * - HTTP/REST API communication
 * - SurrealQL query language
 * - Real-time subscriptions support
 */
class SurrealDBAdapter : public Adapter {
public:
    explicit SurrealDBAdapter(const std::string& connection_url);
    ~SurrealDBAdapter() override;

    // ===== Transaction Support (Compensating) =====

    bool supportsNativeTransactions() const override { return false; }
    Result<bool> beginTransaction() override;
    Result<bool> commitTransaction() override;
    Result<bool> rollbackTransaction() override;

    // ===== Generic CRUD Operations =====

    Result<Json> create(const std::string& entityName, const Json& data) override;
    Result<Json> read(const std::string& entityName, const std::string& id) override;
    Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) override;
    Result<bool> remove(const std::string& entityName, const std::string& id) override;
    Result<ListResult<Json>> list(const std::string& entityName, const ListOptions& options) override;

    // ===== Bulk Operations =====

    Result<int> createMany(const std::string& entityName, const std::vector<Json>& records) override;
    Result<int> updateMany(const std::string& entityName, const Json& filter, const Json& data) override;
    Result<int> deleteMany(const std::string& entityName, const Json& filter) override;

    // ===== Query Operations =====

    Result<Json> findFirst(const std::string& entityName, const Json& filter) override;
    Result<Json> findByField(const std::string& entityName, const std::string& field, const Json& value) override;
    Result<Json> upsert(const std::string& entityName, const std::string& uniqueField,
                       const Json& uniqueValue, const Json& createData, const Json& updateData) override;

    // ===== Metadata =====

    Result<std::vector<std::string>> getAvailableEntities() override;
    Result<EntitySchema> getEntitySchema(const std::string& entityName) override;

    void close() override;

private:
    // ===== Helpers =====

    // ===== Member Variables =====

    std::string connection_url_;
    SurrealDBAuth auth_;
    SurrealDBHttpClient http_client_;
    SurrealDBSchemaManager schema_manager_;
    std::unique_ptr<dbal::core::CompensatingTransaction> compensating_tx_;
};

} // namespace surrealdb
} // namespace adapters
} // namespace dbal

#endif
