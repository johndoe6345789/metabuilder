#ifndef DBAL_SQL_TEMPLATE_GENERATOR_HPP
#define DBAL_SQL_TEMPLATE_GENERATOR_HPP

#include "schema_loader.hpp"
#include "sql_generator.hpp"  // For SqlDialect enum
#include <inja/inja.hpp>
#include <nlohmann/json.hpp>
#include <filesystem>
#include <fstream>

namespace dbal {
namespace adapters {

using json = nlohmann::json;

/**
 * Template-based SQL generator using Inja (Jinja2-like templates)
 * Templates are loaded from files and can be customized per dialect
 */
class SqlTemplateGenerator {
private:
    inja::Environment env_;
    std::string template_dir_;

    /**
     * Map YAML field type to SQL type for given dialect
     */
    static std::string mapFieldType(const FieldDefinition& field, SqlDialect dialect) {
        const std::string& yaml_type = field.type;
        int max_len = field.max_length.value_or(255);

        if (dialect == SqlDialect::SQLite) {
            if (yaml_type == "uuid" || yaml_type == "string" || yaml_type == "email" || yaml_type == "text")
                return "TEXT";
            if (yaml_type == "bigint" || yaml_type == "integer" || yaml_type == "int" || yaml_type == "timestamp")
                return "INTEGER";
            if (yaml_type == "boolean") return "INTEGER";
            if (yaml_type == "enum") return "TEXT";
            return "TEXT";
        }

        if (dialect == SqlDialect::PostgreSQL) {
            if (yaml_type == "uuid") return "UUID";
            if (yaml_type == "string" || yaml_type == "email")
                return "VARCHAR(" + std::to_string(max_len) + ")";
            if (yaml_type == "text") return "TEXT";
            if (yaml_type == "bigint" || yaml_type == "timestamp") return "BIGINT";
            if (yaml_type == "integer" || yaml_type == "int") return "INTEGER";
            if (yaml_type == "boolean") return "BOOLEAN";
            if (yaml_type == "enum") return "VARCHAR(50)";
            if (yaml_type == "json") return "JSONB";
            return "TEXT";
        }

        // MySQL
        if (yaml_type == "uuid") return "CHAR(36)";
        if (yaml_type == "string" || yaml_type == "email")
            return "VARCHAR(" + std::to_string(max_len) + ")";
        if (yaml_type == "text") return "TEXT";
        if (yaml_type == "bigint" || yaml_type == "timestamp") return "BIGINT";
        if (yaml_type == "integer" || yaml_type == "int") return "INT";
        if (yaml_type == "boolean") return "TINYINT(1)";
        if (yaml_type == "enum") return "VARCHAR(50)";
        if (yaml_type == "json") return "JSON";
        return "TEXT";
    }

    /**
     * Convert EntityDefinition to JSON for template rendering
     */
    json entityToJson(const EntityDefinition& entity, SqlDialect dialect) const {
        json data;
        data["table_name"] = entity.name;
        data["version"] = entity.version;
        data["description"] = entity.description;

        // Convert fields
        json fields_array = json::array();
        for (const auto& field : entity.fields) {
            json field_json;
            field_json["name"] = field.name;
            field_json["type"] = mapFieldType(field, dialect);
            field_json["primary"] = field.primary;
            field_json["required"] = field.required;
            field_json["unique"] = field.unique;
            field_json["nullable"] = field.nullable || field.optional;

            // Handle defaults
            if (field.default_value) {
                const std::string& def_val = *field.default_value;
                if (field.type == "boolean") {
                    if (dialect == SqlDialect::SQLite || dialect == SqlDialect::MySQL) {
                        field_json["default"] = (def_val == "true" || def_val == "1") ? "1" : "0";
                    } else {
                        field_json["default"] = (def_val == "true") ? "true" : "false";
                    }
                } else if (field.type == "string" || field.type == "enum" || field.type == "text") {
                    field_json["default"] = "'" + def_val + "'";
                } else {
                    field_json["default"] = def_val;
                }
            } else if (field.primary) {
                // Auto-generate ID defaults for primary keys
                if (field.type == "uuid") {
                    if (dialect == SqlDialect::PostgreSQL) {
                        field_json["default"] = "gen_random_uuid()";
                    } else if (dialect == SqlDialect::SQLite) {
                        field_json["default"] = "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))";
                    } else {
                        field_json["default"] = "(UUID())";
                    }
                } else {
                    // cuid, string, or other text-based primary keys: use UUID cast to text
                    if (dialect == SqlDialect::PostgreSQL) {
                        field_json["default"] = "gen_random_uuid()::text";
                    } else if (dialect == SqlDialect::SQLite) {
                        field_json["default"] = "(lower(hex(randomblob(16))))";
                    } else {
                        field_json["default"] = "(UUID())";
                    }
                }
            } else if (field.name == "createdAt" && !field.default_value) {
                // Auto-generate timestamp default for createdAt
                if (dialect == SqlDialect::PostgreSQL) {
                    field_json["default"] = "EXTRACT(EPOCH FROM NOW())::BIGINT";
                } else if (dialect == SqlDialect::SQLite) {
                    field_json["default"] = "(strftime('%s', 'now'))";
                } else {
                    field_json["default"] = "(UNIX_TIMESTAMP())";
                }
            }

            // CHECK constraint: build from enum values and length bounds
            std::string q = (dialect == SqlDialect::MySQL) ? "`" : "\"";
            std::vector<std::string> checks;
            if (!field.enum_values.empty()) {
                std::string in_list;
                for (size_t i = 0; i < field.enum_values.size(); ++i) {
                    if (i > 0) in_list += ", ";
                    in_list += "'" + field.enum_values[i] + "'";
                }
                checks.push_back(q + field.name + q + " IN (" + in_list + ")");
            }
            if (field.min_length) {
                checks.push_back("LENGTH(" + q + field.name + q + ") >= " + std::to_string(*field.min_length));
            }
            if (field.max_length) {
                checks.push_back("LENGTH(" + q + field.name + q + ") <= " + std::to_string(*field.max_length));
            }
            if (!checks.empty()) {
                std::string expr = "CHECK (";
                for (size_t i = 0; i < checks.size(); ++i) {
                    if (i > 0) expr += " AND ";
                    expr += checks[i];
                }
                expr += ")";
                field_json["check"] = expr;
            }

            fields_array.push_back(field_json);
        }
        data["fields"] = fields_array;

        // Convert indexes
        json indexes_array = json::array();
        for (const auto& index : entity.indexes) {
            if (index.fields.empty()) continue;

            // Skip if single-field index and field already has unique constraint
            if (index.unique && index.fields.size() == 1) {
                bool skip = false;
                for (const auto& field : entity.fields) {
                    if (field.name == index.fields[0] && (field.unique || field.primary)) {
                        skip = true;
                        break;
                    }
                }
                if (skip) continue;
            }

            json index_json;
            index_json["fields"] = index.fields;
            index_json["unique"] = index.unique;

            // Generate index name
            std::string index_name = "idx_" + entity.name;
            for (const auto& f : index.fields) {
                index_name += "_" + f;
            }
            std::transform(index_name.begin(), index_name.end(), index_name.begin(), ::tolower);
            index_json["name"] = index_name;

            indexes_array.push_back(index_json);
        }
        data["indexes"] = indexes_array;

        return data;
    }

public:
    SqlTemplateGenerator(const std::string& template_dir = "")
        : template_dir_(template_dir.empty() ? "/dbal/templates/sql" : template_dir) {

        // Configure Inja environment
        // NOTE: trim_blocks and lstrip_blocks cause spaces inside inline
        // {% if %} blocks to be stripped, producing invalid SQL like
        // "TEXTPRIMARY KEY" instead of "TEXT PRIMARY KEY"
        env_.set_trim_blocks(false);
        env_.set_lstrip_blocks(false);
    }

    /**
     * Generate CREATE TABLE SQL from entity definition
     * Uses Inja templates loaded from files
     */
    std::string generateCreateTable(const EntityDefinition& entity, SqlDialect dialect) {
        // Determine template file
        std::string template_file;
        if (dialect == SqlDialect::SQLite) {
            template_file = template_dir_ + "/sqlite_create_table.sql.j2";
        } else if (dialect == SqlDialect::PostgreSQL) {
            template_file = template_dir_ + "/postgres_create_table.sql.j2";
        } else {
            template_file = template_dir_ + "/mysql_create_table.sql.j2";
        }

        // Check if template file exists
        if (std::filesystem::exists(template_file)) {
            // Load template from file
            inja::Template tmpl = env_.parse_template(template_file);
            json data = entityToJson(entity, dialect);
            return env_.render(tmpl, data);
        }

        // Fall back to inline template if file doesn't exist
        std::string inline_template = getInlineCreateTableTemplate(dialect);
        json data = entityToJson(entity, dialect);
        return env_.render(inline_template, data);
    }

    /**
     * Generate CREATE INDEX statements
     */
    std::vector<std::string> generateIndexes(const EntityDefinition& entity, SqlDialect dialect) {
        std::vector<std::string> statements;
        json data = entityToJson(entity, dialect);

        if (!data.contains("indexes") || data["indexes"].empty()) {
            return statements;
        }

        // Template for creating indexes
        std::string index_template;
        if (dialect == SqlDialect::SQLite) {
            index_template = R"(CREATE {{ unique_keyword }}INDEX IF NOT EXISTS "{{ name }}" ON "{{ table_name }}"({% for f in fields %}"{{ f }}"{% if not loop.is_last %}, {% endif %}{% endfor %}))";
        } else if (dialect == SqlDialect::PostgreSQL) {
            index_template = R"(CREATE {{ unique_keyword }}INDEX IF NOT EXISTS "{{ name }}" ON "{{ table_name }}"({% for f in fields %}"{{ f }}"{% if not loop.is_last %}, {% endif %}{% endfor %}))";
        } else {
            index_template = R"(CREATE {{ unique_keyword }}INDEX {{ name }} ON `{{ table_name }}`({% for f in fields %}`{{ f }}`{% if not loop.is_last %}, {% endif %}{% endfor %}))";
        }

        for (const auto& index : data["indexes"]) {
            json index_data = data;
            index_data["name"] = index["name"];
            index_data["fields"] = index["fields"];
            index_data["unique"] = index["unique"];
            index_data["unique_keyword"] = index["unique"].get<bool>() ? "UNIQUE " : "";
            statements.push_back(env_.render(index_template, index_data));
        }

        return statements;
    }

    /**
     * Generate ALTER TABLE ADD COLUMN SQL for a single missing field.
     * PostgreSQL: uses IF NOT EXISTS natively.
     * MySQL/MariaDB: no IF NOT EXISTS — caller must verify column is absent first.
     * SQLite: no IF NOT EXISTS clause — caller must verify column is absent first.
     */
    std::string generateAlterAddColumn(const EntityDefinition& entity,
                                       const FieldDefinition& field,
                                       SqlDialect dialect) const {
        std::string col_type = mapFieldType(field, dialect);
        if (dialect == SqlDialect::PostgreSQL) {
            return "ALTER TABLE \"" + entity.name + "\" ADD COLUMN IF NOT EXISTS \"" +
                   field.name + "\" " + col_type;
        } else if (dialect == SqlDialect::MySQL) {
            return "ALTER TABLE `" + entity.name + "` ADD COLUMN `" +
                   field.name + "` " + col_type;
        } else {
            // SQLite
            return "ALTER TABLE \"" + entity.name + "\" ADD COLUMN \"" +
                   field.name + "\" " + col_type;
        }
    }

private:
    /**
     * Fallback inline templates if files don't exist
     */
    std::string getInlineCreateTableTemplate(SqlDialect dialect) const {
        if (dialect == SqlDialect::SQLite) {
            return R"(CREATE TABLE IF NOT EXISTS "{{ table_name }}" (
{% for field in fields %}    "{{ field.name }}" {{ field.type }}{% if field.primary %} PRIMARY KEY{% endif %}{% if field.required and not field.primary %} NOT NULL{% endif %}{% if field.unique and not field.primary %} UNIQUE{% endif %}{% if existsIn(field, "default") %} DEFAULT {{ field.default }}{% endif %}{% if existsIn(field, "check") %} {{ field.check }}{% endif %}{% if not loop.is_last %},
{% endif %}{% endfor %}
))";
        } else if (dialect == SqlDialect::PostgreSQL) {
            return R"(CREATE TABLE IF NOT EXISTS "{{ table_name }}" (
{% for field in fields %}    "{{ field.name }}" {{ field.type }}{% if field.primary %} PRIMARY KEY{% endif %}{% if field.required and not field.primary %} NOT NULL{% endif %}{% if field.unique and not field.primary %} UNIQUE{% endif %}{% if existsIn(field, "default") %} DEFAULT {{ field.default }}{% endif %}{% if existsIn(field, "check") %} {{ field.check }}{% endif %}{% if not loop.is_last %},
{% endif %}{% endfor %}
))";
        } else {
            return R"(CREATE TABLE IF NOT EXISTS `{{ table_name }}` (
{% for field in fields %}    `{{ field.name }}` {{ field.type }}{% if field.primary %} PRIMARY KEY{% endif %}{% if field.required and not field.primary %} NOT NULL{% endif %}{% if field.unique and not field.primary %} UNIQUE{% endif %}{% if existsIn(field, "default") %} DEFAULT {{ field.default }}{% endif %}{% if existsIn(field, "check") %} {{ field.check }}{% endif %}{% if not loop.is_last %},
{% endif %}{% endfor %}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci)";
        }
    }
};

} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_TEMPLATE_GENERATOR_HPP
