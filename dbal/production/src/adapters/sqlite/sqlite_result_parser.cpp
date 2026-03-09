#include "sqlite_result_parser.hpp"
#include "sqlite_query_builder.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sqlite {

SQLiteResultParser::SQLiteResultParser(SQLiteConnectionManager& conn_manager)
    : conn_manager_(conn_manager) {
}

Json SQLiteResultParser::rowToJson(const core::EntitySchema& schema, sqlite3_stmt* stmt) const {
    Json result;

    const int columnCount = sqlite3_column_count(stmt);
    for (int i = 0; i < columnCount; ++i) {
        const char* columnName = sqlite3_column_name(stmt, i);
        if (!columnName) {
            continue;
        }

        // Find field in schema to get type info
        const core::EntityField* field = nullptr;
        for (const auto& f : schema.fields) {
            if (f.name == columnName) {
                field = &f;
                break;
            }
        }

        if (!field) {
            // Aggregate alias or computed column — include with raw value
            const int colType = sqlite3_column_type(stmt, i);
            if (colType == SQLITE_NULL) {
                result[columnName] = nullptr;
            } else if (colType == SQLITE_INTEGER) {
                result[columnName] = sqlite3_column_int64(stmt, i);
            } else if (colType == SQLITE_FLOAT) {
                result[columnName] = sqlite3_column_double(stmt, i);
            } else {
                const unsigned char* text = sqlite3_column_text(stmt, i);
                result[columnName] = text ? std::string(reinterpret_cast<const char*>(text)) : "";
            }
            continue;
        }

        result[columnName] = columnToJson(*field, stmt, i);
    }

    return result;
}

Json SQLiteResultParser::columnToJson(const core::EntityField& field,
                                      sqlite3_stmt* stmt,
                                      int columnIndex) const {
    const int columnType = sqlite3_column_type(stmt, columnIndex);

    if (columnType == SQLITE_NULL) {
        return nullptr;
    } else if (field.type == "boolean") {
        const int value = sqlite3_column_int(stmt, columnIndex);
        return (value != 0);
    } else if (field.type == "number" || field.type == "bigint") {
        const int64_t value = sqlite3_column_int64(stmt, columnIndex);
        return value;
    } else {
        const unsigned char* text = sqlite3_column_text(stmt, columnIndex);
        if (text) {
            return std::string(reinterpret_cast<const char*>(text));
        } else {
            return nullptr;
        }
    }
}

Result<std::vector<Json>> SQLiteResultParser::readAllRows(const core::EntitySchema& schema,
                                                           sqlite3_stmt* stmt) {
    std::vector<Json> results;
    int rc;

    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
        results.push_back(rowToJson(schema, stmt));
    }

    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        std::string errorMsg = "Failed to read rows: ";
        if (conn_manager_.isOpen()) {
            errorMsg += sqlite3_errmsg(conn_manager_.getHandle());
        }
        return Error::internal(errorMsg);
    }

    return Result<std::vector<Json>>(results);
}

Result<Json> SQLiteResultParser::readInsertedRecord(const core::EntitySchema& schema,
                                                     int64_t rowid) {
    std::lock_guard<std::mutex> lock(conn_manager_.getMutex());

    const std::string fieldList = SQLiteQueryBuilder::buildFieldList(schema);
    const std::string tableName = SQLiteQueryBuilder::quoteId(schema.name);
    const std::string selectSql = "SELECT " + fieldList +
                                 " FROM " + tableName +
                                 " WHERE rowid = ?";

    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(conn_manager_.getHandle(), selectSql.c_str(), -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::string errorMsg = "Failed to prepare select: ";
        if (conn_manager_.isOpen()) {
            errorMsg += sqlite3_errmsg(conn_manager_.getHandle());
        }
        return Error::internal(errorMsg);
    }

    sqlite3_bind_int64(stmt, 1, rowid);

    rc = sqlite3_step(stmt);
    if (rc != SQLITE_ROW) {
        sqlite3_finalize(stmt);
        return Error::internal("Failed to retrieve inserted record");
    }

    Json result = rowToJson(schema, stmt);
    sqlite3_finalize(stmt);

    return Result<Json>(result);
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
