#include "sql_adapter_base.hpp"
#include "sql_where_builder.hpp"
#include <unordered_set>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sql {

// ===== Generic CRUD Operations =====

Result<Json> SqlAdapter::create(const std::string& entityName, const Json& data) {
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

    const std::string sql = buildInsertSql(schema, data);
    const auto params = jsonToParams(schema, data);

    try {
        const auto rows = executeQuery(conn, sql, params);
        if (rows.empty()) {
            return Error::internal("SQL insert returned no rows");
        }
        return rowToJson(schema, rows.front());
    } catch (const SqlError& err) {
        return mapSqlError(err);
    }
}

Result<Json> SqlAdapter::read(const std::string& entityName, const std::string& id) {
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

    const std::string sql = buildSelectSql(schema, Json{{"id", id}});
    const std::vector<SqlParam> params = {{"id", id}};

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

Result<Json> SqlAdapter::update(const std::string& entityName, const std::string& id, const Json& data) {
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

    const std::string sql = buildUpdateSql(schema, id, data);
    const auto params = jsonToParams(schema, data, id);

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

Result<bool> SqlAdapter::remove(const std::string& entityName, const std::string& id) {
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

    const std::string sql = buildDeleteSql(schema, id);
    const std::vector<SqlParam> params = {{"id", id}};

    try {
        const int affected = executeNonQuery(conn, sql, params);
        if (affected == 0) {
            return Error::notFound(entityName + " not found");
        }
        return Result<bool>(true);
    } catch (const SqlError& err) {
        return mapSqlError(err);
    }
}

Result<ListResult<Json>> SqlAdapter::list(const std::string& entityName, const ListOptions& options) {
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

    const int limit = options.limit > 0 ? options.limit : 50;
    const int page  = options.page  > 0 ? options.page  : 1;
    const int offset = (page - 1) * limit;

    // Build valid-field set for injection defence
    std::unordered_set<std::string> valid_fields;
    for (const auto& f : schema.fields) valid_fields.insert(f.name);

    // Determine SQL dialect string for SqlWhereBuilder
    const std::string dialect_str = (dialect_ == Dialect::Postgres || dialect_ == Dialect::Prisma)
                                    ? "postgresql" : "mysql";
    const bool pg = (dialect_str == "postgresql");

    const std::string tableName = quoteId(schema.name);

    // ===== AGGREGATION PATH =====
    if (!options.aggregates.empty()) {
        try {
            // Validate group_by fields
            for (const auto& gb : options.group_by) {
                if (!valid_fields.count(gb))
                    return Error::validationError("Unknown group_by field: " + gb);
            }
            // Validate aggregate fields
            for (const auto& agg : options.aggregates) {
                if (agg.field != "*" && !valid_fields.count(agg.field))
                    return Error::validationError("Unknown aggregate field: " + agg.field);
            }

            std::vector<SqlParam> params;
            int paramIndex = 1;
            std::string whereClause = SqlWhereBuilder::build(
                options.conditions, options.filter_groups, options.filter,
                valid_fields, dialect_str, params, paramIndex);

            std::string selectList = SqlWhereBuilder::buildAggregateSelect(
                options.aggregates, options.group_by, valid_fields, dialect_str);
            std::string groupBy = SqlWhereBuilder::buildGroupBy(
                options.group_by, valid_fields, dialect_str);

            std::string sql = "SELECT " + selectList + " FROM " + tableName;
            if (!whereClause.empty()) sql += " " + whereClause;
            if (!groupBy.empty())     sql += " " + groupBy;

            const auto rows = executeQuery(conn, sql, params);
            std::vector<Json> items;
            for (const auto& row : rows) {
                Json obj;
                for (const auto& [col, val] : row.columns) {
                    obj[col] = val;
                }
                items.push_back(std::move(obj));
            }
            ListResult<Json> result;
            result.items = items;
            result.total = static_cast<int>(items.size());
            result.page  = page;
            result.limit = limit;
            return Result<ListResult<Json>>(result);
        } catch (const std::invalid_argument& e) {
            return Error::validationError(e.what());
        } catch (const SqlError& err) {
            spdlog::error("SqlAdapter::list aggregation error for {}: {}", entityName, err.message);
            return mapSqlError(err);
        }
    }

    // ===== STANDARD LIST PATH =====
    try {
        std::vector<SqlParam> params;
        int paramIndex = 1;

        // Build WHERE clause via SqlWhereBuilder (validates all field names)
        std::string whereClause;
        try {
            whereClause = SqlWhereBuilder::build(
                options.conditions, options.filter_groups, options.filter,
                valid_fields, dialect_str, params, paramIndex);
        } catch (const std::invalid_argument& e) {
            return Error::validationError(e.what());
        }

        // Determine default ORDER BY field
        std::string defaultOrderField = schema.fields.empty() ? "id" : schema.fields[0].name;
        for (const auto& field : schema.fields) {
            if (field.name == "createdAt") { defaultOrderField = "createdAt"; break; }
        }

        // Build ORDER BY — validates sort fields
        std::string orderBy;
        try {
            orderBy = SqlWhereBuilder::buildOrderBy(options.sort, valid_fields, defaultOrderField, dialect_str);
        } catch (const std::invalid_argument& e) {
            return Error::validationError(e.what());
        }

        // Build paginated SELECT
        const std::string fieldList = options.distinct
            ? "DISTINCT " + buildFieldList(schema) : buildFieldList(schema);
        // LIMIT/OFFSET are application-controlled integers — use literals, not params.
        // MySQL rejects string-quoted LIMIT values (e.g. LIMIT '20' fails); SQLite
        // and PostgreSQL also work fine with literals here.
        std::string sql = "SELECT " + fieldList + " FROM " + tableName;
        if (!whereClause.empty()) sql += " " + whereClause;
        sql += " " + orderBy
             + " LIMIT "  + std::to_string(limit)
             + " OFFSET " + std::to_string(offset);

        // Get total count (WHERE params only — no LIMIT/OFFSET)
        std::vector<SqlParam> count_params = params;
        std::string count_sql = "SELECT COUNT(*) AS cnt FROM " + tableName;
        if (!whereClause.empty()) count_sql += " " + whereClause;
        const auto count_rows = executeQuery(conn, count_sql, count_params);
        int total = 0;
        if (!count_rows.empty()) {
            auto it = count_rows[0].columns.find("cnt");
            if (it != count_rows[0].columns.end() && !it->second.empty()) {
                try { total = std::stoi(it->second); } catch (...) {}
            }
        }

        const auto rows = executeQuery(conn, sql, params);
        std::vector<Json> items;
        items.reserve(rows.size());
        for (const auto& row : rows) {
            items.push_back(rowToJson(schema, row));
        }

        ListResult<Json> result;
        result.items = items;
        result.total = total;
        result.page  = page;
        result.limit = limit;
        return Result<ListResult<Json>>(result);
    } catch (const SqlError& err) {
        spdlog::error("SqlAdapter::list error for {}: {}", entityName, err.message);
        return mapSqlError(err);
    }
}

// ===== Transaction Operations =====

Result<bool> SqlAdapter::beginTransaction() {
    if (!tx_connection_) {
        tx_connection_ = pool_.acquire();
        if (!tx_connection_) {
            return Error::internal("Unable to acquire SQL connection for transaction");
        }
        tx_manager_ = std::make_unique<SqlTransactionManager>(tx_connection_);
    }
    tx_manager_->begin();
    return Result<bool>(true);
}

Result<bool> SqlAdapter::commitTransaction() {
    if (!tx_manager_ || !tx_manager_->isActive()) {
        return Error::internal("No transaction in progress");
    }
    tx_manager_->commit();
    tx_manager_.reset();
    pool_.release(tx_connection_);
    tx_connection_ = nullptr;
    return Result<bool>(true);
}

Result<bool> SqlAdapter::rollbackTransaction() {
    if (!tx_manager_ || !tx_manager_->isActive()) {
        return Error::internal("No transaction in progress");
    }
    tx_manager_->rollback();
    tx_manager_.reset();
    pool_.release(tx_connection_);
    tx_connection_ = nullptr;
    return Result<bool>(true);
}

}
}
}
