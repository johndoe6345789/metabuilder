#include "sqlite_adapter.hpp"
#include "sqlite_query_builder.hpp"
#include "sqlite_type_converter.hpp"
#include "sqlite_prepared_statements.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

// ===== Bulk Operations =====

Result<int> SQLiteAdapter::createMany(const std::string& entityName, const std::vector<Json>& records) {
    if (records.empty()) {
        return Result<int>(0);
    }

    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    int inserted = 0;
    for (const auto& record : records) {
        const std::string sql = SQLiteQueryBuilder::buildInsertQuery(schema, record);
        const auto values = SQLiteTypeConverter::jsonToValues(schema, record);
        auto result = prepared_stmts_->executeInsert(sql, values);
        if (result.hasValue()) {
            inserted++;
        }
    }

    return Result<int>(inserted);
}

Result<int> SQLiteAdapter::updateMany(const std::string& entityName, const Json& filter, const Json& data) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    if (data.empty()) {
        return Error::validationError("No update fields supplied");
    }

    const std::string sql = SQLiteQueryBuilder::buildUpdateManyQuery(schema, filter, data);
    const auto params = SQLiteTypeConverter::buildUpdateManyParams(schema, filter, data);

    return prepared_stmts_->executeUpdate(sql, params);
}

Result<int> SQLiteAdapter::deleteMany(const std::string& entityName, const Json& filter) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    const std::string sql = SQLiteQueryBuilder::buildDeleteManyQuery(schema, filter);
    const auto params = SQLiteTypeConverter::buildDeleteManyParams(filter);

    return prepared_stmts_->executeDelete(sql, params);
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
