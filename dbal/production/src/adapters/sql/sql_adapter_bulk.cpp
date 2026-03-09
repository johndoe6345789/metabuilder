#include "sql_adapter_base.hpp"

namespace dbal {
namespace adapters {
namespace sql {

// ===== Bulk Operations =====

Result<int> SqlAdapter::createMany(const std::string& entityName, const std::vector<Json>& records) {
    if (records.empty()) {
        return Result<int>(0);
    }

    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    auto conn = pool_.acquire();
    if (!conn) {
        return Error::internal("Unable to acquire SQL connection");
    }
    ConnectionGuard guard(pool_, conn);

    // Begin transaction for atomicity
    auto txResult = beginTransaction();
    if (!txResult) {
        return Error::internal("Failed to begin transaction: " + std::string(txResult.error().what()));
    }

    int inserted = 0;
    for (const auto& record : records) {
        const std::string sql = buildInsertSql(schema, record);
        const auto params = jsonToParams(schema, record);
        try {
            executeNonQuery(conn, sql, params);
            inserted++;
        } catch (const SqlError& err) {
            // Rollback on any failure
            rollbackTransaction();
            return mapSqlError(err);
        }
    }

    auto commitResult = commitTransaction();
    if (!commitResult) {
        return Error::internal("Failed to commit transaction: " + std::string(commitResult.error().what()));
    }

    return Result<int>(inserted);
}

Result<int> SqlAdapter::updateMany(const std::string& entityName, const Json& filter, const Json& data) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    auto conn = pool_.acquire();
    if (!conn) {
        return Error::internal("Unable to acquire SQL connection");
    }
    ConnectionGuard guard(pool_, conn);

    // Build UPDATE with WHERE clause
    const std::string tableName = quoteId(schema.name);
    std::string sql = "UPDATE " + tableName + " SET ";

    std::vector<SqlParam> params;
    int paramIndex = 1;

    // Build SET clause — validate fields against schema, use quoteId for dialect safety
    std::vector<std::string> setFragments;
    for (const auto& field : schema.fields) {
        if (data.contains(field.name)) {
            setFragments.push_back(quoteId(field.name) + " = " + placeholder(paramIndex++));
            params.push_back({field.name, jsonValueToString(data[field.name])});
        }
    }

    if (setFragments.empty()) {
        return Error::validationError("No update fields supplied");
    }

    sql += joinFragments(setFragments, ", ");

    // Build WHERE clause — validate keys against schema to prevent injection
    std::vector<std::string> whereFragments;
    for (const auto& [key, value] : filter.items()) {
        bool field_found = false;
        for (const auto& f : schema.fields) {
            if (f.name == key) { field_found = true; break; }
        }
        if (!field_found) {
            return Error::validationError("Unknown filter field: " + key);
        }
        whereFragments.push_back(quoteId(key) + " = " + placeholder(paramIndex++));
        params.push_back({key, jsonValueToString(value)});
    }

    if (!whereFragments.empty()) {
        sql += " WHERE " + joinFragments(whereFragments, " AND ");
    }

    try {
        const int affected = executeNonQuery(conn, sql, params);
        return Result<int>(affected);
    } catch (const SqlError& err) {
        return mapSqlError(err);
    }
}

Result<int> SqlAdapter::deleteMany(const std::string& entityName, const Json& filter) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    auto conn = pool_.acquire();
    if (!conn) {
        return Error::internal("Unable to acquire SQL connection");
    }
    ConnectionGuard guard(pool_, conn);

    const std::string tableName = quoteId(schema.name);
    std::string sql = "DELETE FROM " + tableName;

    std::vector<SqlParam> params;
    int paramIndex = 1;

    // Build WHERE clause
    std::vector<std::string> whereFragments;
    for (const auto& [key, value] : filter.items()) {
        whereFragments.push_back(key + " = " + placeholder(paramIndex++));
        params.push_back({key, jsonValueToString(value)});
    }

    if (!whereFragments.empty()) {
        sql += " WHERE " + joinFragments(whereFragments, " AND ");
    }

    try {
        const int affected = executeNonQuery(conn, sql, params);
        return Result<int>(affected);
    } catch (const SqlError& err) {
        return mapSqlError(err);
    }
}

}
}
}
