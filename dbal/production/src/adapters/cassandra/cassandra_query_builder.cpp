#include "cassandra_query_builder.hpp"
#include <sstream>

namespace dbal {
namespace adapters {
namespace cassandra {

std::string CassandraQueryBuilder::buildCreateTable(const EntitySchema& schema) {
    std::ostringstream oss;
    oss << "CREATE TABLE IF NOT EXISTS " << schema.name << " (";

    // Add fields
    for (size_t i = 0; i < schema.fields.size(); ++i) {
        const auto& field = schema.fields[i];
        oss << field.name << " " << mapTypeToCql(field.type);

        if (i < schema.fields.size() - 1) {
            oss << ", ";
        }
    }

    // Primary key (assume id field exists)
    oss << ", PRIMARY KEY (id))";

    return oss.str();
}

std::string CassandraQueryBuilder::buildInsert(const EntitySchema& schema) {
    std::ostringstream oss;
    oss << "INSERT INTO " << schema.name << " (";
    oss << buildFieldList(schema);
    oss << ") VALUES (";
    oss << buildPlaceholders(schema.fields.size());
    oss << ")";

    return oss.str();
}

std::string CassandraQueryBuilder::buildSelect(const EntitySchema& schema, bool with_where, bool with_limit) {
    std::ostringstream oss;
    oss << "SELECT * FROM " << schema.name;

    if (with_where) {
        oss << " WHERE id = ?";
    }

    if (with_limit) {
        oss << " LIMIT ?";
    }

    return oss.str();
}

std::string CassandraQueryBuilder::buildUpdate(const EntitySchema& schema) {
    std::ostringstream oss;
    oss << "UPDATE " << schema.name << " SET ";
    oss << buildSetClause(schema);
    oss << " WHERE id = ?";

    return oss.str();
}

std::string CassandraQueryBuilder::buildDelete(const EntitySchema& schema) {
    std::ostringstream oss;
    oss << "DELETE FROM " << schema.name << " WHERE id = ?";

    return oss.str();
}

std::string CassandraQueryBuilder::buildList(const EntitySchema& schema, const ListOptions& options) {
    std::ostringstream oss;
    oss << "SELECT * FROM " << schema.name;

    // Add WHERE clause if filter provided
    if (!options.filter.empty()) {
        oss << " WHERE " << buildWhereClause(options.filter);
    }

    // Add LIMIT
    if (options.limit > 0) {
        oss << " LIMIT " << options.limit;
    }

    return oss.str();
}

std::string CassandraQueryBuilder::mapTypeToCql(const std::string& dbal_type) {
    if (dbal_type == "string") {
        return "text";
    } else if (dbal_type == "number") {
        return "double";
    } else if (dbal_type == "boolean") {
        return "boolean";
    } else if (dbal_type == "timestamp") {
        return "timestamp";
    } else if (dbal_type == "json") {
        return "text";  // Store JSON as text
    }
    return "text";  // Default to text
}

std::string CassandraQueryBuilder::buildFieldList(const EntitySchema& schema) {
    std::ostringstream oss;
    for (size_t i = 0; i < schema.fields.size(); ++i) {
        oss << schema.fields[i].name;
        if (i < schema.fields.size() - 1) {
            oss << ", ";
        }
    }
    return oss.str();
}

std::string CassandraQueryBuilder::buildPlaceholders(size_t count) {
    std::ostringstream oss;
    for (size_t i = 0; i < count; ++i) {
        oss << "?";
        if (i < count - 1) {
            oss << ", ";
        }
    }
    return oss.str();
}

std::string CassandraQueryBuilder::buildSetClause(const EntitySchema& schema) {
    std::ostringstream oss;
    bool first = true;

    for (const auto& field : schema.fields) {
        // Skip id field in SET clause
        if (field.name == "id") {
            continue;
        }

        if (!first) {
            oss << ", ";
        }
        oss << field.name << " = ?";
        first = false;
    }

    return oss.str();
}

std::string CassandraQueryBuilder::buildWhereClause(const Json& filter) {
    // Simple implementation - just handle equality for now
    // Full implementation would need complex filter parsing
    std::ostringstream oss;
    bool first = true;

    for (auto it = filter.begin(); it != filter.end(); ++it) {
        if (!first) {
            oss << " AND ";
        }
        oss << it.key() << " = ?";
        first = false;
    }

    return oss.str();
}

} // namespace cassandra
} // namespace adapters
} // namespace dbal
