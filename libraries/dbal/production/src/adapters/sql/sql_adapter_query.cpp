#include "sql_adapter_base.hpp"

namespace dbal {
namespace adapters {
namespace sql {

// ===== Query Operations =====

Result<Json> SqlAdapter::findFirst(const std::string& entityName, const Json& filter) {
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
    const std::string fieldList = buildFieldList(schema);
    std::string sql = "SELECT " + fieldList + " FROM " + tableName;

    std::vector<SqlParam> params;
    int paramIndex = 1;

    // Build WHERE clause — validate field names against schema to prevent SQL injection
    std::vector<std::string> whereFragments;
    for (const auto& [key, value] : filter.items()) {
        bool field_found = false;
        for (const auto& field : schema.fields) {
            if (field.name == key) { field_found = true; break; }
        }
        if (!field_found) {
            return Error::validationError("Unknown field in filter: " + key);
        }
        whereFragments.push_back(quoteId(key) + " = " + placeholder(paramIndex++));
        params.push_back({key, jsonValueToString(value)});
    }

    if (!whereFragments.empty()) {
        sql += " WHERE " + joinFragments(whereFragments, " AND ");
    }

    sql += " LIMIT 1";

    try {
        const auto rows = executeQuery(conn, sql, params);
        if (rows.empty()) {
            return Error::notFound(entityName + " not found");
        }
        return rowToJson(schema, rows.front());
    } catch (const SqlError& err) {
        return mapSqlError(err);
    }
}

Result<Json> SqlAdapter::findByField(const std::string& entityName, const std::string& field, const Json& value) {
    Json filter;
    filter[field] = value;
    return findFirst(entityName, filter);
}

Result<Json> SqlAdapter::upsert(const std::string& entityName, const std::string& uniqueField,
                   const Json& uniqueValue, const Json& createData, const Json& updateData) {
    // Try to find existing record
    auto existingResult = findByField(entityName, uniqueField, uniqueValue);

    if (existingResult.hasValue()) {
        // Record exists, update it
        const auto& existing = existingResult.value();
        std::string id = existing.at("id");
        return update(entityName, id, updateData);
    } else {
        // Record doesn't exist, create it
        return create(entityName, createData);
    }
}

}
}
}
