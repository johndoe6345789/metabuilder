#include "sql_adapter_base.hpp"
#include "../../config/env_config.hpp"
#include "../schema_loader.hpp"
#include "../sql_template_generator.hpp"
#include <algorithm>
#include <map>
#include <set>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sql {

// ===== Schema Loading =====

void SqlAdapter::loadSchemas() {
    using namespace dbal::config;

    std::string schema_dir;
    try {
        schema_dir = EnvConfig::getSchemaDir();
    } catch (const std::exception& e) {
        spdlog::warn("DBAL_SCHEMA_DIR not set, no entity schemas loaded: {}", e.what());
        return;
    }

    spdlog::info("Loading entity schemas from: {}", schema_dir);
    auto entities = SchemaLoader::loadFromDirectory(schema_dir);
    spdlog::info("Loaded {} entity definitions from JSON", entities.size());

    for (const auto& entity : entities) {
        EntitySchema schema;
        schema.name = entity.name;
        schema.displayName = entity.name;

        for (const auto& field : entity.fields) {
            EntityField ef;
            ef.name     = field.name;
            ef.type     = field.type;
            ef.required = field.required || field.primary;
            ef.unique   = field.unique   || field.primary;
            ef.nullable = field.nullable || field.optional;
            ef.defaultValue = field.default_value;
            ef.enumValues   = field.enum_values.empty() ? std::nullopt
                                : std::optional<std::vector<std::string>>(field.enum_values);
            ef.minLength    = field.min_length;
            ef.maxLength    = field.max_length;
            ef.pattern      = field.pattern;
            ef.sensitive    = field.sensitive;
            schema.fields.push_back(ef);
        }

        // Propagate relations
        for (const auto& rel : entity.relations) {
            RelationDef rd;
            rd.name           = rel.name;
            rd.type           = rel.type;
            rd.target_entity  = rel.entity;
            rd.foreign_key    = rel.foreign_key;
            rd.cascade_delete = rel.cascade_delete;
            schema.relations.push_back(rd);
        }

        // Propagate query config
        schema.query_config.allowed_operators = entity.query_config.allowed_operators;
        schema.query_config.allowed_group_by  = entity.query_config.allowed_group_by;
        schema.query_config.allowed_includes  = entity.query_config.allowed_includes;
        schema.query_config.max_results       = entity.query_config.max_results;
        schema.query_config.timeout_ms        = entity.query_config.timeout_ms;

        // Register under PascalCase name
        schemas_[entity.name] = schema;

        // Also register under lowercase name for case-insensitive lookups
        std::string lower_name = entity.name;
        std::transform(lower_name.begin(), lower_name.end(), lower_name.begin(),
                       [](unsigned char c) { return std::tolower(c); });
        if (lower_name != entity.name) {
            schemas_[lower_name] = schema;
        }

        spdlog::debug("Registered entity schema: {} ({} fields)", entity.name, entity.fields.size());
    }
}

void SqlAdapter::createTables() {
    using namespace dbal::config;

    std::string schema_dir;
    std::string template_dir;
    try {
        schema_dir = EnvConfig::getSchemaDir();
        template_dir = EnvConfig::getTemplateDir();
    } catch (const std::exception& e) {
        spdlog::warn("Schema/template dirs not configured, skipping table creation: {}", e.what());
        return;
    }

    auto conn = pool_.acquire();
    if (!conn) {
        throw std::runtime_error("Unable to acquire SQL connection for table creation");
    }
    ConnectionGuard guard(pool_, conn);

    // Load all entity definitions from JSON
    spdlog::info("Loading schemas from: {}", schema_dir);
    auto entities = SchemaLoader::loadFromDirectory(schema_dir);
    spdlog::info("Loaded {} entity definitions", entities.size());

    // Create SQL template generator
    spdlog::info("Using templates from: {}", template_dir);
    SqlTemplateGenerator generator(template_dir);

    // Determine SQL dialect for template generation
    SqlDialect sql_dialect;
    if (dialect_ == Dialect::Postgres || dialect_ == Dialect::Prisma) {
        sql_dialect = SqlDialect::PostgreSQL;
    } else {
        sql_dialect = SqlDialect::MySQL;
    }

    // Generate and execute CREATE TABLE for each entity
    for (const auto& entity : entities) {
        // Generate CREATE TABLE SQL
        std::string create_sql = generator.generateCreateTable(entity, sql_dialect);

        // Execute CREATE TABLE
        try {
            executeNonQuery(conn, create_sql, {});
        } catch (const SqlError& err) {
            throw std::runtime_error("Failed to create table " + entity.name + ": " + err.message);
        }

        // Generate and execute CREATE INDEX statements
        auto index_statements = generator.generateIndexes(entity, sql_dialect);
        for (const auto& index_sql : index_statements) {
            try {
                executeNonQuery(conn, index_sql, {});
            } catch (const SqlError&) {
                // Index might already exist, ignore error
            }
        }

        // Add any columns present in the schema but missing from the live table
        migrateTable(conn, entity, sql_dialect, generator);
    }
}

namespace {

struct ExistingColumn {
    bool nullable = true;
    std::string data_type; // MySQL only — needed to reconstruct MODIFY COLUMN statements
};

} // namespace

void SqlAdapter::migrateTable(SqlConnection* conn, const EntityDefinition& entity,
                               SqlDialect sql_dialect, SqlTemplateGenerator& generator) {
    const bool pg = (sql_dialect == SqlDialect::PostgreSQL);
    const std::string quoted_table = quoteId(entity.name);

    // ===== 1. Inspect existing columns (name, nullability, and for MySQL, type) =====
    std::map<std::string, ExistingColumn> existing_cols;
    try {
        std::vector<SqlRow> rows;
        if (pg) {
            rows = executeQuery(conn,
                "SELECT column_name, is_nullable FROM information_schema.columns "
                "WHERE table_schema='public' AND table_name=$1",
                {{"table_name", entity.name}});
            for (const auto& row : rows) {
                auto nameIt = row.columns.find("column_name");
                auto nullIt = row.columns.find("is_nullable");
                if (nameIt == row.columns.end()) continue;
                ExistingColumn col;
                col.nullable = (nullIt == row.columns.end()) || (nullIt->second == "YES");
                existing_cols[nameIt->second] = col;
            }
        } else {
            // MySQL / MariaDB
            rows = executeQuery(conn,
                "SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE FROM information_schema.COLUMNS "
                "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?",
                {{"table_name", entity.name}});
            for (const auto& row : rows) {
                auto nameIt = row.columns.find("COLUMN_NAME");
                if (nameIt == row.columns.end()) nameIt = row.columns.find("column_name");
                if (nameIt == row.columns.end()) continue;
                auto nullIt = row.columns.find("IS_NULLABLE");
                if (nullIt == row.columns.end()) nullIt = row.columns.find("is_nullable");
                auto typeIt = row.columns.find("COLUMN_TYPE");
                if (typeIt == row.columns.end()) typeIt = row.columns.find("column_type");
                ExistingColumn col;
                col.nullable = (nullIt == row.columns.end()) || (nullIt->second == "YES");
                col.data_type = (typeIt != row.columns.end()) ? typeIt->second : "";
                existing_cols[nameIt->second] = col;
            }
        }
    } catch (const std::exception& e) {
        spdlog::warn("Schema migration: could not inspect columns for {}: {}", entity.name, e.what());
        return;
    }

    // ===== 2. Add columns present in the schema but missing from the table =====
    for (const auto& field : entity.fields) {
        if (existing_cols.count(field.name) == 0) {
            spdlog::info("Schema migration: adding column {}.{}", entity.name, field.name);
            std::string alter_sql = generator.generateAlterAddColumn(entity, field, sql_dialect);
            try {
                executeNonQuery(conn, alter_sql, {});
                spdlog::info("Schema migration: column {}.{} added", entity.name, field.name);
            } catch (const SqlError& err) {
                spdlog::warn("Schema migration: failed to add {}.{}: {}", entity.name, field.name, err.message);
            } catch (const std::exception& e) {
                spdlog::warn("Schema migration: failed to add {}.{}: {}", entity.name, field.name, e.what());
            }
        }
    }

    // ===== 3. Relax NOT NULL where the schema now allows null =====
    // Only ever loosens a constraint (never adds one) — no data can be
    // rejected or lost by this step, so it's always safe to run unattended.
    for (const auto& field : entity.fields) {
        auto it = existing_cols.find(field.name);
        if (it == existing_cols.end() || it->second.nullable) continue;
        bool schema_allows_null = (field.nullable || field.optional) && !field.primary;
        if (!schema_allows_null) continue;

        spdlog::info("Schema migration: relaxing NOT NULL on {}.{} (schema now allows null)",
                     entity.name, field.name);
        try {
            if (pg) {
                executeNonQuery(conn,
                    "ALTER TABLE " + quoted_table + " ALTER COLUMN " + quoteId(field.name) + " DROP NOT NULL",
                    {});
            } else if (!it->second.data_type.empty()) {
                executeNonQuery(conn,
                    "ALTER TABLE " + quoted_table + " MODIFY COLUMN " + quoteId(field.name) + " " +
                    it->second.data_type + " NULL",
                    {});
            }
            it->second.nullable = true;
        } catch (const SqlError& err) {
            spdlog::warn("Schema migration: failed to relax NOT NULL on {}.{}: {}",
                         entity.name, field.name, err.message);
        } catch (const std::exception& e) {
            spdlog::warn("Schema migration: failed to relax NOT NULL on {}.{}: {}",
                         entity.name, field.name, e.what());
        }
    }

    // ===== 4. Correct primary key drift (e.g. after a field rename moved =====
    // ===== which column is `primary: true`) =====
    std::string schema_primary_field;
    for (const auto& field : entity.fields) {
        if (field.primary) { schema_primary_field = field.name; break; }
    }
    if (!schema_primary_field.empty()) {
        std::vector<std::string> current_pk_cols;
        std::string current_pk_constraint;
        try {
            std::vector<SqlRow> rows;
            if (pg) {
                rows = executeQuery(conn,
                    "SELECT kcu.column_name, tc.constraint_name "
                    "FROM information_schema.table_constraints tc "
                    "JOIN information_schema.key_column_usage kcu "
                    "  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema "
                    "WHERE tc.table_schema='public' AND tc.table_name=$1 AND tc.constraint_type='PRIMARY KEY'",
                    {{"table_name", entity.name}});
                for (const auto& row : rows) {
                    auto colIt = row.columns.find("column_name");
                    auto nameIt = row.columns.find("constraint_name");
                    if (colIt != row.columns.end()) current_pk_cols.push_back(colIt->second);
                    if (nameIt != row.columns.end()) current_pk_constraint = nameIt->second;
                }
            } else {
                rows = executeQuery(conn,
                    "SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE "
                    "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME='PRIMARY'",
                    {{"table_name", entity.name}});
                for (const auto& row : rows) {
                    auto colIt = row.columns.find("COLUMN_NAME");
                    if (colIt == row.columns.end()) colIt = row.columns.find("column_name");
                    if (colIt != row.columns.end()) current_pk_cols.push_back(colIt->second);
                }
            }
        } catch (const SqlError& err) {
            spdlog::warn("Schema migration: could not inspect primary key for {}: {}", entity.name, err.message);
            current_pk_cols.clear();
        } catch (const std::exception& e) {
            spdlog::warn("Schema migration: could not inspect primary key for {}: {}", entity.name, e.what());
            current_pk_cols.clear();
        }

        bool pk_matches_schema = (current_pk_cols.size() == 1 && current_pk_cols[0] == schema_primary_field);
        if (!pk_matches_schema && existing_cols.count(schema_primary_field) > 0) {
            spdlog::warn("Schema migration: {} — schema's primary field is '{}' but the table's actual "
                         "primary key is on [{}]. Attempting to correct this automatically.",
                         entity.name, schema_primary_field, joinFragments(current_pk_cols, ", "));
            try {
                // The new primary key column must be NOT NULL before it can
                // become the primary key — if existing rows have NULL there,
                // this (intentionally) fails loudly rather than silently
                // deleting those rows. That's a data decision for an
                // operator, not something a schema migration should do
                // unattended.
                if (pg) {
                    executeNonQuery(conn,
                        "ALTER TABLE " + quoted_table + " ALTER COLUMN " +
                        quoteId(schema_primary_field) + " SET NOT NULL", {});
                } else {
                    auto it = existing_cols.find(schema_primary_field);
                    if (it != existing_cols.end() && !it->second.data_type.empty()) {
                        executeNonQuery(conn,
                            "ALTER TABLE " + quoted_table + " MODIFY COLUMN " +
                            quoteId(schema_primary_field) + " " + it->second.data_type + " NOT NULL", {});
                    }
                }

                if (!current_pk_constraint.empty()) {
                    executeNonQuery(conn,
                        "ALTER TABLE " + quoted_table + " DROP CONSTRAINT " + quoteId(current_pk_constraint), {});
                } else if (!current_pk_cols.empty() && !pg) {
                    executeNonQuery(conn, "ALTER TABLE " + quoted_table + " DROP PRIMARY KEY", {});
                }

                executeNonQuery(conn,
                    "ALTER TABLE " + quoted_table + " ADD PRIMARY KEY (" + quoteId(schema_primary_field) + ")", {});

                spdlog::info("Schema migration: {} primary key corrected to '{}'",
                             entity.name, schema_primary_field);
            } catch (const SqlError& err) {
                spdlog::error("Schema migration: {} primary key correction FAILED — table still has its old "
                              "primary key on [{}], schema expects '{}'. This usually means existing rows have "
                              "NULL or duplicate values in '{}' and need manual cleanup before the primary key "
                              "can be moved. Reason: {}",
                              entity.name, joinFragments(current_pk_cols, ", "), schema_primary_field,
                              schema_primary_field, err.message);
            } catch (const std::exception& e) {
                spdlog::error("Schema migration: {} primary key correction FAILED — table still has its old "
                              "primary key on [{}], schema expects '{}'. This usually means existing rows have "
                              "NULL or duplicate values in '{}' and need manual cleanup before the primary key "
                              "can be moved. Reason: {}",
                              entity.name, joinFragments(current_pk_cols, ", "), schema_primary_field,
                              schema_primary_field, e.what());
            }
        }
    }

    // ===== 5. Report orphaned columns (in the table, not in the schema) =====
    // Logged only — never auto-dropped. A column absent from the current
    // schema might just be mid-migration cleanup debt, but it might also be
    // data an operator still needs; dropping it is a one-way door this
    // function deliberately never opens on its own.
    std::set<std::string> schema_fields;
    for (const auto& field : entity.fields) schema_fields.insert(field.name);
    for (const auto& [col_name, _] : existing_cols) {
        if (schema_fields.count(col_name) == 0) {
            spdlog::warn("Schema migration: {}.{} exists in the table but not in the current schema "
                         "(orphaned — not auto-dropped, review manually)", entity.name, col_name);
        }
    }
}

// ===== Metadata =====

Result<std::vector<std::string>> SqlAdapter::getAvailableEntities() {
    std::vector<std::string> entities;
    entities.reserve(schemas_.size());
    for (const auto& [name, _] : schemas_) {
        entities.push_back(name);
    }
    return Result<std::vector<std::string>>(entities);
}

Result<EntitySchema> SqlAdapter::getEntitySchema(const std::string& entityName) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    return Result<EntitySchema>(*schemaResult);
}

void SqlAdapter::close() {
    // Connections will tear down automatically via RAII in the pool.
}

// ===== Protected Methods =====

std::optional<EntitySchema> SqlAdapter::getEntitySchemaInternal(const std::string& entityName) const {
    auto it = schemas_.find(entityName);
    if (it != schemas_.end()) {
        return it->second;
    }
    return std::nullopt;
}

}
}
}
