/**
 * DI + Template Method tests for SqlAdapter.
 *
 * Design:
 *   TestSqlAdapter subclasses SqlAdapter and overrides the protected virtual
 *   runQuery / runNonQuery methods (Template Method pattern). This exercises
 *   all error/branch paths without a real database connection.
 *
 *   BaseTestSqlAdapter does NOT override those methods, so any CRUD call falls
 *   through to the base throw — covering helpers.cpp:23-33.
 *
 * Files covered:
 *   sql_adapter_crud.cpp    — unknown entity, empty-row, SqlError catch paths
 *   sql_adapter_helpers.cpp — rowToJson, jsonValueToString, mapSqlError,
 *                             buildFieldList COALESCE, coalesceDefault
 *   sql_adapter_bulk.cpp    — createMany (empty/error), updateMany (no fields)
 *   sql_adapter_query.cpp   — findFirst, findByField, upsert
 *   sql_adapter_schema.cpp  — loadSchemas catch, createTables catch, relations
 *   sqlite_connection_manager.cpp — executePragma null-db / invalid-sql
 */

#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <algorithm>
#include <cstdlib>

#ifndef DBAL_TEST_TEMPLATE_DIR
#  define DBAL_TEST_TEMPLATE_DIR "/dbal/templates/sql"
#endif

#include "sql/sql_adapter_base.hpp"
#include "sqlite/sqlite_connection_manager.hpp"

using dbal::adapters::EntitySchema;
using dbal::adapters::EntityField;
using dbal::adapters::RelationDef;
using dbal::adapters::Json;
using dbal::adapters::sql::SqlAdapter;
using dbal::adapters::sql::SqlConnection;
using dbal::adapters::sql::SqlConnectionConfig;
using dbal::adapters::sql::SqlError;
using dbal::adapters::sql::SqlRow;
using dbal::adapters::sql::SqlParam;
using dbal::adapters::sql::Dialect;
using dbal::ListOptions;
using dbal::adapters::sqlite::SQLiteConnectionManager;

// ─── TestSqlAdapter ───────────────────────────────────────────────────────────
//
// Template Method DI subclass. Injects controlled query results or SqlErrors
// without a real DB connection. Exposes protected helpers as public wrappers.
//
class TestSqlAdapter : public SqlAdapter {
public:
    explicit TestSqlAdapter(Dialect d = Dialect::Postgres)
        : SqlAdapter(stubCfg(), d) {}

    void setupWithSchemaDir(const std::string& dir) {
        setenv("DBAL_SCHEMA_DIR", dir.c_str(), 1);
        loadSchemas();  // protected
    }

    // Expose protected schema methods for catch-path tests
    void callLoadSchemas()  { loadSchemas(); }
    void callCreateTables() { createTables(); }

    // ── Injection API ─────────────────────────────────────────────────────
    void injectQueryError(SqlError::Code code, const std::string& msg = "") {
        qi_ = true;  qe_ = {code, msg};
    }
    void injectNonQueryError(SqlError::Code code, const std::string& msg = "") {
        ni_ = true;  ne_ = {code, msg};
    }
    void setQueryRows(std::vector<SqlRow> rows) { qi_ = false; qr_ = std::move(rows); }
    void setNonQueryCount(int n)                { ni_ = false; nc_ = n; }
    void resetInjection() {
        qi_ = ni_ = qi_std_ = false; qr_.clear(); nc_ = 0;
        ni_count_ = 0; ni_throw_at_ = -1; ni_std_throw_at_ = -1;
    }
    // Per-call injection: throw SqlError at a specific runNonQuery call index
    void throwNonQueryAtCall(int call, SqlError::Code code = SqlError::Code::Unknown,
                             const std::string& msg = "injected") {
        ni_throw_at_ = call; ni_throw_at_code_ = code; ni_throw_at_msg_ = msg;
        ni_ = false;
    }
    // Per-call injection: throw std::runtime_error at a specific runNonQuery call
    void throwNonQueryStdAtCall(int call, const std::string& msg = "std injected") {
        ni_std_throw_at_ = call; ni_std_throw_at_msg_ = msg; ni_ = false;
    }
    // Inject std::runtime_error from runQuery (covers migrateTable std::exception catch)
    void injectQueryStdException(const std::string& msg = "test error") {
        qi_std_ = true; qi_std_msg_ = msg; qi_ = false;
    }

    // ── Protected method wrappers ─────────────────────────────────────────
    Json callRowToJson(const EntitySchema& s, const SqlRow& r) {
        return rowToJson(s, r);
    }
    static std::string callJsonValueToString(const Json& v) {
        return jsonValueToString(v);
    }

protected:
    std::vector<SqlRow> runQuery(SqlConnection*,
                                 const std::string&,
                                 const std::vector<SqlParam>&) override {
        if (qi_std_) throw std::runtime_error(qi_std_msg_);
        if (qi_) throw qe_;
        return qr_;
    }
    int runNonQuery(SqlConnection*,
                    const std::string&,
                    const std::vector<SqlParam>&) override {
        int call = ni_count_++;
        if (ni_throw_at_ >= 0 && call == ni_throw_at_)
            throw SqlError{ni_throw_at_code_, ni_throw_at_msg_};
        if (ni_std_throw_at_ >= 0 && call == ni_std_throw_at_)
            throw std::runtime_error(ni_std_throw_at_msg_);
        if (ni_) throw ne_;
        return nc_;
    }

private:
    static SqlConnectionConfig stubCfg() {
        SqlConnectionConfig c;
        c.host = "localhost"; c.port = 5432;
        c.database = "test"; c.user = "t"; c.password = "p";
        return c;
    }

    bool           qi_ = false, ni_ = false, qi_std_ = false;
    std::string    qi_std_msg_;
    SqlError       qe_ = {SqlError::Code::Unknown, ""};
    SqlError       ne_ = {SqlError::Code::Unknown, ""};
    std::vector<SqlRow> qr_;
    int            nc_ = 0;
    int            ni_count_ = 0;
    int            ni_throw_at_ = -1;
    SqlError::Code ni_throw_at_code_ = SqlError::Code::Unknown;
    std::string    ni_throw_at_msg_;
    int            ni_std_throw_at_ = -1;
    std::string    ni_std_throw_at_msg_;
};

// ─── BaseTestSqlAdapter ───────────────────────────────────────────────────────
//
// Does NOT override runQuery / runNonQuery — CRUD calls hit the base throw at
// helpers.cpp:23-33, covering the "not implemented" default implementation.
//
class BaseTestSqlAdapter : public SqlAdapter {
public:
    explicit BaseTestSqlAdapter()
        : SqlAdapter(stubCfg(), Dialect::Postgres) {}

    void setupWithSchemaDir(const std::string& dir) {
        setenv("DBAL_SCHEMA_DIR", dir.c_str(), 1);
        loadSchemas();
    }

private:
    static SqlConnectionConfig stubCfg() {
        SqlConnectionConfig c;
        c.host = "localhost"; c.port = 5432;
        c.database = "test"; c.user = "t"; c.password = "p";
        return c;
    }
};

// ─── Widget schema JSON ───────────────────────────────────────────────────────
//
// Covers buildFieldList COALESCE (nullable + default fields) and coalesceDefault
// branches: boolean true/false, number non-empty/empty-string, string/quoted.
//
static const char WIDGET_JSON[] = R"({
  "entity": "Widget",
  "fields": {
    "id":       {"type": "uuid",    "primary": true, "required": true},
    "name":     {"type": "string",  "required": true},
    "active":   {"type": "boolean", "nullable": true, "default": true},
    "inactive": {"type": "boolean", "nullable": true, "default": false},
    "count":    {"type": "number",  "nullable": true, "default": 0},
    "zeroStr":  {"type": "number",  "nullable": true, "default": ""},
    "tag":      {"type": "string",  "nullable": true, "default": "none"},
    "quoted":   {"type": "string",  "nullable": true, "default": "it's"},
    "bio":      {"type": "string",  "optional": true}
  },
  "relations": {
    "items": {"type": "has-many", "entity": "Item", "foreign_key": "widgetId"}
  }
})";

// Entity with a non-unique index on "name" — exercises CREATE INDEX + migrateTable paths.
static const char WIDGET_INDEXED_JSON[] = R"({
  "entity": "WidgetIdx",
  "fields": {
    "id":   {"type": "uuid",   "primary": true, "required": true},
    "name": {"type": "string", "required": true}
  },
  "indexes": [
    {"fields": ["name"], "unique": false}
  ]
})";

// ─── Fixture ──────────────────────────────────────────────────────────────────

class SqlAdapterDiFixture : public ::testing::Test {
protected:
    std::filesystem::path dir_;
    TestSqlAdapter        adapter_;
    TestSqlAdapter        mysql_{Dialect::MySQL};

    void SetUp() override {
        dir_ = std::filesystem::temp_directory_path() / "dbal_di_test";
        std::filesystem::remove_all(dir_);
        std::filesystem::create_directories(dir_);
        std::ofstream(dir_ / "Widget.json") << WIDGET_JSON;
        adapter_.setupWithSchemaDir(dir_.string());
        mysql_.setupWithSchemaDir(dir_.string());
    }

    void TearDown() override {
        unsetenv("DBAL_SCHEMA_DIR");
        std::filesystem::remove_all(dir_);
    }

    // Full Widget row with all columns populated
    static SqlRow makeRow(const std::string& id, const std::string& name,
                          const std::string& active = "t") {
        SqlRow r;
        r.columns = {{"id", id}, {"name", name}, {"active", active},
                     {"inactive", "f"}, {"count", "5"}, {"zeroStr", ""},
                     {"tag", "blue"}, {"quoted", "ok"}, {"bio", ""}};
        return r;
    }
};

// ─── SqlAdapterCreateTablesFixture ───────────────────────────────────────────
//
// Writes WIDGET_INDEXED_JSON to a temp dir and sets DBAL_SCHEMA_DIR +
// DBAL_TEMPLATE_DIR so callCreateTables() runs the full path.
// WidgetIdx has one non-unique index → runNonQuery call order:
//   call 0 : CREATE TABLE "WidgetIdx"
//   call 1 : CREATE INDEX on "name"
//   call 2+: ALTER TABLE per column (migrateTable, empty existing_cols)
//
class SqlAdapterCreateTablesFixture : public ::testing::Test {
protected:
    std::filesystem::path schema_dir_;
    TestSqlAdapter        adapter_;

    void SetUp() override {
        schema_dir_ = std::filesystem::temp_directory_path() / "dbal_ct_test";
        std::filesystem::remove_all(schema_dir_);
        std::filesystem::create_directories(schema_dir_);
        std::ofstream(schema_dir_ / "WidgetIdx.json") << WIDGET_INDEXED_JSON;
        setenv("DBAL_SCHEMA_DIR",   schema_dir_.string().c_str(), 1);
        setenv("DBAL_TEMPLATE_DIR", DBAL_TEST_TEMPLATE_DIR,       1);
    }

    void TearDown() override {
        unsetenv("DBAL_SCHEMA_DIR");
        unsetenv("DBAL_TEMPLATE_DIR");
        std::filesystem::remove_all(schema_dir_);
        adapter_.resetInjection();
    }
};

// =============================================================================
// Group 1: No schemas → unknown entity path (crud/bulk/query)
// =============================================================================

TEST(SqlAdapterNoSchema, Create_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.create("Ghost", Json{{"name","x"}}).hasValue());
}
TEST(SqlAdapterNoSchema, Read_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.read("Ghost", "id1").hasValue());
}
TEST(SqlAdapterNoSchema, Update_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.update("Ghost", "id1", Json{}).hasValue());
}
TEST(SqlAdapterNoSchema, Remove_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.remove("Ghost", "id1").hasValue());
}
TEST(SqlAdapterNoSchema, List_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.list("Ghost", ListOptions{}).hasValue());
}
TEST(SqlAdapterNoSchema, FindFirst_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.findFirst("Ghost", Json{}).hasValue());
}
TEST(SqlAdapterNoSchema, CreateMany_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.createMany("Ghost", {Json{{"name","x"}}}).hasValue());
}
TEST(SqlAdapterNoSchema, UpdateMany_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.updateMany("Ghost", Json{}, Json{{"name","x"}}).hasValue());
}
TEST(SqlAdapterNoSchema, DeleteMany_UnknownEntity) {
    TestSqlAdapter a;
    EXPECT_FALSE(a.deleteMany("Ghost", Json{}).hasValue());
}
/** Covers sql_adapter_base.hpp:71 — supportsNativeTransactions override */
TEST(SqlAdapterNoSchema, SupportsNativeTransactions_ReturnsTrue) {
    TestSqlAdapter a;
    EXPECT_TRUE(a.supportsNativeTransactions());
}

// =============================================================================
// Group 2: mapSqlError all branches (helpers.cpp:231-243)
// Triggered by injecting SqlError into create() — any CRUD op would work.
// =============================================================================

TEST_F(SqlAdapterDiFixture, MapSqlError_UniqueViolation) {
    adapter_.injectQueryError(SqlError::Code::UniqueViolation, "dup key");
    EXPECT_FALSE(adapter_.create("Widget", Json{{"name","x"}}).hasValue());
}
TEST_F(SqlAdapterDiFixture, MapSqlError_ForeignKeyViolation) {
    adapter_.injectQueryError(SqlError::Code::ForeignKeyViolation, "fk err");
    EXPECT_FALSE(adapter_.create("Widget", Json{{"name","x"}}).hasValue());
}
TEST_F(SqlAdapterDiFixture, MapSqlError_NotFound) {
    adapter_.injectQueryError(SqlError::Code::NotFound, "not found");
    EXPECT_FALSE(adapter_.create("Widget", Json{{"name","x"}}).hasValue());
}
TEST_F(SqlAdapterDiFixture, MapSqlError_Timeout) {
    adapter_.injectQueryError(SqlError::Code::Timeout, "timed out");
    EXPECT_FALSE(adapter_.create("Widget", Json{{"name","x"}}).hasValue());
}
TEST_F(SqlAdapterDiFixture, MapSqlError_ConnectionLost) {
    adapter_.injectQueryError(SqlError::Code::ConnectionLost, "conn lost");
    EXPECT_FALSE(adapter_.create("Widget", Json{{"name","x"}}).hasValue());
}
TEST_F(SqlAdapterDiFixture, MapSqlError_Unknown) {
    adapter_.injectQueryError(SqlError::Code::Unknown, "unknown err");
    EXPECT_FALSE(adapter_.create("Widget", Json{{"name","x"}}).hasValue());
}

// =============================================================================
// Group 3: Empty-row and affected==0 paths
// =============================================================================

/** Covers crud.cpp:31 — create returns empty rows → Error::internal */
TEST_F(SqlAdapterDiFixture, Create_EmptyRows_ReturnsError) {
    adapter_.setQueryRows({});
    EXPECT_FALSE(adapter_.create("Widget", Json{{"name","x"}}).hasValue());
}
/** Covers crud.cpp:57-58 — read returns empty rows → Error::notFound */
TEST_F(SqlAdapterDiFixture, Read_EmptyRows_ReturnsNotFound) {
    adapter_.setQueryRows({});
    EXPECT_FALSE(adapter_.read("Widget", "id1").hasValue());
}
/** Covers crud.cpp:84-85 — update returns empty rows → Error::notFound */
TEST_F(SqlAdapterDiFixture, Update_EmptyRows_ReturnsNotFound) {
    adapter_.setQueryRows({});
    EXPECT_FALSE(adapter_.update("Widget", "id1", Json{{"name","y"}}).hasValue());
}
/** Covers crud.cpp:111-112 — remove affected==0 → Error::notFound */
TEST_F(SqlAdapterDiFixture, Remove_AffectedZero_ReturnsNotFound) {
    adapter_.setNonQueryCount(0);
    EXPECT_FALSE(adapter_.remove("Widget", "id1").hasValue());
}
TEST_F(SqlAdapterDiFixture, Remove_AffectedOne_ReturnsTrue) {
    adapter_.setNonQueryCount(1);
    auto r = adapter_.remove("Widget", "id1");
    ASSERT_TRUE(r.hasValue());
    EXPECT_TRUE(r.value());
}

// =============================================================================
// Group 4: SqlError catch in remaining CRUD / query / bulk
// =============================================================================

TEST_F(SqlAdapterDiFixture, Read_SqlError_ReturnsError) {
    adapter_.injectQueryError(SqlError::Code::Unknown, "read err");
    EXPECT_FALSE(adapter_.read("Widget", "id1").hasValue());
}
TEST_F(SqlAdapterDiFixture, Update_SqlError_ReturnsError) {
    adapter_.injectQueryError(SqlError::Code::Unknown, "upd err");
    EXPECT_FALSE(adapter_.update("Widget", "id1", Json{{"name","y"}}).hasValue());
}
TEST_F(SqlAdapterDiFixture, Remove_SqlError_ReturnsError) {
    adapter_.injectNonQueryError(SqlError::Code::Unknown, "del err");
    EXPECT_FALSE(adapter_.remove("Widget", "id1").hasValue());
}
/** Covers crud.cpp:267-270 — standard list SqlError */
TEST_F(SqlAdapterDiFixture, List_SqlError_ReturnsError) {
    adapter_.injectQueryError(SqlError::Code::Unknown, "list err");
    EXPECT_FALSE(adapter_.list("Widget", ListOptions{}).hasValue());
}
/** Covers crud.cpp:193-197 — aggregation path SqlError */
TEST_F(SqlAdapterDiFixture, List_AggregationSqlError_ReturnsError) {
    adapter_.injectQueryError(SqlError::Code::Unknown, "agg err");
    ListOptions opts;
    opts.aggregates.push_back({dbal::AggFunc::Count, "*", "cnt"});
    EXPECT_FALSE(adapter_.list("Widget", opts).hasValue());
}
TEST_F(SqlAdapterDiFixture, FindFirst_SqlError_ReturnsError) {
    adapter_.injectQueryError(SqlError::Code::Unknown, "ff err");
    EXPECT_FALSE(adapter_.findFirst("Widget", Json{}).hasValue());
}
TEST_F(SqlAdapterDiFixture, DeleteMany_SqlError_ReturnsError) {
    adapter_.injectNonQueryError(SqlError::Code::Unknown, "dm err");
    EXPECT_FALSE(adapter_.deleteMany("Widget", Json{{"name","x"}}).hasValue());
}
TEST_F(SqlAdapterDiFixture, UpdateMany_SqlError_ReturnsError) {
    adapter_.injectNonQueryError(SqlError::Code::Unknown, "um err");
    EXPECT_FALSE(adapter_.updateMany("Widget", Json{}, Json{{"name","x"}}).hasValue());
}

// =============================================================================
// Group 5: rowToJson edge cases (helpers.cpp:183-205)
// Direct calls via callRowToJson with hand-built EntitySchema objects.
// =============================================================================

static EntitySchema singleFieldSchema(const std::string& name,
                                      const std::string& type,
                                      bool required = true,
                                      bool nullable  = false,
                                      const std::string& defaultVal = "") {
    EntitySchema s; s.name = "T";
    EntityField f; f.name = name; f.type = type;
    f.required = required; f.nullable = nullable;
    if (!defaultVal.empty()) f.defaultValue = defaultVal;
    s.fields.push_back(f);
    return s;
}

/** Covers helpers.cpp:184 — boolean "t" → true */
TEST_F(SqlAdapterDiFixture, RowToJson_Boolean_tValue_ReturnsTrue) {
    SqlRow r; r.columns["flag"] = "t";
    auto j = adapter_.callRowToJson(singleFieldSchema("flag","boolean"), r);
    EXPECT_TRUE(j["flag"].get<bool>());
}
TEST_F(SqlAdapterDiFixture, RowToJson_Boolean_FALSE_String_ReturnsFalse) {
    SqlRow r; r.columns["flag"] = "FALSE";
    auto j = adapter_.callRowToJson(singleFieldSchema("flag","boolean"), r);
    EXPECT_FALSE(j["flag"].get<bool>());
}
/** Covers helpers.cpp:189 — empty number → nullptr */
TEST_F(SqlAdapterDiFixture, RowToJson_Number_EmptyValue_ReturnsNull) {
    SqlRow r; r.columns["n"] = "";
    auto j = adapter_.callRowToJson(singleFieldSchema("n","number"), r);
    EXPECT_TRUE(j["n"].is_null());
}
TEST_F(SqlAdapterDiFixture, RowToJson_Number_NonEmpty_ReturnsInt) {
    SqlRow r; r.columns["n"] = "42";
    auto j = adapter_.callRowToJson(singleFieldSchema("n","number"), r);
    EXPECT_EQ(j["n"].get<int64_t>(), 42);
}
/** Covers helpers.cpp:194-195 — empty string, nullable+default → returns default */
TEST_F(SqlAdapterDiFixture, RowToJson_String_EmptyNullableDefault_ReturnsDefault) {
    auto schema = singleFieldSchema("v","string", /*required=*/false,
                                    /*nullable=*/true, "fallback");
    SqlRow r; r.columns["v"] = "";
    auto j = adapter_.callRowToJson(schema, r);
    EXPECT_EQ(j["v"].get<std::string>(), "fallback");
}
/** Covers helpers.cpp:196-197 — empty string, optional (not nullable) → nullptr */
TEST_F(SqlAdapterDiFixture, RowToJson_String_EmptyOptional_ReturnsNull) {
    auto schema = singleFieldSchema("v","string", /*required=*/false,
                                    /*nullable=*/false);
    SqlRow r; r.columns["v"] = "";
    auto j = adapter_.callRowToJson(schema, r);
    EXPECT_TRUE(j["v"].is_null());
}
/** Covers helpers.cpp:199 — empty string, required → "" */
TEST_F(SqlAdapterDiFixture, RowToJson_String_EmptyRequired_ReturnsEmptyString) {
    auto schema = singleFieldSchema("v","string", /*required=*/true);
    SqlRow r; r.columns["v"] = "";
    auto j = adapter_.callRowToJson(schema, r);
    EXPECT_EQ(j["v"].get<std::string>(), "");
}

// =============================================================================
// Group 6: jsonValueToString (helpers.cpp:209-221)
// =============================================================================

TEST_F(SqlAdapterDiFixture, JsonValueToString_Null)      { EXPECT_EQ(TestSqlAdapter::callJsonValueToString(Json(nullptr)), ""); }
TEST_F(SqlAdapterDiFixture, JsonValueToString_BoolTrue)  { EXPECT_EQ(TestSqlAdapter::callJsonValueToString(Json(true)),    "true"); }
TEST_F(SqlAdapterDiFixture, JsonValueToString_BoolFalse) { EXPECT_EQ(TestSqlAdapter::callJsonValueToString(Json(false)),   "false"); }
TEST_F(SqlAdapterDiFixture, JsonValueToString_Number)    { EXPECT_EQ(TestSqlAdapter::callJsonValueToString(Json(42)),      "42"); }
TEST_F(SqlAdapterDiFixture, JsonValueToString_String)    { EXPECT_EQ(TestSqlAdapter::callJsonValueToString(Json("hi")),   "hi"); }

// =============================================================================
// Group 7: buildFieldList COALESCE + coalesceDefault (helpers.cpp:113-146)
// Private methods — exercised indirectly via list() with Widget schema loaded.
// Widget has: active (bool/true), inactive (bool/false),
//             count (bigint/"0"), zeroStr (bigint/""),
//             tag (string/"none"), quoted (string/"it's")
// buildFieldList generates COALESCE for each; coalesceDefault handles the types.
// =============================================================================

/** Covers all coalesceDefault branches via buildFieldList called by list() */
TEST_F(SqlAdapterDiFixture, List_BuildFieldList_CoalesceDefault_AllBranches) {
    SqlRow count_row; count_row.columns["cnt"] = "1";
    SqlRow data_row = makeRow("id1", "Alice");
    adapter_.setQueryRows({count_row, data_row});
    auto r = adapter_.list("Widget", ListOptions{});
    EXPECT_TRUE(r.hasValue());
}
/** Same with MySQL dialect — quoteId uses backticks */
TEST_F(SqlAdapterDiFixture, List_MySQL_CoalesceDefault) {
    SqlRow count_row; count_row.columns["cnt"] = "0";
    mysql_.setQueryRows({count_row});
    EXPECT_TRUE(mysql_.list("Widget", ListOptions{}).hasValue());
}

// =============================================================================
// Group 8: buildUpdateSql empty setFragments (helpers.cpp:98-100)
// =============================================================================

/** Data has no fields matching Widget schema → setFragments empty → sql="" */
TEST_F(SqlAdapterDiFixture, Update_EmptySetFragments_ReturnsNotFound) {
    adapter_.setQueryRows({});
    auto r = adapter_.update("Widget", "id1", Json{{"noSuchField", "v"}});
    EXPECT_FALSE(r.hasValue());
}

// =============================================================================
// Group 9: Base runQuery / runNonQuery throw (helpers.cpp:23-33)
// BaseTestSqlAdapter has no override — hits default throw path.
// =============================================================================

/** Covers helpers.cpp:23-27 — base runQuery throws SqlError::Unknown */
TEST_F(SqlAdapterDiFixture, BaseAdapter_Create_HitsDefaultRunQuery) {
    BaseTestSqlAdapter base;
    base.setupWithSchemaDir(dir_.string());
    EXPECT_FALSE(base.create("Widget", Json{{"name","x"}}).hasValue());
}
/** Covers helpers.cpp:29-33 — base runNonQuery throws SqlError::Unknown */
TEST_F(SqlAdapterDiFixture, BaseAdapter_Remove_HitsDefaultRunNonQuery) {
    BaseTestSqlAdapter base;
    base.setupWithSchemaDir(dir_.string());
    EXPECT_FALSE(base.remove("Widget", "id1").hasValue());
}

// =============================================================================
// Group 10: Schema loading catch paths (schema.cpp:22-24, 92-94)
// =============================================================================

/** Covers schema.cpp:22-24 — DBAL_SCHEMA_DIR unset → catch → return */
TEST(SqlAdapterSchemaLoad, LoadSchemas_NoEnvVar_CatchPath) {
    unsetenv("DBAL_SCHEMA_DIR");
    TestSqlAdapter a;
    EXPECT_NO_THROW(a.callLoadSchemas());  // catch fires, no propagation
}

/** Covers schema.cpp:92-94 — DBAL_SCHEMA_DIR/DBAL_TEMPLATE_DIR unset → catch → return */
TEST(SqlAdapterSchemaLoad, CreateTables_NoEnvVars_CatchPath) {
    unsetenv("DBAL_SCHEMA_DIR");
    unsetenv("DBAL_TEMPLATE_DIR");
    TestSqlAdapter a;
    EXPECT_NO_THROW(a.callCreateTables());  // catch fires, no propagation
}

// =============================================================================
// Group 11: Relations propagation (schema.cpp:51-58)
// =============================================================================

TEST_F(SqlAdapterDiFixture, GetEntitySchema_Relations_Propagated) {
    auto r = adapter_.getEntitySchema("Widget");
    ASSERT_TRUE(r.hasValue());
    const auto& rels = r.value().relations;
    ASSERT_FALSE(rels.empty());
    EXPECT_EQ(rels[0].name, "items");
    EXPECT_EQ(rels[0].target_entity, "Item");
    EXPECT_EQ(rels[0].foreign_key, "widgetId");
    EXPECT_EQ(rels[0].type, "has-many");
}

// =============================================================================
// Group 12: Metadata operations
// =============================================================================

TEST_F(SqlAdapterDiFixture, GetAvailableEntities_ReturnsWidget) {
    auto r = adapter_.getAvailableEntities();
    ASSERT_TRUE(r.hasValue());
    const auto& names = r.value();
    EXPECT_TRUE(std::any_of(names.begin(), names.end(),
                            [](const auto& n){ return n == "Widget"; }));
}
TEST_F(SqlAdapterDiFixture, GetEntitySchema_Known_ReturnsSchema) {
    auto r = adapter_.getEntitySchema("Widget");
    ASSERT_TRUE(r.hasValue());
    EXPECT_EQ(r.value().name, "Widget");
}
TEST_F(SqlAdapterDiFixture, GetEntitySchema_Unknown_ReturnsError) {
    EXPECT_FALSE(adapter_.getEntitySchema("Ghost").hasValue());
}
TEST_F(SqlAdapterDiFixture, Close_IsNoOp) {
    EXPECT_NO_THROW(adapter_.close());
}

// =============================================================================
// Group 13: Bulk operations
// =============================================================================

/** Covers bulk.cpp:10-11 — empty records → return 0 immediately */
TEST_F(SqlAdapterDiFixture, CreateMany_EmptyRecords_ReturnsZero) {
    auto r = adapter_.createMany("Widget", {});
    ASSERT_TRUE(r.hasValue());
    EXPECT_EQ(r.value(), 0);
}
TEST_F(SqlAdapterDiFixture, CreateMany_WithRecord_Success) {
    adapter_.setNonQueryCount(1);
    auto r = adapter_.createMany("Widget", {Json{{"name","x"}}});
    ASSERT_TRUE(r.hasValue());
    EXPECT_EQ(r.value(), 1);
}
/** Covers bulk.cpp:39-43 — executeNonQuery throws → rollback → error */
TEST_F(SqlAdapterDiFixture, CreateMany_NonQueryError_RollsBackAndReturnsError) {
    adapter_.injectNonQueryError(SqlError::Code::UniqueViolation, "dup");
    EXPECT_FALSE(adapter_.createMany("Widget", {Json{{"name","x"}}}).hasValue());
}
/** Covers bulk.cpp:83-84 — no matching fields → validationError */
TEST_F(SqlAdapterDiFixture, UpdateMany_NoMatchingFields_ReturnsError) {
    auto r = adapter_.updateMany("Widget", Json{}, Json{{"noSuchField","v"}});
    EXPECT_FALSE(r.hasValue());
}
TEST_F(SqlAdapterDiFixture, UpdateMany_Success) {
    adapter_.setNonQueryCount(2);
    auto r = adapter_.updateMany("Widget", Json{}, Json{{"name","y"}});
    ASSERT_TRUE(r.hasValue());
    EXPECT_EQ(r.value(), 2);
}
TEST_F(SqlAdapterDiFixture, DeleteMany_Success) {
    adapter_.setNonQueryCount(3);
    auto r = adapter_.deleteMany("Widget", Json{{"name","x"}});
    ASSERT_TRUE(r.hasValue());
    EXPECT_EQ(r.value(), 3);
}

// =============================================================================
// Group 14: Query operations
// =============================================================================

TEST_F(SqlAdapterDiFixture, FindFirst_EmptyRows_ReturnsNotFound) {
    adapter_.setQueryRows({});
    EXPECT_FALSE(adapter_.findFirst("Widget", Json{}).hasValue());
}
TEST_F(SqlAdapterDiFixture, FindFirst_WithRow_ReturnsJson) {
    adapter_.setQueryRows({makeRow("id1","Alice")});
    auto r = adapter_.findFirst("Widget", Json{});
    ASSERT_TRUE(r.hasValue());
    EXPECT_EQ(r.value()["id"].get<std::string>(), "id1");
}
TEST_F(SqlAdapterDiFixture, FindByField_ReturnsMatchingRow) {
    adapter_.setQueryRows({makeRow("id2","Bob")});
    auto r = adapter_.findByField("Widget", "name", Json("Bob"));
    ASSERT_TRUE(r.hasValue());
}
/** Covers query.cpp: upsert create path (findFirst returns notFound → create) */
TEST_F(SqlAdapterDiFixture, Upsert_NoExisting_CreatePathError) {
    // findByField → empty → create → also empty (same qr_) → error
    adapter_.setQueryRows({});
    auto r = adapter_.upsert("Widget", "name", Json("x"),
                              Json{{"name","x"}}, Json{{"name","z"}});
    EXPECT_FALSE(r.hasValue());  // create returns empty rows → error
}
/** Covers query.cpp: upsert update path (findFirst succeeds → update called) */
TEST_F(SqlAdapterDiFixture, Upsert_Existing_UpdatePath_ReturnsResult) {
    SqlRow row = makeRow("id1","Alice");
    adapter_.setQueryRows({row});  // findFirst AND update both get {row}
    auto r = adapter_.upsert("Widget", "name", Json("Alice"),
                              Json{{"name","Alice"}}, Json{{"name","Bob"}});
    EXPECT_TRUE(r.hasValue());
}

// =============================================================================
// Group 15: SQLiteConnectionManager executePragma paths
// (sqlite_connection_manager.cpp:85-87, 92-99)
// =============================================================================

/** Covers sqlite_connection_manager.cpp:85-87 — db_==null → Error::internal */
TEST(SQLiteConnMgrDi, ExecutePragma_NullDb_ReturnsError) {
    SQLiteConnectionManager mgr(":memory:");
    mgr.close();  // sets db_ = nullptr
    auto r = mgr.executePragma("PRAGMA foreign_keys = ON");
    EXPECT_FALSE(r.hasValue());
}
/** Covers sqlite_connection_manager.cpp:92-99 — sqlite3_exec fails → error */
TEST(SQLiteConnMgrDi, ExecutePragma_InvalidSql_ReturnsError) {
    SQLiteConnectionManager mgr(":memory:");
    auto r = mgr.executePragma("THIS IS NOT VALID SQL!!!");
    EXPECT_FALSE(r.hasValue());
}

// =============================================================================
// Group 16: createTables error paths (sql_adapter_schema.cpp:127-190)
// =============================================================================

/** Covers schema.cpp:127-129 — SqlError on CREATE TABLE re-thrown as runtime_error */
TEST_F(SqlAdapterCreateTablesFixture, CreateTables_SqlError_OnCreateTable_Throws) {
    adapter_.throwNonQueryAtCall(0);
    EXPECT_THROW(adapter_.callCreateTables(), std::runtime_error);
}

/** Covers schema.cpp:136-137 — SqlError on CREATE INDEX silently caught */
TEST_F(SqlAdapterCreateTablesFixture, CreateTables_IndexSqlError_SilentlyCaught) {
    adapter_.throwNonQueryAtCall(1);
    EXPECT_NO_THROW(adapter_.callCreateTables());
}

/** Covers schema.cpp:172-174 — migrateTable executeQuery throws → caught, returns */
TEST_F(SqlAdapterCreateTablesFixture, CreateTables_MigrateTable_QueryException_Caught) {
    adapter_.injectQueryStdException("inspect columns failed");
    EXPECT_NO_THROW(adapter_.callCreateTables());
}

/** Covers schema.cpp:177-183 — existing_cols empty → ALTER TABLE per field */
TEST_F(SqlAdapterCreateTablesFixture, CreateTables_MigrateTable_AllColumnsMissing_AddsColumns) {
    // runQuery returns empty rows (no existing columns) → all fields "missing"
    EXPECT_NO_THROW(adapter_.callCreateTables());
}

/** Covers schema.cpp:184-185 — ALTER TABLE SqlError caught and logged */
TEST_F(SqlAdapterCreateTablesFixture, CreateTables_MigrateTable_AlterSqlError_Caught) {
    // call 0=CREATE TABLE, 1=CREATE INDEX, 2=first ALTER TABLE → SqlError
    adapter_.throwNonQueryAtCall(2);
    EXPECT_NO_THROW(adapter_.callCreateTables());
}

/** Covers schema.cpp:186-187 — ALTER TABLE std::exception caught and logged */
TEST_F(SqlAdapterCreateTablesFixture, CreateTables_MigrateTable_AlterStdException_Caught) {
    adapter_.throwNonQueryStdAtCall(2);
    EXPECT_NO_THROW(adapter_.callCreateTables());
}

// =============================================================================
// Group 17: list() success paths (sql_adapter_crud.cpp:178-191, 230-231)
// =============================================================================

/** Covers crud.cpp:178-191 — aggregation path returns result items */
TEST_F(SqlAdapterDiFixture, List_Aggregation_Success_ReturnsItems) {
    SqlRow agg_row; agg_row.columns["cnt"] = "5";
    adapter_.setQueryRows({agg_row});
    ListOptions opts;
    opts.aggregates.push_back({dbal::AggFunc::Count, "*", "cnt"});
    auto r = adapter_.list("Widget", opts);
    ASSERT_TRUE(r.hasValue());
    EXPECT_EQ(r.value().items.size(), 1u);
}

/** Covers crud.cpp:230-231 — distinct=true prepends DISTINCT to SELECT field list */
TEST_F(SqlAdapterDiFixture, List_Distinct_ReturnsSuccess) {
    SqlRow count_row; count_row.columns["cnt"] = "1";
    SqlRow data_row = makeRow("id1", "Alice");
    adapter_.setQueryRows({count_row, data_row});
    ListOptions opts;
    opts.distinct = true;
    EXPECT_TRUE(adapter_.list("Widget", opts).hasValue());
}
