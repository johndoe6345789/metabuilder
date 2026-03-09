#ifndef DBAL_SQL_ADAPTER_BASE_HPP
#define DBAL_SQL_ADAPTER_BASE_HPP

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

#include "dbal/adapters/adapter.hpp"
#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "sql_connection.hpp"
#include "sql_types.hpp"
#include "sql_adapter_helpers.hpp"
#include "sql_transaction_manager.hpp"
#include "../schema_loader.hpp"
#include "../sql_template_generator.hpp"

namespace dbal {
namespace adapters {
namespace sql {

/**
 * Generic SQL Adapter - works with any entity from YAML schemas
 *
 * Replaces hardcoded entity methods with schema-driven operations
 */
class SqlAdapter : public Adapter {
public:
    explicit SqlAdapter(const SqlConnectionConfig& config, Dialect dialect)
        : pool_(config), dialect_(dialect) {}

    // Two-phase init: derived classes call this after their own members
    // are constructed, so virtual dispatch works correctly.
    void initialize() {
        loadSchemas();
        createTables();
    }

    ~SqlAdapter() override = default;

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

    // ===== Transaction Operations =====

    bool supportsNativeTransactions() const override { return true; }
    Result<bool> beginTransaction() override;
    Result<bool> commitTransaction() override;
    Result<bool> rollbackTransaction() override;

protected:
    struct ConnectionGuard {
        SqlPool& pool;
        SqlConnection* connection;
        ConnectionGuard(SqlPool& pool_, SqlConnection* connection_)
            : pool(pool_), connection(connection_) {}
        ~ConnectionGuard() { if (connection) pool.release(connection); }
    };

    // Query execution
    std::vector<SqlRow> executeQuery(SqlConnection*, const std::string&, const std::vector<SqlParam>&);
    int executeNonQuery(SqlConnection*, const std::string&, const std::vector<SqlParam>&);
    virtual std::vector<SqlRow> runQuery(SqlConnection*, const std::string&, const std::vector<SqlParam>&);
    virtual int runNonQuery(SqlConnection*, const std::string&, const std::vector<SqlParam>&);

    // Schema management
    void loadSchemas();
    void createTables();
    std::optional<EntitySchema> getEntitySchemaInternal(const std::string& entityName) const;

    // Schema migration: adds columns present in entity definition but missing from the table
    void migrateTable(SqlConnection*, const EntityDefinition&, SqlDialect, SqlTemplateGenerator&);

    // Error mapping
    static Error mapSqlError(const SqlError& error);

    // Data conversion helpers (protected for dialect-specific overrides)
    Json rowToJson(const EntitySchema& schema, const SqlRow& row) const;
    static std::string jsonValueToString(const Json& value);

    // Utility helpers (protected for dialect-specific overrides)
    static std::string joinFragments(const std::vector<std::string>& fragments, const std::string& separator);
    std::string placeholder(size_t index) const;
    std::string quoteId(const std::string& identifier) const;

    SqlPool pool_;
    std::unique_ptr<SqlTransactionManager> tx_manager_;
    SqlConnection* tx_connection_ = nullptr;

private:
    // SQL Building helpers
    std::string buildInsertSql(const EntitySchema& schema, const Json& data) const;
    std::string buildSelectSql(const EntitySchema& schema, const Json& filter) const;
    std::string buildUpdateSql(const EntitySchema& schema, const std::string& id, const Json& data) const;
    std::string buildDeleteSql(const EntitySchema& schema, const std::string& id) const;
    std::string buildFieldList(const EntitySchema& schema) const;
    std::string coalesceDefault(const std::string& type, const std::string& val) const;

    // Data conversion helpers (private - only used by base class SQL builders)
    std::vector<SqlParam> jsonToParams(const EntitySchema& schema, const Json& data, const std::string& prependId = "") const;
    static std::string columnValue(const SqlRow& row, const std::string& key);

    Dialect dialect_;
    std::unordered_map<std::string, EntitySchema> schemas_;
};

}
}
}

#endif
