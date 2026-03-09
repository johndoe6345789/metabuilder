#include "sql_adapter_base.hpp"
#include <sstream>
#include <cctype>

namespace dbal {
namespace adapters {
namespace sql {

// ===== Protected Methods =====

std::vector<SqlRow> SqlAdapter::executeQuery(SqlConnection* connection,
                                 const std::string& sql,
                                 const std::vector<SqlParam>& params) {
    return runQuery(connection, sql, params);
}

int SqlAdapter::executeNonQuery(SqlConnection* connection,
                    const std::string& sql,
                    const std::vector<SqlParam>& params) {
    return runNonQuery(connection, sql, params);
}

std::vector<SqlRow> SqlAdapter::runQuery(SqlConnection*,
                                     const std::string&,
                                     const std::vector<SqlParam>&) {
    throw SqlError{SqlError::Code::Unknown, "SQL execution not implemented"};
}

int SqlAdapter::runNonQuery(SqlConnection*,
                        const std::string&,
                        const std::vector<SqlParam>&) {
    throw SqlError{SqlError::Code::Unknown, "SQL execution not implemented"};
}

// ===== SQL Building =====

std::string SqlAdapter::buildInsertSql(const EntitySchema& schema, const Json& data) const {
    const std::string tableName = quoteId(schema.name);
    std::vector<std::string> fields;
    std::vector<std::string> placeholders;
    int paramIndex = 1;

    for (const auto& field : schema.fields) {
        if (field.name == "createdAt") {
            continue; // Always DB-generated
        }
        if (field.name == "id") {
            // Use caller-supplied id if present; otherwise let DB generate via DEFAULT
            if (data.contains("id") && data["id"].is_string() && !data["id"].get<std::string>().empty()) {
                fields.push_back(quoteId("id"));
                placeholders.push_back(placeholder(paramIndex++));
            }
            continue;
        }
        if (data.contains(field.name)) {
            fields.push_back(quoteId(field.name));
            placeholders.push_back(placeholder(paramIndex++));
        }
    }

    std::string sql = "INSERT INTO " + tableName + " (" + joinFragments(fields, ", ") + ") " +
                     "VALUES (" + joinFragments(placeholders, ", ") + ") " +
                     "RETURNING " + buildFieldList(schema);
    return sql;
}

std::string SqlAdapter::buildSelectSql(const EntitySchema& schema, const Json& filter) const {
    const std::string tableName = quoteId(schema.name);
    const std::string fieldList = buildFieldList(schema);
    std::string sql = "SELECT " + fieldList + " FROM " + tableName;

    if (!filter.empty()) {
        std::vector<std::string> whereFragments;
        int paramIndex = 1;
        for (const auto& [key, _] : filter.items()) {
            whereFragments.push_back(quoteId(key) + " = " + placeholder(paramIndex++));
        }
        sql += " WHERE " + joinFragments(whereFragments, " AND ");
    }

    return sql;
}

std::string SqlAdapter::buildUpdateSql(const EntitySchema& schema, const std::string& id, const Json& data) const {
    const std::string tableName = quoteId(schema.name);
    std::vector<std::string> setFragments;
    int paramIndex = 2; // 1 is for id

    for (const auto& field : schema.fields) {
        if (field.name == "id" || field.name == "createdAt") {
            continue; // Skip immutable fields
        }
        if (data.contains(field.name)) {
            setFragments.push_back(quoteId(field.name) + " = " + placeholder(paramIndex++));
        }
    }

    if (setFragments.empty()) {
        return "";
    }

    std::string sql = "UPDATE " + tableName + " SET " + joinFragments(setFragments, ", ") +
                     " WHERE " + quoteId("id") + " = " + placeholder(1) +
                     " RETURNING " + buildFieldList(schema);
    return sql;
}

std::string SqlAdapter::buildDeleteSql(const EntitySchema& schema, const std::string& id) const {
    const std::string tableName = quoteId(schema.name);
    return "DELETE FROM " + tableName + " WHERE " + quoteId("id") + " = " + placeholder(1);
}

std::string SqlAdapter::buildFieldList(const EntitySchema& schema) const {
    std::vector<std::string> fields;
    for (const auto& field : schema.fields) {
        // Wrap nullable fields that have a schema default with COALESCE so
        // the DB returns the default instead of NULL.  The AS alias ensures
        // rowToJson can still look up the column by field name.
        if (field.nullable && !field.required && field.defaultValue) {
            std::string def = coalesceDefault(field.type, *field.defaultValue);
            fields.push_back(
                "COALESCE(" + quoteId(field.name) + ", " + def + ") AS " + quoteId(field.name)
            );
        } else {
            fields.push_back(quoteId(field.name));
        }
    }
    return joinFragments(fields, ", ");
}

std::string SqlAdapter::coalesceDefault(const std::string& type, const std::string& val) const {
    if (type == "boolean") {
        // boolean literals are dialect-dependent; use 0/1 (universally valid)
        return (val == "true" || val == "1") ? "true" : "false";
    }
    if (type == "number" || type == "bigint" || type == "integer" || type == "int") {
        return val.empty() ? "0" : val;
    }
    // string / text / uuid / other: wrap in single quotes (safe — value is from schema file)
    std::string escaped;
    for (char c : val) {
        if (c == '\'') escaped += "''";
        else escaped += c;
    }
    return "'" + escaped + "'";
}

// ===== Data Conversion =====

std::vector<SqlParam> SqlAdapter::jsonToParams(const EntitySchema& schema, const Json& data, const std::string& prependId) const {
    std::vector<SqlParam> params;

    if (!prependId.empty()) {
        params.push_back({"id", prependId});
    }

    for (const auto& field : schema.fields) {
        if (field.name == "createdAt") {
            continue; // Always skip
        }
        if (field.name == "id") {
            // For CREATE (prependId empty): include caller-supplied id if present
            // For UPDATE (prependId non-empty): id already prepended above
            if (prependId.empty() && data.contains("id") && data["id"].is_string() &&
                !data["id"].get<std::string>().empty()) {
                params.push_back({"id", data["id"].get<std::string>()});
            }
            continue;
        }
        if (data.contains(field.name)) {
            params.push_back({field.name, jsonValueToString(data[field.name])});
        }
    }

    return params;
}

Json SqlAdapter::rowToJson(const EntitySchema& schema, const SqlRow& row) const {
    Json result;
    for (const auto& field : schema.fields) {
        const std::string value = columnValue(row, field.name);

        if (field.type == "boolean") {
            result[field.name] = (value == "1" || value == "t" || value == "true" || value == "T" || value == "TRUE");
        } else if (field.type == "number" || field.type == "bigint" || field.type == "integer" || field.type == "int") {
            if (!value.empty()) {
                result[field.name] = std::stoll(value);
            } else {
                result[field.name] = nullptr;
            }
        } else {
            if (value.empty()) {
                if (field.nullable && field.defaultValue) {
                    // COALESCE applied in SELECT; interpret empty return as default
                    result[field.name] = *field.defaultValue;
                } else if (!field.required) {
                    result[field.name] = nullptr;
                } else {
                    result[field.name] = value;
                }
            } else {
                result[field.name] = value;
            }
        }
    }
    return result;
}

std::string SqlAdapter::jsonValueToString(const Json& value) {
    if (value.is_null()) {
        return "";
    } else if (value.is_boolean()) {
        return value.get<bool>() ? "true" : "false";
    } else if (value.is_number()) {
        return std::to_string(value.get<int64_t>());
    } else if (value.is_string()) {
        return value.get<std::string>();
    } else {
        return value.dump();
    }
}

std::string SqlAdapter::columnValue(const SqlRow& row, const std::string& key) {
    const auto itr = row.columns.find(key);
    return itr != row.columns.end() ? itr->second : "";
}

// ===== Utilities =====

Error SqlAdapter::mapSqlError(const SqlError& error) {
    switch (error.code) {
        case SqlError::Code::UniqueViolation:
            return Error::conflict(error.message);
        case SqlError::Code::ForeignKeyViolation:
            return Error::validationError(error.message);
        case SqlError::Code::NotFound:
            return Error::notFound(error.message);
        case SqlError::Code::Timeout:
        case SqlError::Code::ConnectionLost:
            return Error::internal(error.message);
        default:
            return Error::internal(error.message);
    }
}

std::string SqlAdapter::joinFragments(const std::vector<std::string>& fragments, const std::string& separator) {
    std::ostringstream out;
    for (size_t i = 0; i < fragments.size(); ++i) {
        if (i > 0) {
            out << separator;
        }
        out << fragments[i];
    }
    return out.str();
}

std::string SqlAdapter::placeholder(size_t index) const {
    if (dialect_ == Dialect::Postgres || dialect_ == Dialect::Prisma) {
        return "$" + std::to_string(index);
    }
    return "?";
}

std::string SqlAdapter::quoteId(const std::string& identifier) const {
    if (dialect_ == Dialect::MySQL) {
        return "`" + identifier + "`";
    }
    // Postgres and Prisma use double quotes
    return "\"" + identifier + "\"";
}

}
}
}
