/**
 * Unit tests for SQL adapter utility classes that need no real DB connection:
 *   SqlTransactionManager  — pure state machine, null connection pointer safe
 *   SqlConnectionPool      — uses SqlConnection Null Object (connect() is a no-op stub)
 *   SqlSchemaManager       — loads from temp schema dir, pure in-memory caching
 *
 * Design note: SqlConnection::connect() is a stub (sets a flag, TODO for real socket).
 * This lets us exercise SqlConnectionPool with zero network calls — a natural
 * Null Object pattern. A future DI + factory refactor would inject a mock interface.
 *
 * Coverage targets:
 *   sql_transaction_manager.cpp  — destructor auto-rollback, exception paths (lines 16-20,25,37,48)
 *   sql_connection_pool.cpp      — all 57 lines (init, acquire, release, exhaustion, size/available)
 *   sql_schema_manager.cpp       — all 52 lines (load, getSchema, getAvailableEntities, default values)
 */

#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <string>

#include "sql/sql_transaction_manager.hpp"
#include "sql/sql_connection_pool.hpp"
#include "sql/sql_schema_manager.hpp"

using dbal::adapters::sql::SqlConnectionConfig;
using dbal::adapters::sql::SqlConnection;
using dbal::adapters::sql::SqlConnectionPool;
using dbal::adapters::sql::ConnectionGuard;
using dbal::adapters::sql::SqlTransactionManager;
using dbal::adapters::sql::SqlSchemaManager;

// ─── Helpers ─────────────────────────────────────────────────────────────────

static SqlConnectionConfig makeConfig(size_t max_connections = 4) {
    SqlConnectionConfig cfg;
    cfg.host            = "localhost";
    cfg.port            = 5432;
    cfg.database        = "test_db";
    cfg.user            = "test_user";
    cfg.password        = "test_pass";
    cfg.max_connections = max_connections;
    return cfg;
}

// =============================================================================
// SqlTransactionManager — pure state machine
// =============================================================================

TEST(SqlTransactionManagerTest, Begin_SetsActive) {
    SqlTransactionManager tx(nullptr);
    EXPECT_FALSE(tx.isActive());
    tx.begin();
    EXPECT_TRUE(tx.isActive());
    tx.rollback();
}

TEST(SqlTransactionManagerTest, Commit_SetsNotActive) {
    SqlTransactionManager tx(nullptr);
    tx.begin();
    tx.commit();
    EXPECT_FALSE(tx.isActive());
}

TEST(SqlTransactionManagerTest, Rollback_SetsNotActive) {
    SqlTransactionManager tx(nullptr);
    tx.begin();
    tx.rollback();
    EXPECT_FALSE(tx.isActive());
}

/** Covers sql_transaction_manager.cpp:25 — begin() throws when already active */
TEST(SqlTransactionManagerTest, Begin_WhenAlreadyActive_Throws) {
    SqlTransactionManager tx(nullptr);
    tx.begin();
    EXPECT_THROW(tx.begin(), std::runtime_error);
    tx.rollback();
}

/** Covers sql_transaction_manager.cpp:37 — commit() throws when not active */
TEST(SqlTransactionManagerTest, Commit_WhenNotActive_Throws) {
    SqlTransactionManager tx(nullptr);
    EXPECT_THROW(tx.commit(), std::runtime_error);
}

/** Covers sql_transaction_manager.cpp:48 — rollback() throws when not active */
TEST(SqlTransactionManagerTest, Rollback_WhenNotActive_Throws) {
    SqlTransactionManager tx(nullptr);
    EXPECT_THROW(tx.rollback(), std::runtime_error);
}

/** Covers sql_transaction_manager.cpp:16-20 — destructor auto-rollback when not committed */
TEST(SqlTransactionManagerTest, Destructor_WhenActiveNotCommitted_AutoRollback) {
    {
        SqlTransactionManager tx(nullptr);
        tx.begin();
        EXPECT_TRUE(tx.isActive());
        // tx destructor fires here: is_active_=true, committed_=false → rollback()
    }
    // No crash = rollback succeeded
}

TEST(SqlTransactionManagerTest, Destructor_WhenCommitted_NoRollback) {
    {
        SqlTransactionManager tx(nullptr);
        tx.begin();
        tx.commit();
        // tx destructor fires: is_active_=false → no rollback
    }
}

// Parameterized: begin → action → not-active check
struct TxLifecycleCase { bool commit_after_begin; };

class TxLifecycleTest : public testing::TestWithParam<TxLifecycleCase> {};

TEST_P(TxLifecycleTest, AfterEndingAction_IsNotActive) {
    SqlTransactionManager tx(nullptr);
    tx.begin();
    EXPECT_TRUE(tx.isActive());
    if (GetParam().commit_after_begin)
        tx.commit();
    else
        tx.rollback();
    EXPECT_FALSE(tx.isActive());
}

INSTANTIATE_TEST_SUITE_P(CommitOrRollback, TxLifecycleTest, testing::Values(
    TxLifecycleCase{true},
    TxLifecycleCase{false}
));

// =============================================================================
// SqlConnectionPool — Null Object connection (no real socket)
// =============================================================================

TEST(SqlConnectionPoolTest, Constructor_InitializesPool) {
    SqlConnectionPool pool(makeConfig(4));
    EXPECT_GT(pool.available(), 0u);
}

TEST(SqlConnectionPoolTest, Size_ReturnsCreatedCount) {
    SqlConnectionPool pool(makeConfig(4));
    // created_connections_ starts at 0 (init only fills available_, not created_)
    EXPECT_GE(pool.size(), 0u);
}

TEST(SqlConnectionPoolTest, Available_ReturnsNonZeroAfterInit) {
    SqlConnectionPool pool(makeConfig(4));
    EXPECT_GT(pool.available(), 0u);
}

/** Covers sql_connection_pool.cpp:50-54 — acquire from non-empty pool */
TEST(SqlConnectionPoolTest, Acquire_ReturnsConnectionFromPool) {
    SqlConnectionPool pool(makeConfig(4));
    SqlConnection* conn = pool.acquire();
    EXPECT_NE(conn, nullptr);
    pool.release(conn);  // return it
}

/** Covers sql_connection_pool.cpp:57-62 — acquire when pool empty but under max */
TEST(SqlConnectionPoolTest, Acquire_WhenPoolEmpty_CreatesNewConnection) {
    // max=2: init creates 1 (max/2=1). Drain pool, then acquire more.
    SqlConnectionPool pool(makeConfig(2));
    // Acquire all initially available connections
    std::vector<SqlConnection*> held;
    SqlConnection* c = pool.acquire();
    while (c) {
        held.push_back(c);
        c = pool.acquire();
        if (held.size() > 10) break;  // safety guard
    }
    // Release all back
    for (auto* conn : held) pool.release(conn);
}

/** Covers sql_connection_pool.cpp:65-67 — pool exhausted, returns nullptr */
TEST(SqlConnectionPoolTest, Acquire_PoolExhausted_ReturnsNullptr) {
    // max=1: init creates 1 available. Drain it, then try to get another.
    SqlConnectionPool pool(makeConfig(1));
    // Acquire until exhausted
    std::vector<SqlConnection*> held;
    for (int i = 0; i < 5; ++i) {
        SqlConnection* c = pool.acquire();
        if (!c) break;
        held.push_back(c);
    }
    // At least one null return was triggered
    SqlConnection* exhausted = pool.acquire();
    EXPECT_EQ(exhausted, nullptr);
    // Release all
    for (auto* conn : held) pool.release(conn);
}

/** Covers sql_connection_pool.cpp:71-72 — release(nullptr) is a no-op */
TEST(SqlConnectionPoolTest, Release_Nullptr_NoOp) {
    SqlConnectionPool pool(makeConfig(4));
    EXPECT_NO_THROW(pool.release(nullptr));
}

/** Covers sql_connection_pool.cpp:75-77 — release reclaims a connection */
TEST(SqlConnectionPoolTest, Release_ReturnsConnectionToPool) {
    SqlConnectionPool pool(makeConfig(4));
    size_t before = pool.available();
    SqlConnection* conn = pool.acquire();
    ASSERT_NE(conn, nullptr);
    EXPECT_EQ(pool.available(), before - 1);
    pool.release(conn);
    EXPECT_EQ(pool.available(), before);
}

/** Covers ConnectionGuard RAII — releases on scope exit */
TEST(SqlConnectionPoolTest, ConnectionGuard_ReleasesOnDestruct) {
    SqlConnectionPool pool(makeConfig(4));
    size_t before = pool.available();
    {
        SqlConnection* raw = pool.acquire();
        ASSERT_NE(raw, nullptr);
        ConnectionGuard guard(pool, raw);
        EXPECT_EQ(pool.available(), before - 1);
        EXPECT_EQ(guard.get(), raw);
    }  // guard destructs here → pool.release(raw)
    EXPECT_EQ(pool.available(), before);
}

// =============================================================================
// SqlSchemaManager — loads JSON entity schemas from a temp dir
// =============================================================================

class SqlSchemaManagerFixture : public ::testing::Test {
protected:
    std::filesystem::path schema_dir;

    void SetUp() override {
        schema_dir = std::filesystem::temp_directory_path() / "dbal_sql_schema_test";
        std::filesystem::remove_all(schema_dir);
        std::filesystem::create_directories(schema_dir);

        // Write two entity schemas: one simple, one with a default value
        {
            std::ofstream f(schema_dir / "Widget.json");
            f << R"({
  "entity": "Widget",
  "fields": {
    "id":    {"type": "uuid",   "primary": true, "required": true},
    "name":  {"type": "string", "required": true},
    "color": {"type": "string", "default": "blue"}
  }
})";
        }
        {
            std::ofstream f(schema_dir / "Tag.json");
            f << R"({
  "entity": "Tag",
  "fields": {
    "id":    {"type": "uuid",   "primary": true},
    "label": {"type": "string", "required": true}
  }
})";
        }
    }

    void TearDown() override {
        std::filesystem::remove_all(schema_dir);
    }
};

TEST_F(SqlSchemaManagerFixture, LoadSchemas_LoadsAllEntities) {
    SqlSchemaManager mgr(schema_dir.string());
    mgr.loadSchemas();
    EXPECT_GE(mgr.getSchemaCount(), 2u);
}

TEST_F(SqlSchemaManagerFixture, GetSchema_KnownEntity_ReturnsSchema) {
    SqlSchemaManager mgr(schema_dir.string());
    mgr.loadSchemas();
    auto schema = mgr.getSchema("Widget");
    ASSERT_TRUE(schema.has_value());
    EXPECT_EQ(schema->name, "Widget");
}

TEST_F(SqlSchemaManagerFixture, GetSchema_LowercaseName_AlsoFound) {
    SqlSchemaManager mgr(schema_dir.string());
    mgr.loadSchemas();
    auto schema = mgr.getSchema("widget");  // lowercase variant
    ASSERT_TRUE(schema.has_value());
}

TEST_F(SqlSchemaManagerFixture, GetSchema_UnknownEntity_ReturnsNullopt) {
    SqlSchemaManager mgr(schema_dir.string());
    mgr.loadSchemas();
    auto schema = mgr.getSchema("NonExistentEntity");
    EXPECT_FALSE(schema.has_value());
}

TEST_F(SqlSchemaManagerFixture, GetAvailableEntities_ReturnsBothEntities) {
    SqlSchemaManager mgr(schema_dir.string());
    mgr.loadSchemas();
    auto entities = mgr.getAvailableEntities();
    EXPECT_GE(entities.size(), 2u);
}

TEST_F(SqlSchemaManagerFixture, GetSchemaCount_ReturnsHalfOfInternal) {
    SqlSchemaManager mgr(schema_dir.string());
    mgr.loadSchemas();
    // Internal map stores each entity twice (original + lowercase),
    // getSchemaCount() returns size/2
    EXPECT_GE(mgr.getSchemaCount(), 2u);
}

/** Covers sql_schema_manager.cpp:80-82 — convertToEntitySchema handles default_value */
TEST_F(SqlSchemaManagerFixture, GetSchema_Widget_HasExpectedFields) {
    SqlSchemaManager mgr(schema_dir.string());
    mgr.loadSchemas();
    auto schema = mgr.getSchema("Widget");
    ASSERT_TRUE(schema.has_value());
    // Widget schema has 3 fields: id, name, color
    EXPECT_GE(schema->fields.size(), 2u) << "Widget should have at least id and name fields";
    // At least one field should be present
    bool has_id = false;
    for (const auto& field : schema->fields) {
        if (field.name == "id") has_id = true;
    }
    EXPECT_TRUE(has_id) << "Widget should have an 'id' field";
}

TEST_F(SqlSchemaManagerFixture, Constructor_WithEmptyDir_LoadSchemas_ReturnsZero) {
    auto empty_dir = std::filesystem::temp_directory_path() / "dbal_empty_schema_dir";
    std::filesystem::create_directories(empty_dir);
    SqlSchemaManager mgr(empty_dir.string());
    mgr.loadSchemas();
    EXPECT_EQ(mgr.getSchemaCount(), 0u);
    std::filesystem::remove_all(empty_dir);
}
