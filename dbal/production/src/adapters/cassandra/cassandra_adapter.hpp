#ifndef DBAL_CASSANDRA_ADAPTER_HPP
#define DBAL_CASSANDRA_ADAPTER_HPP

#include <string>
#include <vector>
#include <memory>
#include <unordered_map>

#include "dbal/adapters/adapter.hpp"
#include "dbal/core/compensating_transaction.hpp"
#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../schema_loader.hpp"
#include "cassandra_connection_manager.hpp"
#include "cassandra_query_builder.hpp"
#include "cassandra_prepared_statements.hpp"
#include "cassandra_result_parser.hpp"

namespace dbal {
namespace adapters {
namespace cassandra {

using Json = nlohmann::json;

/**
 * Cassandra Adapter - Wide-Column Store implementation for DBAL
 *
 * Uses CQL (Cassandra Query Language) for distributed NoSQL database
 * Delegates to helper classes for connection, queries, and parsing
 *
 * Architecture:
 * - CassandraConnectionManager: Session lifecycle
 * - CassandraQueryBuilder: CQL generation
 * - CassandraPreparedStatements: Statement caching
 * - CassandraResultParser: Result → JSON conversion
 */
class CassandraAdapter : public Adapter {
public:
    explicit CassandraAdapter(const std::string& connection_url);
    ~CassandraAdapter() override;

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
    // ===== Schema Management =====

    void loadSchemas();
    void createTables();
    std::optional<EntitySchema> getEntitySchemaInternal(const std::string& entityName) const;

    // ===== Helper Components =====

    CassandraConnectionManager connection_manager_;
    std::unique_ptr<CassandraPreparedStatements> prepared_statements_;
    std::string schema_dir_;
    std::unordered_map<std::string, EntitySchema> schemas_;
    std::unique_ptr<dbal::core::CompensatingTransaction> compensating_tx_;
};

} // namespace cassandra
} // namespace adapters
} // namespace dbal

#endif // DBAL_CASSANDRA_ADAPTER_HPP
