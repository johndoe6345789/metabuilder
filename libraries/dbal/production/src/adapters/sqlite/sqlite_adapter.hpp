#ifndef DBAL_SQLITE_ADAPTER_HPP
#define DBAL_SQLITE_ADAPTER_HPP

#include <sqlite3.h>
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

#include "dbal/adapters/adapter.hpp"
#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "sqlite_prepared_statements.hpp"
#include "sqlite_result_parser.hpp"
#include "../schema_loader.hpp"
#include "../sql_template_generator.hpp"

// Forward declarations for helper classes
namespace dbal {
namespace adapters {
namespace sqlite {
    class SQLiteConnectionManager;
    class SQLiteTransactionManager;
}
}
}

namespace dbal {
namespace adapters {
namespace sqlite {

using Json = nlohmann::json;

/**
 * SQLite Adapter - Generic DBAL implementation for SQLite
 *
 * Refactored to use helper classes following SurrealDB pattern:
 * - SQLiteConnectionManager: Connection lifecycle
 * - SQLiteQueryBuilder: SQL statement construction (static utilities)
 * - SQLiteTypeConverter: C++ ↔ SQLite type mapping (static utilities)
 * - SQLitePreparedStatements: Statement preparation and execution
 * - SQLiteResultParser: sqlite3_stmt → JSON conversion
 * - SQLiteTransactionManager: Transaction handling
 */
class SQLiteAdapter : public Adapter {
public:
    explicit SQLiteAdapter(const std::string& db_path);
    ~SQLiteAdapter() override;

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

private:
    // ===== Schema Loading =====

    void loadSchemas();
    void createTables();
    void migrateTable(const EntityDefinition&, SqlTemplateGenerator&);
    std::optional<core::EntitySchema> getEntitySchemaInternal(const std::string& entityName) const;

    // ===== State =====

    std::string db_path_;
    sqlite3* db_; // Legacy compatibility - points to conn_manager_->getHandle()
    std::unordered_map<std::string, core::EntitySchema> schemas_;

    // ===== Helper Classes =====

    std::unique_ptr<SQLiteConnectionManager> conn_manager_;
    std::unique_ptr<SQLitePreparedStatements> prepared_stmts_;
    std::unique_ptr<SQLiteResultParser> result_parser_;
    std::unique_ptr<SQLiteTransactionManager> tx_manager_;
};

}
}
}

#endif
