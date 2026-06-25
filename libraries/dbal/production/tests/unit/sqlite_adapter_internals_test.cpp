/**
 * Direct unit tests for SQLite adapter internal classes:
 *   SQLiteConnectionManager  — connection lifecycle, pragma execution
 *   SQLiteTransactionManager — begin/commit/rollback/savepoints
 *   SQLiteTransactionGuard   — RAII auto-rollback
 *   SQLitePreparedStatements — prepare/execute/bind
 *   SQLiteResultParser       — column-type mapping (NULL, bool, int, float, aggregate)
 *
 * All tests use in-memory SQLite (:memory:) so no external deps are needed.
 * One test exercises schema migration via a temp file.
 *
 * Coverage targets (lines previously uncovered):
 *   sqlite_connection_manager.cpp   — error paths, null-handle guards, pragma failure
 *   sqlite_transaction_manager.cpp  — savepoints, guard destructor, error path
 *   sqlite_prepared_statements.cpp  — all execute* overloads, error paths
 *   sqlite_result_parser.cpp        — boolean/integer/null/aggregate columns
 *   sqlite_adapter_schema.cpp       — migrateTable column addition (ALTER TABLE ADD COLUMN)
 */

#include <gtest/gtest.h>
#include <sqlite3.h>
#include <filesystem>
#include <fstream>
#include <set>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>

#include "sqlite/sqlite_connection_manager.hpp"
#include "sqlite/sqlite_transaction_manager.hpp"
#include "sqlite/sqlite_prepared_statements.hpp"
#include "sqlite/sqlite_result_parser.hpp"
#include "sqlite/sqlite_type_converter.hpp"
#include "sqlite/sqlite_adapter.hpp"
#include "dbal/core/entity_loader.hpp"
#include "dbal/errors.hpp"

using dbal::adapters::sqlite::SQLiteConnectionManager;
using dbal::adapters::sqlite::SQLiteTransactionManager;
using dbal::adapters::sqlite::SQLiteTransactionGuard;
using dbal::adapters::sqlite::SQLitePreparedStatements;
using dbal::adapters::sqlite::SQLiteResultParser;
using dbal::adapters::sqlite::SQLiteTypeConverter;
using dbal::core::EntitySchema;
using dbal::core::EntityField;
using Json = nlohmann::json;

#ifndef DBAL_TEST_TEMPLATE_DIR
#  define DBAL_TEST_TEMPLATE_DIR "dbal/templates/sql"
#endif

// ─── Helpers ─────────────────────────────────────────────────────────────────

static const char* kCreateItemsDDL =
    "CREATE TABLE IF NOT EXISTS items ("
    "  id TEXT PRIMARY KEY,"
    "  name TEXT NOT NULL,"
    "  score INTEGER,"
    "  flag INTEGER,"
    "  amount REAL"
    ")";

/** Build a minimal EntitySchema matching kCreateItemsDDL. */
static EntitySchema makeItemsSchema() {
    EntitySchema s;
    s.name = "items";
    auto add = [&](const std::string& n, const std::string& t, bool nullable = true) {
        EntityField f;
        f.name = n; f.type = t; f.nullable = nullable;
        s.fields.push_back(f);
    };
    add("id",     "string",  false);
    add("name",   "string",  false);
    add("score",  "bigint",  true);  // "bigint" triggers int64 branch in columnToJson
    add("flag",   "boolean", true);
    add("amount", "number",  true);
    return s;
}

// ─── Fixture ─────────────────────────────────────────────────────────────────

class SQLiteInternalsFixture : public ::testing::Test {
protected:
    std::unique_ptr<SQLiteConnectionManager> conn;
    EntitySchema schema;

    void SetUp() override {
        conn   = std::make_unique<SQLiteConnectionManager>(":memory:");
        schema = makeItemsSchema();
        // Use executePragma for DDL — avoids calling sqlite3_exec directly in tests
        conn->executePragma(kCreateItemsDDL);
    }

    void TearDown() override { conn.reset(); }

    /** Insert a row via prepared statements. */
    void seedRow(const char* id, const char* name, int score, int flag, double amount) {
        SQLitePreparedStatements ps(*conn);
        const std::string null_s = SQLiteTypeConverter::jsonValueToString(nullptr);
        ps.executeInsert(
            "INSERT INTO items (id, name, score, flag, amount) VALUES (?,?,?,?,?)",
            {id, name, std::to_string(score), std::to_string(flag), std::to_string(amount)});
    }
};

// =============================================================================
// SQLiteConnectionManager
// =============================================================================

TEST(SQLiteConnectionManagerTest, Constructor_MemoryDb_IsOpen) {
    SQLiteConnectionManager cm(":memory:");
    EXPECT_TRUE(cm.isOpen());
}

TEST(SQLiteConnectionManagerTest, GetHandle_NotNull) {
    SQLiteConnectionManager cm(":memory:");
    EXPECT_NE(cm.getHandle(), nullptr);
}

TEST(SQLiteConnectionManagerTest, GetPath_ReturnsGivenPath) {
    SQLiteConnectionManager cm(":memory:");
    EXPECT_EQ(cm.getPath(), ":memory:");
}

TEST(SQLiteConnectionManagerTest, Close_SetsNotOpen) {
    SQLiteConnectionManager cm(":memory:");
    cm.close();
    EXPECT_FALSE(cm.isOpen());
}

TEST(SQLiteConnectionManagerTest, Close_IsIdempotent) {
    SQLiteConnectionManager cm(":memory:");
    cm.close();
    EXPECT_NO_THROW(cm.close());
}

TEST(SQLiteConnectionManagerTest, GetLastInsertRowId_BeforeInsert) {
    SQLiteConnectionManager cm(":memory:");
    EXPECT_GE(cm.getLastInsertRowId(), 0);
}

TEST(SQLiteConnectionManagerTest, GetChanges_BeforeAnyStatement) {
    SQLiteConnectionManager cm(":memory:");
    EXPECT_GE(cm.getChanges(), 0);
}

/** Covers sqlite_connection_manager.cpp:72 — null-handle guard in getLastInsertRowId */
TEST(SQLiteConnectionManagerTest, GetLastInsertRowId_AfterClose_ReturnsNegativeOne) {
    SQLiteConnectionManager cm(":memory:");
    cm.close();
    EXPECT_EQ(cm.getLastInsertRowId(), -1);
}

/** Covers sqlite_connection_manager.cpp:79 — null-handle guard in getChanges */
TEST(SQLiteConnectionManagerTest, GetChanges_AfterClose_ReturnsZero) {
    SQLiteConnectionManager cm(":memory:");
    cm.close();
    EXPECT_EQ(cm.getChanges(), 0);
}

/** Covers sqlite_connection_manager.cpp:86 — null-handle guard in executePragma */
TEST(SQLiteConnectionManagerTest, ExecutePragma_AfterClose_ReturnsError) {
    SQLiteConnectionManager cm(":memory:");
    cm.close();
    auto result = cm.executePragma("PRAGMA foreign_keys = ON");
    EXPECT_FALSE(result.hasValue());
}

/** Covers sqlite_connection_manager.cpp:93-100 — executePragma SQLite error path */
TEST(SQLiteConnectionManagerTest, ExecutePragma_InvalidSql_ReturnsError) {
    SQLiteConnectionManager cm(":memory:");
    auto result = cm.executePragma("THIS_IS_NOT_VALID_SQL_XYZ_$$_UNKNOWN");
    EXPECT_FALSE(result.hasValue());
    EXPECT_NE(result.error().what(), nullptr);
}

/** Covers sqlite_connection_manager.cpp:21-31 — openConnection throw path */
TEST(SQLiteConnectionManagerTest, Constructor_BadPath_Throws) {
    EXPECT_THROW(
        SQLiteConnectionManager("/this/path/cannot/exist/db.sqlite"),
        std::runtime_error
    );
}

TEST(SQLiteConnectionManagerTest, ExecutePragma_Valid_ReturnsOk) {
    SQLiteConnectionManager cm(":memory:");
    auto result = cm.executePragma("PRAGMA foreign_keys = ON");
    EXPECT_TRUE(result.hasValue());
}

// =============================================================================
// SQLiteTransactionManager
// =============================================================================

TEST_F(SQLiteInternalsFixture, TransactionManager_Begin_Succeeds) {
    SQLiteTransactionManager tx(*conn);
    EXPECT_TRUE(tx.begin().hasValue());
    EXPECT_TRUE(tx.isInTransaction());
    tx.rollback();
}

TEST_F(SQLiteInternalsFixture, TransactionManager_Begin_WhenAlreadyActive_ReturnsError) {
    SQLiteTransactionManager tx(*conn);
    ASSERT_TRUE(tx.begin().hasValue());
    EXPECT_FALSE(tx.begin().hasValue());
    tx.rollback();
}

TEST_F(SQLiteInternalsFixture, TransactionManager_Commit_Succeeds) {
    SQLiteTransactionManager tx(*conn);
    ASSERT_TRUE(tx.begin().hasValue());
    EXPECT_TRUE(tx.commit().hasValue());
    EXPECT_FALSE(tx.isInTransaction());
}

TEST_F(SQLiteInternalsFixture, TransactionManager_Commit_NoTransaction_ReturnsError) {
    SQLiteTransactionManager tx(*conn);
    EXPECT_FALSE(tx.commit().hasValue());
}

TEST_F(SQLiteInternalsFixture, TransactionManager_Rollback_Succeeds) {
    SQLiteTransactionManager tx(*conn);
    ASSERT_TRUE(tx.begin().hasValue());
    EXPECT_TRUE(tx.rollback().hasValue());
    EXPECT_FALSE(tx.isInTransaction());
}

TEST_F(SQLiteInternalsFixture, TransactionManager_Rollback_NoTransaction_ReturnsError) {
    SQLiteTransactionManager tx(*conn);
    EXPECT_FALSE(tx.rollback().hasValue());
}

/** Covers sqlite_transaction_manager.cpp:51-54 — savepoint() method */
TEST_F(SQLiteInternalsFixture, TransactionManager_Savepoint_CreatesSuccessfully) {
    SQLiteTransactionManager tx(*conn);
    ASSERT_TRUE(tx.begin().hasValue());
    EXPECT_TRUE(tx.savepoint("sp_test").hasValue());
    tx.rollback();
}

/** Covers sqlite_transaction_manager.cpp:56-59 — releaseSavepoint() method */
TEST_F(SQLiteInternalsFixture, TransactionManager_ReleaseSavepoint_Succeeds) {
    SQLiteTransactionManager tx(*conn);
    ASSERT_TRUE(tx.begin().hasValue());
    ASSERT_TRUE(tx.savepoint("sp_rel").hasValue());
    EXPECT_TRUE(tx.releaseSavepoint("sp_rel").hasValue());
    tx.commit();
}

/** Covers sqlite_transaction_manager.cpp:61-64 — rollbackToSavepoint() method */
TEST_F(SQLiteInternalsFixture, TransactionManager_RollbackToSavepoint_Succeeds) {
    SQLiteTransactionManager tx(*conn);
    ASSERT_TRUE(tx.begin().hasValue());
    ASSERT_TRUE(tx.savepoint("sp_rb").hasValue());
    EXPECT_TRUE(tx.rollbackToSavepoint("sp_rb").hasValue());
    tx.commit();
}

/** Covers sqlite_transaction_manager.cpp:73-81 — executeTransactionStatement error path.
 *  Releasing a non-existent savepoint triggers SQLITE_ERROR. */
TEST_F(SQLiteInternalsFixture, TransactionManager_ReleaseSavepoint_Nonexistent_ReturnsError) {
    SQLiteTransactionManager tx(*conn);
    ASSERT_TRUE(tx.begin().hasValue());
    auto result = tx.releaseSavepoint("no_such_savepoint_xyz");
    EXPECT_FALSE(result.hasValue());
    EXPECT_NE(std::string(result.error().what()).find("Transaction statement failed"), std::string::npos);
    tx.rollback();
}

// Parameterized: savepoint round-trip with different names
struct SavepointNameCase { std::string name; };

class SavepointNameTest : public SQLiteInternalsFixture,
                          public testing::WithParamInterface<SavepointNameCase> {};

TEST_P(SavepointNameTest, Savepoint_Create_And_Release) {
    SQLiteTransactionManager tx(*conn);
    ASSERT_TRUE(tx.begin().hasValue());
    const std::string& sp = GetParam().name;
    EXPECT_TRUE(tx.savepoint(sp).hasValue())        << "savepoint(" << sp << ") failed";
    EXPECT_TRUE(tx.releaseSavepoint(sp).hasValue()) << "releaseSavepoint(" << sp << ") failed";
    tx.commit();
}

INSTANTIATE_TEST_SUITE_P(SavepointNames, SavepointNameTest, testing::Values(
    SavepointNameCase{"sp1"},
    SavepointNameCase{"my_savepoint"},
    SavepointNameCase{"nested_tx"},
    SavepointNameCase{"sp_with_underscores"}
));

// =============================================================================
// SQLiteTransactionGuard
// =============================================================================

/** Covers sqlite_transaction_manager.cpp:88-91 — guard constructor calls begin() */
TEST_F(SQLiteInternalsFixture, TransactionGuard_Constructor_BeginsTransaction) {
    SQLiteTransactionManager tx(*conn);
    {
        SQLiteTransactionGuard guard(tx);
        EXPECT_TRUE(tx.isInTransaction());
        guard.commit();
    }
    EXPECT_FALSE(tx.isInTransaction());
}

/** Covers sqlite_transaction_manager.cpp:100-106 — guard::commit() sets committed_ */
TEST_F(SQLiteInternalsFixture, TransactionGuard_Commit_Succeeds) {
    SQLiteTransactionManager tx(*conn);
    SQLiteTransactionGuard guard(tx);
    EXPECT_TRUE(guard.commit().hasValue());
    EXPECT_FALSE(tx.isInTransaction());
}

/** Covers sqlite_transaction_manager.cpp:93-98 — guard destructor auto-rollback */
TEST_F(SQLiteInternalsFixture, TransactionGuard_Destructor_RollsBackWithoutCommit) {
    SQLiteTransactionManager tx(*conn);
    {
        SQLiteTransactionGuard guard(tx);
        EXPECT_TRUE(tx.isInTransaction());
        // let guard destruct without committing → auto-rollback
    }
    EXPECT_FALSE(tx.isInTransaction());
}

// =============================================================================
// SQLitePreparedStatements
// =============================================================================

TEST_F(SQLiteInternalsFixture, PreparedStatements_Prepare_ValidSql_ReturnsStmt) {
    SQLitePreparedStatements ps(*conn);
    auto result = ps.prepare("SELECT 1");
    ASSERT_TRUE(result.hasValue());
    ps.finalize(result.value());
}

TEST_F(SQLiteInternalsFixture, PreparedStatements_Prepare_InvalidSql_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    auto result = ps.prepare("SELECT FROM NOWHERE INVALID ???");
    EXPECT_FALSE(result.hasValue());
}

TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteInsert_ReturnsRowId) {
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeInsert(
        "INSERT INTO items (id, name, score, flag, amount) VALUES (?,?,?,?,?)",
        {"row1", "alpha", "10", "1", "1.5"});
    EXPECT_TRUE(result.hasValue());
    EXPECT_GT(result.value(), 0);
}

TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteInsert_ConstraintViolation_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    ps.executeInsert("INSERT INTO items (id, name) VALUES (?,?)", {"dup", "first"});
    auto result = ps.executeInsert("INSERT INTO items (id, name) VALUES (?,?)", {"dup", "second"});
    EXPECT_FALSE(result.hasValue());
    // SQLITE_CONSTRAINT maps to conflict error
    EXPECT_NE(std::string(result.error().what()).find("UNIQUE"), std::string::npos);
}

TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteSelect_ReturnsStatement) {
    seedRow("s1", "test", 5, 0, 0.0);
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeSelect("SELECT * FROM items WHERE id = ?", {"s1"});
    ASSERT_TRUE(result.hasValue());
    sqlite3_stmt* stmt = result.value();
    EXPECT_EQ(sqlite3_step(stmt), SQLITE_ROW);
    ps.finalize(stmt);
}

TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteUpdate_ReturnsAffectedRows) {
    seedRow("u1", "original", 0, 0, 0.0);
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeUpdate(
        "UPDATE items SET name = ? WHERE id = ?", {"updated", "u1"});
    EXPECT_TRUE(result.hasValue());
    EXPECT_EQ(result.value(), 1);
}

TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteDelete_ReturnsAffectedRows) {
    seedRow("d1", "to_delete", 0, 0, 0.0);
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeDelete("DELETE FROM items WHERE id = ?", {"d1"});
    EXPECT_TRUE(result.hasValue());
    EXPECT_EQ(result.value(), 1);
}

TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteInsert_WithNullParam) {
    SQLitePreparedStatements ps(*conn);
    const std::string null_s = SQLiteTypeConverter::jsonValueToString(nullptr);
    auto result = ps.executeInsert(
        "INSERT INTO items (id, name, score) VALUES (?,?,?)",
        {"null_row", "nulltest", null_s});
    EXPECT_TRUE(result.hasValue());
}

TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteSelect_InvalidSql_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeSelect("SELECT ??? FROM nowhere", {});
    EXPECT_FALSE(result.hasValue());
}

// =============================================================================
// SQLiteResultParser
// =============================================================================

/** Covers sqlite_result_parser.cpp:35-36 — SQLITE_NULL aggregate alias (no schema match) */
TEST_F(SQLiteInternalsFixture, ResultParser_AggregateAlias_Null_ReturnsNullJson) {
    EntitySchema empty;
    empty.name = "items";

    SQLitePreparedStatements ps(*conn);
    auto stmt_res = ps.executeSelect(
        "SELECT MAX(score) AS max_score FROM items WHERE id='no_such'", {});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(empty, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    ASSERT_EQ(rows.value().size(), 1u);
    EXPECT_TRUE(rows.value()[0]["max_score"].is_null());
}

/** Covers sqlite_result_parser.cpp:37-38 — SQLITE_INTEGER aggregate alias */
TEST_F(SQLiteInternalsFixture, ResultParser_AggregateAlias_Integer_ReturnsInt) {
    EntitySchema empty;
    empty.name = "items";

    seedRow("agg1", "row", 42, 1, 3.14);

    SQLitePreparedStatements ps(*conn);
    auto stmt_res = ps.executeSelect("SELECT COUNT(*) AS cnt FROM items", {});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(empty, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    ASSERT_EQ(rows.value().size(), 1u);
    EXPECT_EQ(rows.value()[0]["cnt"].get<int64_t>(), 1);
}

/** Covers sqlite_result_parser.cpp:39-40 — SQLITE_FLOAT aggregate alias */
TEST_F(SQLiteInternalsFixture, ResultParser_AggregateAlias_Float_ReturnsDouble) {
    EntitySchema empty;
    empty.name = "items";

    seedRow("f1", "float_row", 10, 0, 9.99);

    SQLitePreparedStatements ps(*conn);
    auto stmt_res = ps.executeSelect("SELECT AVG(amount) AS avg_val FROM items", {});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(empty, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    ASSERT_EQ(rows.value().size(), 1u);
    EXPECT_TRUE(rows.value()[0]["avg_val"].is_number());
}

/** Covers sqlite_result_parser.cpp:41-43 — SQLITE_TEXT aggregate alias */
TEST_F(SQLiteInternalsFixture, ResultParser_AggregateAlias_Text_ReturnsString) {
    EntitySchema empty;
    empty.name = "items";

    seedRow("t1", "hello", 5, 0, 0.0);

    SQLitePreparedStatements ps(*conn);
    auto stmt_res = ps.executeSelect("SELECT MAX(name) AS max_name FROM items", {});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(empty, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    ASSERT_EQ(rows.value().size(), 1u);
    EXPECT_EQ(rows.value()[0]["max_name"].get<std::string>(), "hello");
}

/** Covers sqlite_result_parser.cpp:59 — SQLITE_NULL in columnToJson for a schema field */
TEST_F(SQLiteInternalsFixture, ResultParser_ColumnToJson_NullColumn_ReturnsNull) {
    seedRow("null1", "test", 0, 0, 0.0);
    // Set score to NULL via prepared update
    SQLitePreparedStatements ps(*conn);
    ps.executeUpdate("UPDATE items SET score = NULL WHERE id = ?", {"null1"});

    auto stmt_res = ps.executeSelect("SELECT * FROM items WHERE id = ?", {"null1"});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(schema, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    ASSERT_EQ(rows.value().size(), 1u);
    EXPECT_TRUE(rows.value()[0]["score"].is_null());
}

/** Covers sqlite_result_parser.cpp:61-63 — boolean field conversion (flag=1 → true) */
TEST_F(SQLiteInternalsFixture, ResultParser_ColumnToJson_BooleanField_ReturnsBool) {
    seedRow("bool1", "flagged", 0, 1, 0.0);

    SQLitePreparedStatements ps(*conn);
    auto stmt_res = ps.executeSelect("SELECT * FROM items WHERE id = ?", {"bool1"});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(schema, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    ASSERT_EQ(rows.value().size(), 1u);
    EXPECT_TRUE(rows.value()[0]["flag"].is_boolean());
    EXPECT_TRUE(rows.value()[0]["flag"].get<bool>());
}

/** Covers sqlite_result_parser.cpp:64-66 — integer field conversion */
TEST_F(SQLiteInternalsFixture, ResultParser_ColumnToJson_IntegerField_ReturnsInt64) {
    seedRow("int1", "scored", 99, 0, 0.0);

    SQLitePreparedStatements ps(*conn);
    auto stmt_res = ps.executeSelect("SELECT * FROM items WHERE id = ?", {"int1"});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(schema, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    ASSERT_EQ(rows.value().size(), 1u);
    EXPECT_EQ(rows.value()[0]["score"].get<int64_t>(), 99);
}

TEST_F(SQLiteInternalsFixture, ResultParser_ReadAllRows_Empty_ReturnsEmptyVector) {
    SQLitePreparedStatements ps(*conn);
    auto stmt_res = ps.executeSelect("SELECT * FROM items WHERE id = ?", {"no_such"});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(schema, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    EXPECT_EQ(rows.value().size(), 0u);
}

TEST_F(SQLiteInternalsFixture, ResultParser_ReadAllRows_MultipleRows) {
    seedRow("m1", "row1", 10, 0, 0.0);
    seedRow("m2", "row2", 20, 0, 0.0);
    seedRow("m3", "row3", 30, 0, 0.0);

    SQLitePreparedStatements ps(*conn);
    auto stmt_res = ps.executeSelect("SELECT * FROM items ORDER BY score", {});
    ASSERT_TRUE(stmt_res.hasValue());

    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(schema, stmt_res.value());
    ASSERT_TRUE(rows.hasValue());
    EXPECT_EQ(rows.value().size(), 3u);
    EXPECT_EQ(rows.value()[0]["name"].get<std::string>(), "row1");
    EXPECT_EQ(rows.value()[2]["name"].get<std::string>(), "row3");
}

// =============================================================================
// SQLiteAdapter — schema migration (ALTER TABLE ADD COLUMN)
// =============================================================================

/**
 * Covers sqlite_adapter_schema.cpp:159-170 — migrateTable adds a new column
 * when the existing table lacks a field declared in the entity schema.
 *
 * Creates a SQLite file with a partial table, then constructs a SQLiteAdapter
 * whose schema has an extra field. The adapter's createTables() → migrateTable()
 * issues ALTER TABLE ADD COLUMN to bring the schema up to date.
 */
TEST(SQLiteAdapterMigrationTest, MigrateTable_AddsNewColumn) {
    namespace fs = std::filesystem;

    const auto tmp        = fs::temp_directory_path();
    const auto db_path    = tmp / "dbal_migrate_test_unique.db";
    const auto schema_dir = tmp / "dbal_migrate_schema_unique";

    fs::remove(db_path);
    fs::remove_all(schema_dir);
    fs::create_directories(schema_dir);

    // 1. Create file DB with incomplete table (only 'id' column)
    {
        SQLiteConnectionManager cm(db_path.string());
        cm.executePragma("CREATE TABLE MigrateTest (id TEXT PRIMARY KEY)");
        cm.close();
    }

    // 2. Write entity schema that also declares 'label TEXT'
    {
        std::ofstream f(schema_dir / "MigrateTest.json");
        f << R"({
  "entity": "MigrateTest",
  "fields": {
    "id":    {"type": "uuid",   "primary": true, "required": true},
    "label": {"type": "string", "nullable": true}
  }
})";
    }

    // 3. Set env vars
    const char* saved_schema   = std::getenv("DBAL_SCHEMA_DIR");
    const char* saved_template = std::getenv("DBAL_TEMPLATE_DIR");
    setenv("DBAL_SCHEMA_DIR",   schema_dir.string().c_str(), 1);
    setenv("DBAL_TEMPLATE_DIR", DBAL_TEST_TEMPLATE_DIR,      1);

    // 4. Construct adapter — triggers createTables() → migrateTable() → ADD COLUMN
    bool construction_ok = false;
    try {
        dbal::adapters::sqlite::SQLiteAdapter adapter(db_path.string());
        construction_ok = true;
        adapter.close();
    } catch (const std::exception& ex) {
        ADD_FAILURE() << "SQLiteAdapter construction threw: " << ex.what();
    }
    EXPECT_TRUE(construction_ok);

    // 5. Verify 'label' column was added
    if (construction_ok) {
        SQLiteConnectionManager verify(db_path.string());
        sqlite3_stmt* stmt = nullptr;
        sqlite3_prepare_v2(verify.getHandle(),
                           R"(PRAGMA table_info("MigrateTest"))",
                           -1, &stmt, nullptr);
        std::set<std::string> cols;
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            const char* cn = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
            if (cn) cols.insert(cn);
        }
        sqlite3_finalize(stmt);
        verify.close();
        EXPECT_TRUE(cols.count("label") > 0) << "'label' column missing after migration";
    }

    // 6. Restore env vars and cleanup
    if (saved_schema)   setenv("DBAL_SCHEMA_DIR",   saved_schema,   1);
    else                unsetenv("DBAL_SCHEMA_DIR");
    if (saved_template) setenv("DBAL_TEMPLATE_DIR", saved_template, 1);
    else                unsetenv("DBAL_TEMPLATE_DIR");
    fs::remove(db_path);
    fs::remove_all(schema_dir);
}

// =============================================================================
// SQLiteAdapter — enum field branch + supportsNativeTransactions
// =============================================================================

/**
 * Covers sqlite_adapter_schema.cpp:71-72 — entityDefToSchema sets ef.enumValues
 * when the entity field has non-empty enum_values (loaded from "values" array in JSON).
 * Also covers sqlite_adapter.hpp:80 — supportsNativeTransactions() returns true.
 */
TEST(SQLiteAdapterSchemaTest, EntityWithEnumField_CoversEnumValuesBranch) {
    namespace fs = std::filesystem;

    const auto tmp        = fs::temp_directory_path();
    const auto db_path    = tmp / "dbal_enum_field_test.db";
    const auto schema_dir = tmp / "dbal_enum_schema_dir";

    fs::remove(db_path);
    fs::remove_all(schema_dir);
    fs::create_directories(schema_dir);

    // Write an entity with an enum field (populates enum_values in SchemaLoader)
    {
        std::ofstream f(schema_dir / "EnumEntity.json");
        f << R"({
  "entity": "EnumEntity",
  "fields": {
    "id":     {"type": "uuid",   "primary": true, "required": true},
    "status": {"type": "enum",   "values": ["active", "inactive", "pending"]}
  }
})";
    }

    const char* saved_schema   = std::getenv("DBAL_SCHEMA_DIR");
    const char* saved_template = std::getenv("DBAL_TEMPLATE_DIR");
    setenv("DBAL_SCHEMA_DIR",   schema_dir.string().c_str(), 1);
    setenv("DBAL_TEMPLATE_DIR", DBAL_TEST_TEMPLATE_DIR,      1);

    bool ok = false;
    try {
        dbal::adapters::sqlite::SQLiteAdapter adapter(db_path.string());
        // Covers sqlite_adapter.hpp:80 — supportsNativeTransactions()
        EXPECT_TRUE(adapter.supportsNativeTransactions());
        ok = true;
        adapter.close();
    } catch (const std::exception& ex) {
        ADD_FAILURE() << "SQLiteAdapter threw: " << ex.what();
    }
    EXPECT_TRUE(ok);

    if (saved_schema)   setenv("DBAL_SCHEMA_DIR",   saved_schema,   1);
    else                unsetenv("DBAL_SCHEMA_DIR");
    if (saved_template) setenv("DBAL_TEMPLATE_DIR", saved_template, 1);
    else                unsetenv("DBAL_TEMPLATE_DIR");
    fs::remove(db_path);
    fs::remove_all(schema_dir);
}

// =============================================================================
// SQLitePreparedStatements — uncovered error paths
// =============================================================================

/** Covers prepareLocked:20 — null db handle returns error immediately */
TEST_F(SQLiteInternalsFixture, PreparedStatements_Prepare_NullHandle_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    conn->close();  // sets internal db_ to nullptr
    auto result = ps.prepare("SELECT 1");
    EXPECT_FALSE(result.hasValue());
}

/** Covers executeInsert:59 — prepare failure (invalid SQL) */
TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteInsert_InvalidSql_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeInsert("NOT VALID SQL !!! ???", {});
    EXPECT_FALSE(result.hasValue());
}

/** Covers bindParameters:47, executeInsert:67-68 — bind failure via SQLITE_RANGE */
TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteInsert_TooManyValues_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    // SQL has 1 '?', but 2 values: second bind returns SQLITE_RANGE
    auto result = ps.executeInsert(
        "INSERT INTO items (id) VALUES (?)",
        {"row_bind_fail", "extra_triggers_range_error"});
    EXPECT_FALSE(result.hasValue());
}

/** Covers executeSelect:98-99 — bind failure */
TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteSelect_TooManyValues_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeSelect(
        "SELECT * FROM items WHERE id = ?",
        {"x", "extra_triggers_range_error"});
    EXPECT_FALSE(result.hasValue());
}

/** Covers executeUpdate:120-121 — bind failure */
TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteUpdate_TooManyValues_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    // 2 '?'s but 3 values
    auto result = ps.executeUpdate(
        "UPDATE items SET name = ? WHERE id = ?",
        {"new_name", "id_val", "extra_triggers_range_error"});
    EXPECT_FALSE(result.hasValue());
}

/** Covers executeDelete:142 — prepare failure (invalid SQL) */
TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteDelete_InvalidSql_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeDelete("INVALID DELETE !!! ???", {});
    EXPECT_FALSE(result.hasValue());
}

/** Covers executeDelete:150-151 — bind failure */
TEST_F(SQLiteInternalsFixture, PreparedStatements_ExecuteDelete_TooManyValues_ReturnsError) {
    SQLitePreparedStatements ps(*conn);
    auto result = ps.executeDelete(
        "DELETE FROM items WHERE id = ?",
        {"id_val", "extra_triggers_range_error"});
    EXPECT_FALSE(result.hasValue());
}

// =============================================================================
// SQLiteResultParser — additional error paths
// =============================================================================

/** Covers readAllRows:89-93 — step returns SQLITE_INTERRUPT (not SQLITE_DONE) */
/** Covers readAllRows lines 88-93 — step returns SQLITE_MISUSE (not DONE), triggers error path.
 *  sqlite3_step(nullptr) → SQLITE_MISUSE; sqlite3_finalize(nullptr) → no-op (safe). */
TEST_F(SQLiteInternalsFixture, ResultParser_ReadAllRows_NullStmt_ReturnsError) {
    SQLiteResultParser parser(*conn);
    auto rows = parser.readAllRows(schema, nullptr);
    EXPECT_FALSE(rows.hasValue());
}

/** Covers readInsertedRecord:112-116 — prepare fails (table does not exist) */
TEST_F(SQLiteInternalsFixture, ResultParser_ReadInsertedRecord_NonexistentTable_ReturnsError) {
    EntitySchema bad_schema = makeItemsSchema();
    bad_schema.name = "NoSuchTableXyzAbc";  // not in :memory: DB

    SQLiteResultParser parser(*conn);
    auto result = parser.readInsertedRecord(bad_schema, 1);
    EXPECT_FALSE(result.hasValue());
}

/** Covers readInsertedRecord:123-124 — rowid not found → step returns SQLITE_DONE */
TEST_F(SQLiteInternalsFixture, ResultParser_ReadInsertedRecord_NonexistentRowid_ReturnsError) {
    SQLiteResultParser parser(*conn);
    // rowid 99999 doesn't exist → sqlite3_step returns SQLITE_DONE
    auto result = parser.readInsertedRecord(schema, 99999LL);
    EXPECT_FALSE(result.hasValue());
}
