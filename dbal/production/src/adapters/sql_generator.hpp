#ifndef DBAL_SQL_GENERATOR_HPP
#define DBAL_SQL_GENERATOR_HPP

#include "schema_loader.hpp"
#include <sstream>
#include <algorithm>

namespace dbal {
namespace adapters {

enum class SqlDialect {
    SQLite,
    PostgreSQL,
    MySQL
};

/**
 * Generates CREATE TABLE SQL from entity definitions
 */
class SqlGenerator {
public:
    /**
     * Map YAML type to SQL type
     */
    static std::string mapTypeToSql(const FieldDefinition& field, SqlDialect dialect) {
        const std::string& yaml_type = field.type;

        if (dialect == SqlDialect::SQLite) {
            if (yaml_type == "uuid") return "TEXT";
            if (yaml_type == "string" || yaml_type == "email") return "TEXT";
            if (yaml_type == "text") return "TEXT";
            if (yaml_type == "bigint") return "INTEGER";
            if (yaml_type == "integer" || yaml_type == "int") return "INTEGER";
            if (yaml_type == "boolean") return "INTEGER"; // SQLite uses 0/1
            if (yaml_type == "enum") return "TEXT";
            if (yaml_type == "json") return "TEXT";
            if (yaml_type == "timestamp") return "INTEGER";
            return "TEXT";
        }

        if (dialect == SqlDialect::PostgreSQL) {
            if (yaml_type == "uuid") return "UUID";
            if (yaml_type == "string" || yaml_type == "email") {
                int max_len = field.max_length.value_or(255);
                return "VARCHAR(" + std::to_string(max_len) + ")";
            }
            if (yaml_type == "text") return "TEXT";
            if (yaml_type == "bigint") return "BIGINT";
            if (yaml_type == "integer" || yaml_type == "int") return "INTEGER";
            if (yaml_type == "boolean") return "BOOLEAN";
            if (yaml_type == "enum") return "VARCHAR(50)"; // Could use ENUM type
            if (yaml_type == "json") return "JSONB";
            if (yaml_type == "timestamp") return "BIGINT";
            return "TEXT";
        }

        // MySQL
        if (yaml_type == "uuid") return "CHAR(36)";
        if (yaml_type == "string" || yaml_type == "email") {
            int max_len = field.max_length.value_or(255);
            return "VARCHAR(" + std::to_string(max_len) + ")";
        }
        if (yaml_type == "text") return "TEXT";
        if (yaml_type == "bigint") return "BIGINT";
        if (yaml_type == "integer" || yaml_type == "int") return "INT";
        if (yaml_type == "boolean") return "TINYINT(1)";
        if (yaml_type == "enum") return "VARCHAR(50)";
        if (yaml_type == "json") return "JSON";
        if (yaml_type == "timestamp") return "BIGINT";
        return "TEXT";
    }

    /**
     * Quote identifier for dialect
     */
    static std::string quoteIdentifier(const std::string& name, SqlDialect dialect) {
        if (dialect == SqlDialect::PostgreSQL) {
            return "\"" + name + "\"";
        }
        if (dialect == SqlDialect::MySQL) {
            return "`" + name + "`";
        }
        // SQLite doesn't require quoting typically
        return name;
    }

    /**
     * Generate CREATE TABLE statement
     */
    static std::string generateCreateTable(const EntityDefinition& entity, SqlDialect dialect) {
        std::ostringstream sql;

        std::string table_name = quoteIdentifier(entity.name, dialect);
        sql << "CREATE TABLE IF NOT EXISTS " << table_name << " (\n";

        // Add fields
        bool first = true;
        for (const auto& field : entity.fields) {
            if (!first) sql << ",\n";
            first = false;

            sql << "    " << quoteIdentifier(field.name, dialect) << " ";
            sql << mapTypeToSql(field, dialect);

            if (field.primary) {
                sql << " PRIMARY KEY";
            }

            if (field.required && !field.primary) {
                sql << " NOT NULL";
            }

            if (field.unique && !field.primary) {
                sql << " UNIQUE";
            }

            if (field.default_value) {
                const std::string& def_val = *field.default_value;
                sql << " DEFAULT ";

                // Handle boolean defaults
                if (field.type == "boolean") {
                    if (dialect == SqlDialect::SQLite || dialect == SqlDialect::MySQL) {
                        sql << (def_val == "true" || def_val == "1" ? "1" : "0");
                    } else {
                        sql << (def_val == "true" ? "true" : "false");
                    }
                }
                // Handle string/enum defaults
                else if (field.type == "string" || field.type == "enum" || field.type == "text") {
                    sql << "'" << def_val << "'";
                }
                // Numeric defaults
                else {
                    sql << def_val;
                }
            }
        }

        sql << "\n)";

        // MySQL-specific options
        if (dialect == SqlDialect::MySQL) {
            sql << " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        }

        return sql.str();
    }

    /**
     * Generate CREATE INDEX statements
     */
    static std::vector<std::string> generateIndexes(const EntityDefinition& entity, SqlDialect dialect) {
        std::vector<std::string> statements;

        for (const auto& index : entity.indexes) {
            if (index.fields.empty()) continue;

            // Skip unique indexes on single fields (already handled in CREATE TABLE)
            if (index.unique && index.fields.size() == 1) {
                // Check if field already has UNIQUE constraint
                bool field_is_unique = false;
                for (const auto& field : entity.fields) {
                    if (field.name == index.fields[0] && (field.unique || field.primary)) {
                        field_is_unique = true;
                        break;
                    }
                }
                if (field_is_unique) continue;
            }

            std::ostringstream sql;

            // Generate index name
            std::string index_name = "idx_" + entity.name;
            for (const auto& field : index.fields) {
                index_name += "_" + field;
            }
            std::transform(index_name.begin(), index_name.end(), index_name.begin(), ::tolower);

            if (dialect == SqlDialect::PostgreSQL) {
                sql << "CREATE";
                if (index.unique) sql << " UNIQUE";
                sql << " INDEX IF NOT EXISTS " << quoteIdentifier(index_name, dialect);
                sql << " ON " << quoteIdentifier(entity.name, dialect) << "(";
            } else if (dialect == SqlDialect::MySQL) {
                sql << "CREATE";
                if (index.unique) sql << " UNIQUE";
                sql << " INDEX " << index_name;
                sql << " ON " << quoteIdentifier(entity.name, dialect) << "(";
            } else { // SQLite
                sql << "CREATE";
                if (index.unique) sql << " UNIQUE";
                sql << " INDEX IF NOT EXISTS " << index_name;
                sql << " ON " << entity.name << "(";
            }

            // Add fields
            bool first = true;
            for (const auto& field : index.fields) {
                if (!first) sql << ", ";
                first = false;
                sql << quoteIdentifier(field, dialect);
            }

            sql << ")";
            statements.push_back(sql.str());
        }

        return statements;
    }
};

} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_GENERATOR_HPP
