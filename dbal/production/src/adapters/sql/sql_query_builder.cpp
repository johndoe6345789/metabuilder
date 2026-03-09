#include "sql_query_builder.hpp"
#include <sstream>
#include <algorithm>
#include <cctype>

namespace dbal {
namespace adapters {
namespace sql {

std::string SqlQueryBuilder::buildInsert(const std::string& table_name,
                                        const EntitySchema& schema,
                                        const Json& data,
                                        Dialect dialect) {
    std::vector<std::string> fields;
    std::vector<std::string> placeholders;
    int param_index = 1;

    for (const auto& field : schema.fields) {
        if (field.name == "id" || field.name == "createdAt") {
            continue; // Skip auto-generated fields
        }
        if (data.contains(field.name)) {
            fields.push_back(field.name);
            placeholders.push_back(placeholder(dialect, param_index++));
        }
    }

    std::ostringstream sql;
    sql << "INSERT INTO " << table_name
        << " (" << joinFragments(fields, ", ") << ")"
        << " VALUES (" << joinFragments(placeholders, ", ") << ")";

    // PostgreSQL and Prisma support RETURNING clause
    if (dialect == Dialect::Postgres || dialect == Dialect::Prisma) {
        sql << " RETURNING " << buildFieldList(schema);
    }

    return sql.str();
}

std::string SqlQueryBuilder::buildSelect(const std::string& table_name,
                                        const EntitySchema& schema,
                                        const Json& filter,
                                        Dialect dialect) {
    std::ostringstream sql;
    sql << "SELECT " << buildFieldList(schema) << " FROM " << table_name;

    if (!filter.empty()) {
        int param_index = 1;
        sql << " WHERE " << buildWhereClause(filter, dialect, param_index);
    }

    return sql.str();
}

std::string SqlQueryBuilder::buildUpdate(const std::string& table_name,
                                        const EntitySchema& schema,
                                        const std::string& id,
                                        const Json& data,
                                        Dialect dialect) {
    std::vector<std::string> set_fragments;
    int param_index = 2; // 1 is reserved for id

    for (const auto& field : schema.fields) {
        if (field.name == "id" || field.name == "createdAt") {
            continue; // Skip immutable fields
        }
        if (data.contains(field.name)) {
            set_fragments.push_back(field.name + " = " + placeholder(dialect, param_index++));
        }
    }

    if (set_fragments.empty()) {
        return ""; // No fields to update
    }

    std::ostringstream sql;
    sql << "UPDATE " << table_name
        << " SET " << joinFragments(set_fragments, ", ")
        << " WHERE id = " << placeholder(dialect, 1);

    // PostgreSQL and Prisma support RETURNING clause
    if (dialect == Dialect::Postgres || dialect == Dialect::Prisma) {
        sql << " RETURNING " << buildFieldList(schema);
    }

    return sql.str();
}

std::string SqlQueryBuilder::buildDelete(const std::string& table_name,
                                        const std::string& id,
                                        Dialect dialect) {
    (void)id; // Unused, but kept for consistency
    std::ostringstream sql;
    sql << "DELETE FROM " << table_name << " WHERE id = " << placeholder(dialect, 1);
    return sql.str();
}

std::string SqlQueryBuilder::buildList(const std::string& table_name,
                                      const EntitySchema& schema,
                                      const ListOptions& options,
                                      Dialect dialect) {
    std::ostringstream sql;
    sql << "SELECT " << buildFieldList(schema) << " FROM " << table_name;

    int param_index = 1;

    // Build WHERE clause from filter
    if (!options.filter.empty()) {
        sql << " WHERE " << buildWhereClause(options.filter, dialect, param_index);
    }

    // Add ORDER BY — use createdAt if it exists, otherwise primary key
    std::string order_field = schema.fields.empty() ? "id" : schema.fields[0].name;
    for (const auto& field : schema.fields) {
        if (field.name == "createdAt") {
            order_field = "createdAt";
            break;
        }
    }
    sql << " ORDER BY " << order_field << " DESC";

    // Add LIMIT and OFFSET
    const int limit = options.limit > 0 ? options.limit : 50;
    const int offset = options.page > 1 ? (options.page - 1) * limit : 0;

    sql << " LIMIT " << placeholder(dialect, param_index++)
        << " OFFSET " << placeholder(dialect, param_index++);

    return sql.str();
}

std::string SqlQueryBuilder::buildFieldList(const EntitySchema& schema) {
    std::vector<std::string> fields;
    for (const auto& field : schema.fields) {
        fields.push_back(field.name);
    }
    return joinFragments(fields, ", ");
}

std::string SqlQueryBuilder::buildWhereClause(const Json& filter,
                                              Dialect dialect,
                                              int& param_index) {
    std::vector<std::string> conditions;
    for (const auto& [key, value] : filter.items()) {
        (void)value; // Unused in this simplified version
        conditions.push_back(key + " = " + placeholder(dialect, param_index++));
    }
    return joinFragments(conditions, " AND ");
}

std::string SqlQueryBuilder::placeholder(Dialect dialect, int index) {
    if (dialect == Dialect::Postgres || dialect == Dialect::Prisma) {
        return "$" + std::to_string(index);
    }
    return "?"; // MySQL uses positional placeholders
}

std::string SqlQueryBuilder::joinFragments(const std::vector<std::string>& fragments,
                                          const std::string& separator) {
    std::ostringstream out;
    for (size_t i = 0; i < fragments.size(); ++i) {
        if (i > 0) {
            out << separator;
        }
        out << fragments[i];
    }
    return out.str();
}

} // namespace sql
} // namespace adapters
} // namespace dbal
