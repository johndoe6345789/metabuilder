#include "mysql_adapter.hpp"
#include "mysql_error_mapper.hpp"
#include <cctype>
#include <mysql/mysql.h>
#include <spdlog/spdlog.h>
#include <stdexcept>

namespace {
    bool isValidIdentifier(const std::string& name) {
        if (name.empty() || name.size() > 128) return false;
        for (char c : name) {
            if (!std::isalnum(static_cast<unsigned char>(c)) && c != '_') return false;
        }
        return true;
    }
}

namespace dbal {
namespace adapters {
namespace sql {

MySQLAdapter::MySQLAdapter(const SqlConnectionConfig& config)
    : SqlAdapter(config, Dialect::MySQL), mysql_(config) {
    ensureConnected();
    initialize();
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

void MySQLAdapter::ensureConnected() {
    if (!mysql_.isAlive()) {
        if (!mysql_.connect()) {
            throw std::runtime_error("MySQLAdapter: unable to connect");
        }
    }
}

std::string MySQLAdapter::escapeString(const std::string& input) {
    ensureConnected();
    std::string out(input.size() * 2 + 1, '\0');
    unsigned long len = mysql_real_escape_string(
        mysql_.handle(), &out[0], input.c_str(),
        static_cast<unsigned long>(input.size()));
    out.resize(len);
    return out;
}

std::string MySQLAdapter::buildQueryString(const std::string& sql,
                                           const std::vector<SqlParam>& params) {
    // Replace each `?` placeholder with the escaped parameter value
    std::string result;
    result.reserve(sql.size() + params.size() * 32);
    size_t paramIdx = 0;

    for (size_t i = 0; i < sql.size(); ++i) {
        if (sql[i] == '?' && paramIdx < params.size()) {
            const auto& val = params[paramIdx].value;
            if (val.empty()) {
                result += "NULL";
            } else {
                result += '\'';
                result += escapeString(val);
                result += '\'';
            }
            ++paramIdx;
        } else {
            result += sql[i];
        }
    }

    return result;
}

// ---------------------------------------------------------------------------
// Virtual overrides
// ---------------------------------------------------------------------------

std::vector<SqlRow> MySQLAdapter::runQuery(SqlConnection*,
                                           const std::string& sql,
                                           const std::vector<SqlParam>& params) {
    ensureConnected();
    const std::string query = buildQueryString(sql, params);

    if (mysql_real_query(mysql_.handle(), query.c_str(),
                         static_cast<unsigned long>(query.size())) != 0) {
        unsigned int errNo = mysql_errno(mysql_.handle());
        std::string msg = mysql_error(mysql_.handle());
        throw SqlError{mapMySqlError(errNo), msg};
    }

    MYSQL_RES* res = mysql_store_result(mysql_.handle());
    if (!res) {
        // Could be a non-result query or an error
        if (mysql_errno(mysql_.handle()) != 0) {
            unsigned int errNo = mysql_errno(mysql_.handle());
            std::string msg = mysql_error(mysql_.handle());
            throw SqlError{mapMySqlError(errNo), msg};
        }
        return {};
    }

    unsigned int ncols = mysql_num_fields(res);
    MYSQL_FIELD* fields = mysql_fetch_fields(res);

    std::vector<SqlRow> rows;
    MYSQL_ROW mysqlRow;
    while ((mysqlRow = mysql_fetch_row(res)) != nullptr) {
        unsigned long* lengths = mysql_fetch_lengths(res);
        SqlRow row;
        for (unsigned int c = 0; c < ncols; ++c) {
            const char* colName = fields[c].name;
            if (mysqlRow[c] == nullptr) {
                row.columns[colName] = "";
            } else {
                row.columns[colName] = std::string(mysqlRow[c], lengths[c]);
            }
        }
        rows.push_back(std::move(row));
    }

    mysql_free_result(res);
    return rows;
}

int MySQLAdapter::runNonQuery(SqlConnection*,
                               const std::string& sql,
                               const std::vector<SqlParam>& params) {
    ensureConnected();
    const std::string query = buildQueryString(sql, params);

    if (mysql_real_query(mysql_.handle(), query.c_str(),
                         static_cast<unsigned long>(query.size())) != 0) {
        unsigned int errNo = mysql_errno(mysql_.handle());
        std::string msg = mysql_error(mysql_.handle());
        throw SqlError{mapMySqlError(errNo), msg};
    }

    return static_cast<int>(mysql_affected_rows(mysql_.handle()));
}

// ---------------------------------------------------------------------------
// MySQL-specific CRUD overrides (no RETURNING clause)
// ---------------------------------------------------------------------------

Result<Json> MySQLAdapter::create(const std::string& entityName, const Json& data) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    if (!isValidIdentifier(schema.name)) {
        return Error::validationError("Invalid entity name: " + schema.name);
    }

    auto conn = pool_.acquire();
    if (!conn) {
        return Error::internal("Unable to acquire SQL connection");
    }
    ConnectionGuard guard(pool_, conn);

    // Build INSERT without RETURNING (MySQL doesn't support it)
    // We build it manually: INSERT INTO `table` (`col1`, `col2`) VALUES (?, ?)
    std::vector<std::string> fieldNames;
    std::vector<std::string> placeholders;
    std::vector<SqlParam> params;

    for (const auto& field : schema.fields) {
        if (!data.contains(field.name)) {
            continue; // Let DB defaults apply for missing fields
        }
        fieldNames.push_back("`" + field.name + "`");
        placeholders.push_back("?");
        params.push_back({field.name, jsonValueToString(data[field.name])});
    }

    std::string sql = "INSERT INTO `" + schema.name + "` (" +
                      joinFragments(fieldNames, ", ") + ") VALUES (" +
                      joinFragments(placeholders, ", ") + ")";

    try {
        executeNonQuery(conn, sql, params);

        // Read back the inserted row. If id was supplied by caller (UUID PK), select by it
        // directly to avoid the ORDER BY race condition under concurrent inserts.
        std::string selectSql;
        std::vector<SqlParam> selectParams;
        if (data.contains("id")) {
            selectSql = "SELECT * FROM `" + schema.name + "` WHERE `id` = ?";
            selectParams.push_back({"id", jsonValueToString(data["id"])});
        } else {
            selectSql = "SELECT * FROM `" + schema.name +
                        "` ORDER BY `createdAt` DESC LIMIT 1";
        }
        const auto rows = executeQuery(conn, selectSql, selectParams);
        if (rows.empty()) {
            return Error::internal("MySQL insert succeeded but could not read back row");
        }
        return rowToJson(schema, rows.front());
    } catch (const SqlError& err) {
        return mapSqlError(err);
    }
}

Result<Json> MySQLAdapter::update(const std::string& entityName, const std::string& id, const Json& data) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    if (!isValidIdentifier(schema.name)) {
        return Error::validationError("Invalid entity name: " + schema.name);
    }

    auto conn = pool_.acquire();
    if (!conn) {
        return Error::internal("Unable to acquire SQL connection");
    }
    ConnectionGuard guard(pool_, conn);

    // Build UPDATE without RETURNING
    std::vector<std::string> setFragments;
    std::vector<SqlParam> params;

    for (const auto& field : schema.fields) {
        if (field.name == "id" || field.name == "createdAt") {
            continue;
        }
        if (data.contains(field.name)) {
            setFragments.push_back("`" + field.name + "` = ?");
            params.push_back({field.name, jsonValueToString(data[field.name])});
        }
    }

    if (setFragments.empty()) {
        return Error::validationError("No fields to update");
    }

    // Add id param at the end for WHERE clause
    params.push_back({"id", id});

    std::string sql = "UPDATE `" + schema.name + "` SET " +
                      joinFragments(setFragments, ", ") +
                      " WHERE `id` = ?";

    try {
        int affected = executeNonQuery(conn, sql, params);
        if (affected == 0) {
            return Error::notFound(entityName + " not found");
        }

        // Fetch updated row
        const std::string selectSql = "SELECT * FROM `" + schema.name + "` WHERE `id` = ?";
        const std::vector<SqlParam> selectParams = {{"id", id}};
        const auto rows = executeQuery(conn, selectSql, selectParams);
        if (rows.empty()) {
            return Error::notFound(entityName + " not found");
        }
        return rowToJson(schema, rows.front());
    } catch (const SqlError& err) {
        return mapSqlError(err);
    }
}

Result<int> MySQLAdapter::createMany(const std::string& entityName, const std::vector<Json>& records) {
    if (records.empty()) {
        return Result<int>(0);
    }
    // Delegate per-record insert to create() which handles MySQL's no-RETURNING constraint.
    int inserted = 0;
    for (const auto& record : records) {
        auto result = create(entityName, record);
        if (!result.isOk()) {
            return Error::internal("createMany aborted: " + std::string(result.error().what()));
        }
        ++inserted;
    }
    return Result<int>(inserted);
}

}
}
}
