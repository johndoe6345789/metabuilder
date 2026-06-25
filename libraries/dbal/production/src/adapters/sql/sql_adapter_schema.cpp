#include "sql_adapter_base.hpp"
#include "../../config/env_config.hpp"
#include "../schema_loader.hpp"
#include "../sql_template_generator.hpp"
#include <algorithm>
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

void SqlAdapter::migrateTable(SqlConnection* conn, const EntityDefinition& entity,
                               SqlDialect sql_dialect, SqlTemplateGenerator& generator) {
    std::set<std::string> existing_cols;
    try {
        std::vector<SqlRow> rows;
        if (sql_dialect == SqlDialect::PostgreSQL) {
            rows = executeQuery(conn,
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema='public' AND table_name=$1",
                {{"table_name", entity.name}});
            for (const auto& row : rows) {
                auto it = row.columns.find("column_name");
                if (it != row.columns.end()) existing_cols.insert(it->second);
            }
        } else {
            // MySQL / MariaDB
            rows = executeQuery(conn,
                "SELECT COLUMN_NAME FROM information_schema.COLUMNS "
                "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?",
                {{"table_name", entity.name}});
            for (const auto& row : rows) {
                auto it = row.columns.find("COLUMN_NAME");
                if (it == row.columns.end()) it = row.columns.find("column_name");
                if (it != row.columns.end()) existing_cols.insert(it->second);
            }
        }
    } catch (const std::exception& e) {
        spdlog::warn("Schema migration: could not inspect columns for {}: {}", entity.name, e.what());
        return;
    }

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
