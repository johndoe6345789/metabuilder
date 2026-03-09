#include "sqlite_adapter.hpp"
#include "sqlite_query_builder.hpp"
#include "sqlite_type_converter.hpp"
#include "sqlite_prepared_statements.hpp"
#include "sqlite_result_parser.hpp"
#include "sqlite_transaction_manager.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

// ===== Generic CRUD Operations =====

Result<Json> SQLiteAdapter::create(const std::string& entityName, const Json& data) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    const std::string sql = SQLiteQueryBuilder::buildInsertQuery(schema, data);
    const auto values = SQLiteTypeConverter::jsonToValues(schema, data);

    auto insertResult = prepared_stmts_->executeInsert(sql, values);
    if (!insertResult.hasValue()) {
        return Error(insertResult.error());
    }

    return result_parser_->readInsertedRecord(schema, insertResult.value());
}

Result<Json> SQLiteAdapter::read(const std::string& entityName, const std::string& id) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    const std::string sql = SQLiteQueryBuilder::buildSelectQuery(schema, Json{{"id", id}});
    const std::vector<std::string> values = {id};

    auto stmtResult = prepared_stmts_->executeSelect(sql, values);
    if (!stmtResult.hasValue()) {
        return Error(stmtResult.error());
    }

    auto rowsResult = result_parser_->readAllRows(schema, stmtResult.value());
    if (!rowsResult.hasValue()) {
        return Error(rowsResult.error());
    }

    const auto& rows = rowsResult.value();
    if (rows.empty()) {
        return Error::notFound(entityName + " not found");
    }

    return Result<Json>(rows.front());
}

Result<Json> SQLiteAdapter::update(const std::string& entityName, const std::string& id, const Json& data) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    const std::string sql = SQLiteQueryBuilder::buildUpdateQuery(schema, id, data);
    const auto values = SQLiteTypeConverter::buildUpdateParams(schema, data, id);

    auto updateResult = prepared_stmts_->executeUpdate(sql, values);
    if (!updateResult.hasValue()) {
        return Error(updateResult.error());
    }

    if (updateResult.value() == 0) {
        return Error::notFound(entityName + " not found");
    }

    return read(entityName, id);
}

Result<bool> SQLiteAdapter::remove(const std::string& entityName, const std::string& id) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    const std::string sql = SQLiteQueryBuilder::buildDeleteQuery(schema, id);
    const std::vector<std::string> values = {id};

    auto result = prepared_stmts_->executeDelete(sql, values);
    if (!result.hasValue()) {
        return Error(result.error());
    }

    if (result.value() == 0) {
        return Error::notFound(entityName + " not found");
    }

    return Result<bool>(true);
}

Result<ListResult<Json>> SQLiteAdapter::list(const std::string& entityName, const ListOptions& options) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    // Run COUNT query first to get total (for pagination metadata)
    const std::string countSql = SQLiteQueryBuilder::buildCountQuery(schema, options);
    const auto countParams = SQLiteTypeConverter::buildCountParams(options);
    int totalCount = 0;
    {
        auto cntResult = prepared_stmts_->executeSelect(countSql, countParams);
        if (cntResult.hasValue()) {
            sqlite3_stmt* stmt = cntResult.value();
            if (sqlite3_step(stmt) == SQLITE_ROW) {
                if (options.group_by.empty()) {
                    totalCount = static_cast<int>(sqlite3_column_int64(stmt, 0));
                } else {
                    // GROUP BY: count rows in result set
                    totalCount = 1;
                    while (sqlite3_step(stmt) == SQLITE_ROW) ++totalCount;
                }
            }
            sqlite3_finalize(stmt);
        }
    }

    const std::string sql = SQLiteQueryBuilder::buildListQuery(schema, options);
    const auto params = SQLiteTypeConverter::buildListParams(options);

    auto stmtResult = prepared_stmts_->executeSelect(sql, params);
    if (!stmtResult.hasValue()) {
        return Error(stmtResult.error());
    }

    auto rowsResult = result_parser_->readAllRows(schema, stmtResult.value());
    if (!rowsResult.hasValue()) {
        return Error(rowsResult.error());
    }

    const auto& items = rowsResult.value();
    const int limit = options.limit > 0 ? options.limit : 50;

    ListResult<Json> listResult;
    listResult.items = items;
    listResult.total = totalCount > 0 ? totalCount : static_cast<int>(items.size());
    listResult.page = options.page;
    listResult.limit = limit;

    return Result<ListResult<Json>>(listResult);
}

// ===== Transaction Operations =====

Result<bool> SQLiteAdapter::beginTransaction() {
    return tx_manager_->begin();
}

Result<bool> SQLiteAdapter::commitTransaction() {
    return tx_manager_->commit();
}

Result<bool> SQLiteAdapter::rollbackTransaction() {
    return tx_manager_->rollback();
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
