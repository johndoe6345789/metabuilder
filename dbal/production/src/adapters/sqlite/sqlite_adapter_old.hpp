#ifndef DBAL_SQLITE_ADAPTER_HPP
#define DBAL_SQLITE_ADAPTER_HPP

#include <sqlite3.h>
#include <string>
#include <vector>
#include <unordered_map>
#include <mutex>
#include <memory>

#include "dbal/adapters/adapter.hpp"
#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../schema_loader.hpp"
#include "../sql_generator.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

using Json = nlohmann::json;

/**
 * SQLite Adapter - Generic DBAL implementation for SQLite
 *
 * Follows the same pattern as SqlAdapter but specialized for SQLite:
 * - No hardcoded entity methods
 * - Schema-driven from YAML definitions
 * - Dynamic SQL building based on entity metadata
 * - Single-file database connection
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

private:
    // ===== Schema Loading =====

    void loadSchemas();
    void createTables();
    std::optional<EntitySchema> getEntitySchemaInternal(const std::string& entityName) const;

    // ===== SQL Building =====

    std::string buildInsertSql(const EntitySchema& schema, const Json& data) const;
    std::string buildSelectSql(const EntitySchema& schema, const Json& filter) const;
    std::string buildUpdateSql(const EntitySchema& schema, const std::string& id, const Json& data) const;
    std::string buildDeleteSql(const EntitySchema& schema, const std::string& id) const;
    std::string buildFieldList(const EntitySchema& schema) const;

    // ===== Data Conversion =====

    std::vector<std::string> jsonToValues(const EntitySchema& schema, const Json& data,
                                          const std::string& prependId = "") const;
    Json rowToJson(const EntitySchema& schema, sqlite3_stmt* stmt) const;

    static std::string jsonValueToString(const Json& value);
    static std::string toLowerSnakeCase(const std::string& pascalCase);
    static std::string joinFragments(const std::vector<std::string>& fragments, const std::string& separator);

    // ===== SQLite Execution =====

    Result<Json> executeInsert(const std::string& sql, const std::vector<std::string>& values,
                               const EntitySchema& schema);
    Result<std::vector<Json>> executeSelect(const std::string& sql, const std::vector<std::string>& values,
                                            const EntitySchema& schema);
    Result<int> executeUpdate(const std::string& sql, const std::vector<std::string>& values);
    Result<int> executeDelete(const std::string& sql, const std::vector<std::string>& values);

    // ===== Error Handling =====

    Error mapSqliteError(int code, const std::string& context = "") const;

    // ===== State =====

    std::string db_path_;
    sqlite3* db_;
    mutable std::mutex mutex_;
    std::unordered_map<std::string, EntitySchema> schemas_;
};

}
}
}

#endif
