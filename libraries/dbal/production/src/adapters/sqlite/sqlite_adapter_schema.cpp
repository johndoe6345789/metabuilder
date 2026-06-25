#include "sqlite_adapter.hpp"
#include "sqlite_connection_manager.hpp"
#include "sqlite_transaction_manager.hpp"
#include "../schema_loader.hpp"
#include "../sql_template_generator.hpp"
#include "../../config/env_config.hpp"
#include <set>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sqlite {

// ===== Constructor / Destructor =====

SQLiteAdapter::SQLiteAdapter(const std::string& db_path)
    : db_path_(db_path), db_(nullptr) {

    // Initialize helper classes
    conn_manager_ = std::make_unique<SQLiteConnectionManager>(db_path);
    prepared_stmts_ = std::make_unique<SQLitePreparedStatements>(*conn_manager_);
    result_parser_ = std::make_unique<SQLiteResultParser>(*conn_manager_);
    tx_manager_ = std::make_unique<SQLiteTransactionManager>(*conn_manager_);

    // Legacy compatibility (some code still accesses db_ directly)
    db_ = conn_manager_->getHandle();

    loadSchemas();
    createTables();
}

SQLiteAdapter::~SQLiteAdapter() {
    close();
}

void SQLiteAdapter::close() {
    if (conn_manager_) {
        conn_manager_->close();
        db_ = nullptr;
    }
}

// ===== Schema Loading =====

/**
 * Convert EntityDefinition (from YAML SchemaLoader) to core::EntitySchema
 * (used by the adapter's CRUD operations)
 */
static core::EntitySchema entityDefToSchema(const EntityDefinition& entity) {
    core::EntitySchema schema;
    schema.name = entity.name;
    schema.displayName = entity.name;
    schema.description = entity.description;
    schema.version = entity.version;

    for (const auto& field : entity.fields) {
        core::EntityField ef;
        ef.name = field.name;
        ef.type = field.type;
        ef.required = field.required;
        ef.unique = field.unique;
        ef.primary = field.primary;
        ef.generated = field.generated;
        ef.nullable = field.nullable || field.optional;
        ef.index = false;
        ef.defaultValue = field.default_value;
        ef.minLength = field.min_length;
        ef.maxLength = field.max_length;
        ef.pattern = field.pattern;
        if (!field.enum_values.empty()) {
            ef.enumValues = field.enum_values;
        }
        schema.fields.push_back(ef);
    }

    for (const auto& idx : entity.indexes) {
        core::EntityIndex ei;
        ei.fields = idx.fields;
        ei.unique = idx.unique;
        schema.indexes.push_back(ei);
    }

    return schema;
}

void SQLiteAdapter::loadSchemas() {
    // Schemas are now loaded dynamically from YAML in createTables()
    // This method is kept for backward compatibility but no longer
    // hardcodes entity definitions.
}

void SQLiteAdapter::createTables() {
    using namespace dbal::config;

    std::string schema_dir = EnvConfig::getSchemaDir();
    spdlog::info("Loading schemas from: {}", schema_dir);
    auto entities = SchemaLoader::loadFromDirectory(schema_dir);
    spdlog::info("Loaded {} entity definitions", entities.size());

    std::string template_dir = EnvConfig::getTemplateDir();
    spdlog::info("Using templates from: {}", template_dir);
    SqlTemplateGenerator generator(template_dir);

    for (const auto& entity : entities) {
        // Register entity schema for CRUD operations
        core::EntitySchema schema = entityDefToSchema(entity);
        schemas_[entity.name] = schema;
        spdlog::debug("Registered entity schema: {}", entity.name);

        std::string create_sql = generator.generateCreateTable(entity, SqlDialect::SQLite);

        char* error_msg = nullptr;
        int rc = sqlite3_exec(db_, create_sql.c_str(), nullptr, nullptr, &error_msg);
        if (rc != SQLITE_OK) {
            std::string error = "Failed to create table " + entity.name + ": ";
            if (error_msg) {
                error += error_msg;
                sqlite3_free(error_msg);
            }
            throw std::runtime_error(error);
        }

        auto index_statements = generator.generateIndexes(entity, SqlDialect::SQLite);
        for (const auto& index_sql : index_statements) {
            rc = sqlite3_exec(db_, index_sql.c_str(), nullptr, nullptr, &error_msg);
            if (rc != SQLITE_OK) {
                std::string error = "Failed to create index for " + entity.name + ": ";
                if (error_msg) {
                    error += error_msg;
                    sqlite3_free(error_msg);
                }
                throw std::runtime_error(error);
            }
        }

        migrateTable(entity, generator);
    }

    spdlog::info("Registered {} entity schemas for CRUD operations", schemas_.size());
}

void SQLiteAdapter::migrateTable(const EntityDefinition& entity, SqlTemplateGenerator& generator) {
    // Query existing columns via PRAGMA table_info
    // Result columns: cid(0), name(1), type(2), notnull(3), dflt_value(4), pk(5)
    std::set<std::string> existing_cols;
    std::string pragma = "PRAGMA table_info(\"" + entity.name + "\")";
    sqlite3_stmt* stmt = nullptr;
    int rc2 = sqlite3_prepare_v2(db_, pragma.c_str(), -1, &stmt, nullptr);
    if (rc2 == SQLITE_OK) {
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            const char* col_name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
            if (col_name) existing_cols.insert(col_name);
        }
        sqlite3_finalize(stmt);
    }

    for (const auto& field : entity.fields) {
        if (existing_cols.count(field.name) == 0) {
            spdlog::info("Schema migration: adding column {}.{}", entity.name, field.name);
            std::string alter_sql = generator.generateAlterAddColumn(entity, field, SqlDialect::SQLite);
            char* err_msg = nullptr;
            int alter_rc = sqlite3_exec(db_, alter_sql.c_str(), nullptr, nullptr, &err_msg);
            if (alter_rc == SQLITE_OK) {
                spdlog::info("Schema migration: column {}.{} added", entity.name, field.name);
            } else {
                std::string err = err_msg ? err_msg : "unknown error";
                spdlog::warn("Schema migration: failed to add {}.{}: {}", entity.name, field.name, err);
                if (err_msg) sqlite3_free(err_msg);
            }
        }
    }
}

std::optional<core::EntitySchema> SQLiteAdapter::getEntitySchemaInternal(const std::string& entityName) const {
    auto it = schemas_.find(entityName);
    if (it != schemas_.end()) {
        return it->second;
    }
    return std::nullopt;
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
