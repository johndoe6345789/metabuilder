/**
 * @file postgres_integration_test.cpp
 * @brief DBAL integration tests against a real PostgreSQL database.
 *
 * The PostgreSQL container is started in ContainerEnvironment (test_main.cpp)
 * alongside the MySQL container, both in parallel. Each test creates its own
 * adapter, seeds 8 rows, and cleans up after itself.
 * Ryuk cleans the container on process exit.
 *
 * Run locally:
 *   ctest -R dbal_integration_tests --output-on-failure
 */

#include <gtest/gtest.h>
#include <thread>
#include <vector>
#include <atomic>
#include "../../src/adapters/sql/postgres_adapter.hpp"
#include "../../src/adapters/sql/sql_connection.hpp"
#include "../../include/dbal/core/types.hpp"
#include "../helpers/integration_fixture.hpp"

using namespace dbal;
using namespace dbal::adapters::sql;
using namespace dbal_test;

// ─── Fixture ─────────────────────────────────────────────────────────────────

class PostgresIntegrationTest : public IntegrationFixture {
protected:
    void SetUp() override {
        if (!g_containers.postgres.valid) {
            GTEST_SKIP() << "PostgreSQL container unavailable: "
                         << g_containers.postgres.error_msg;
        }
        adapter_url_ = "postgresql://testuser:testpass@127.0.0.1:"
                       + std::to_string(g_containers.postgres.host_port) + "/dbal_test";
        IntegrationFixture::SetUp();
    }

    void TearDown() override {
        IntegrationFixture::TearDown();
    }

    std::unique_ptr<dbal::adapters::Adapter> createAdapter() override {
        ParsedUrl p = parseUrl(adapter_url_);
        SqlConnectionConfig cfg;
        cfg.host     = p.host;
        cfg.port     = p.port > 0 ? p.port : 5432;
        cfg.database = p.database;
        cfg.user     = p.user;
        cfg.password = p.password;
        return std::make_unique<PostgresAdapter>(cfg);
    }

    void dropTestTable() override {
        nlohmann::json empty_filter = nlohmann::json::object();
        adapter->deleteMany("TestItem", empty_filter);
    }
};

// ─── Same battery as SQLite (all operators) ───────────────────────────────────

TEST_F(PostgresIntegrationTest, Create_Read_Update_Delete) {
    nlohmann::json data;
    data["id"]       = "cc000000-0000-0000-0000-000000000001";
    data["title"]    = "pg-lifecycle";
    data["language"] = "postgres";
    data["score"]    = 99;
    data["tenantId"] = "tenantPG";
    data["createdAt"]= 1700099999LL;

    auto created = adapter->create("TestItem", data);
    ASSERT_TRUE(created.isOk()) << created.error().what();
    EXPECT_EQ(created.value()["title"].get<std::string>(), "pg-lifecycle");

    auto read = adapter->read("TestItem", "cc000000-0000-0000-0000-000000000001");
    ASSERT_TRUE(read.isOk());
    EXPECT_EQ(read.value()["language"].get<std::string>(), "postgres");

    nlohmann::json patch;
    patch["title"] = "pg-updated";
    auto updated = adapter->update("TestItem", "cc000000-0000-0000-0000-000000000001", patch);
    ASSERT_TRUE(updated.isOk());

    auto removed = adapter->remove("TestItem", "cc000000-0000-0000-0000-000000000001");
    ASSERT_TRUE(removed.isOk());

    auto gone = adapter->read("TestItem", "cc000000-0000-0000-0000-000000000001");
    EXPECT_FALSE(gone.isOk());
}

TEST_F(PostgresIntegrationTest, List_Eq_TenantA) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 6u);
}

TEST_F(PostgresIntegrationTest, List_Lt_Score) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"score", FilterOp::Lt, "25"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk());
    EXPECT_EQ(result.value().total, 2u);
}

TEST_F(PostgresIntegrationTest, List_Like_Prefix) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"title", FilterOp::Like, "py-%"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk());
    EXPECT_EQ(result.value().total, 3u);
}

TEST_F(PostgresIntegrationTest, List_ILike_NativePostgres) {
    // PostgreSQL uses native ILIKE (not LOWER workaround)
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::ILike, "PYTHON"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 3u);
}

TEST_F(PostgresIntegrationTest, List_IsNull_Language) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::IsNull, ""});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk());
    EXPECT_EQ(result.value().total, 1u);
}

TEST_F(PostgresIntegrationTest, List_In_Languages) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    FilterCondition cond;
    cond.field  = "language";
    cond.op     = FilterOp::In;
    cond.values = {"python", "typescript"};
    opts.conditions.push_back(cond);
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk());
    EXPECT_EQ(result.value().total, 5u);
}

TEST_F(PostgresIntegrationTest, List_Between) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    FilterCondition cond;
    cond.field  = "score";
    cond.op     = FilterOp::Between;
    cond.values = {"15", "45"};
    opts.conditions.push_back(cond);
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk());
    EXPECT_EQ(result.value().total, 3u);  // 20, 30, 40
}

TEST_F(PostgresIntegrationTest, List_OrGroup) {
    FilterGroup grp;
    grp.conditions.push_back({"language", FilterOp::Eq, "python"});
    grp.conditions.push_back({"language", FilterOp::Eq, "typescript"});

    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.filter_groups.push_back(grp);
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk());
    EXPECT_EQ(result.value().total, 5u);
}

TEST_F(PostgresIntegrationTest, Aggregate_CountByLanguage) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.aggregates.push_back({AggFunc::Count, "id", "count"});
    opts.group_by = {"language"};
    opts.limit = 100;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();

    bool found_python = false;
    for (const auto& item : result.value().items) {
        if (item.contains("language") && !item["language"].is_null() &&
            item["language"].get<std::string>() == "python") {
            found_python = true;
            int cnt = item["count"].is_string()
                ? std::stoi(item["count"].get<std::string>())
                : item["count"].get<int>();
            EXPECT_EQ(cnt, 3);
        }
    }
    EXPECT_TRUE(found_python);
}

TEST_F(PostgresIntegrationTest, Pagination_TotalIsAccurate) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.page  = 1;
    opts.limit = 2;
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk());
    EXPECT_EQ(result.value().total, 6u);   // total = COUNT(*), not limit
    EXPECT_EQ(result.value().items.size(), 2u);
}

TEST_F(PostgresIntegrationTest, TenantIsolation) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.limit = 100;
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk());
    for (const auto& item : result.value().items) {
        EXPECT_EQ(item["tenantId"].get<std::string>(), "tenantA");
    }
}

// ─── Bulk operations ─────────────────────────────────────────────────────────

TEST_F(PostgresIntegrationTest, CreateMany_InsertsRows) {
    std::vector<nlohmann::json> records;
    for (int i = 0; i < 3; ++i) {
        nlohmann::json row;
        row["id"]       = "ee00000" + std::to_string(i+1) + "-0000-0000-0000-000000000000";
        row["title"]    = "pg-bulk-" + std::to_string(i);
        row["language"] = "elixir";
        row["score"]    = i + 1;
        row["tenantId"] = "tenantPGBulk";
        row["createdAt"]= 1700020000LL + i;
        records.push_back(row);
    }
    auto result = adapter->createMany("TestItem", records);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value(), 3);

    ListOptions opts;
    opts.filter["tenantId"] = "tenantPGBulk";
    auto list = adapter->list("TestItem", opts);
    ASSERT_TRUE(list.isOk());
    EXPECT_EQ(list.value().total, 3u);
}

TEST_F(PostgresIntegrationTest, UpdateMany_ByTenant) {
    nlohmann::json filter;
    filter["tenantId"] = "tenantA";
    nlohmann::json data;
    data["language"] = "pg-updated";

    auto result = adapter->updateMany("TestItem", filter, data);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value(), 6);

    // Verify the update
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::Eq, "pg-updated"});
    auto list = adapter->list("TestItem", opts);
    ASSERT_TRUE(list.isOk());
    EXPECT_EQ(list.value().total, 6u);
}

TEST_F(PostgresIntegrationTest, DeleteMany_WithFilter) {
    nlohmann::json filter;
    filter["language"] = "python";

    auto result = adapter->deleteMany("TestItem", filter);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value(), 3);

    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::Eq, "python"});
    auto list = adapter->list("TestItem", opts);
    ASSERT_TRUE(list.isOk());
    EXPECT_EQ(list.value().total, 0u);
}

// ─── FindFirst + FindByField + Upsert ────────────────────────────────────────

TEST_F(PostgresIntegrationTest, FindFirst_Match) {
    nlohmann::json filter;
    filter["language"] = "python";
    auto result = adapter->findFirst("TestItem", filter);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value()["language"].get<std::string>(), "python");
}

TEST_F(PostgresIntegrationTest, FindFirst_NoMatch_ReturnsError) {
    nlohmann::json filter;
    filter["language"] = "cobol";
    auto result = adapter->findFirst("TestItem", filter);
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, FindByField_Match) {
    auto result = adapter->findByField("TestItem", "language", nlohmann::json("typescript"));
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value()["language"].get<std::string>(), "typescript");
}

TEST_F(PostgresIntegrationTest, Upsert_CreatesWhenMissing) {
    nlohmann::json createData;
    createData["id"]       = "bbbb0001-0000-0000-0000-000000000001";
    createData["title"]    = "pg-upsert-new";
    createData["language"] = "scala";
    createData["score"]    = 42;
    createData["tenantId"] = "tenantPGUp";
    createData["createdAt"]= 1700098000LL;

    auto result = adapter->upsert("TestItem", "id",
                                  nlohmann::json("bbbb0001-0000-0000-0000-000000000001"),
                                  createData, nlohmann::json::object());
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value()["title"].get<std::string>(), "pg-upsert-new");
}

TEST_F(PostgresIntegrationTest, Upsert_UpdatesWhenExists) {
    // Seed row with id a0000000-0000-0000-0000-000000000001 exists (py-alpha)
    nlohmann::json updateData;
    updateData["title"] = "py-alpha-upserted";
    auto result = adapter->upsert("TestItem", "id",
                                  nlohmann::json("a0000000-0000-0000-0000-000000000001"),
                                  nlohmann::json::object(), updateData);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value()["title"].get<std::string>(), "py-alpha-upserted");
}

// ─── Transactions ─────────────────────────────────────────────────────────────

TEST_F(PostgresIntegrationTest, Transaction_Rollback_ApiSucceeds) {
    // SqlTransactionManager is a state-management stub — BEGIN/ROLLBACK are not emitted
    // to the DB. Verify the API state machine: begin → rollback returns OK; a second
    // rollback (no active tx) returns an error.
    ASSERT_TRUE(adapter->beginTransaction().isOk());
    ASSERT_TRUE(adapter->rollbackTransaction().isOk());
    EXPECT_FALSE(adapter->rollbackTransaction().isOk());
}

TEST_F(PostgresIntegrationTest, Transaction_Commit_ApiSucceeds) {
    // Same stub note as above. Verify begin → commit returns OK; second commit errors.
    ASSERT_TRUE(adapter->beginTransaction().isOk());
    ASSERT_TRUE(adapter->commitTransaction().isOk());
    EXPECT_FALSE(adapter->commitTransaction().isOk());
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

TEST_F(PostgresIntegrationTest, GetAvailableEntities) {
    auto result = adapter->getAvailableEntities();
    ASSERT_TRUE(result.isOk()) << result.error().what();
    bool found = std::find(result.value().begin(), result.value().end(), "TestItem")
                 != result.value().end();
    EXPECT_TRUE(found);
}

TEST_F(PostgresIntegrationTest, GetEntitySchema_ReturnsFields) {
    auto result = adapter->getEntitySchema("TestItem");
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().name, "TestItem");
    EXPECT_GE(result.value().fields.size(), 5u);
}

TEST_F(PostgresIntegrationTest, GetEntitySchema_UnknownEntity_ReturnsError) {
    auto result = adapter->getEntitySchema("NoSuchEntity");
    EXPECT_FALSE(result.isOk());
}

// ─── Sort + error paths ──────────────────────────────────────────────────────

TEST_F(PostgresIntegrationTest, List_SortDesc) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::Eq, "python"});
    opts.sort["score"] = "desc";
    opts.limit = 10;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 3u);

    const auto& items = result.value().items;
    ASSERT_EQ(items.size(), 3u);
    int prev = 1000;
    for (const auto& item : items) {
        int score = item["score"].is_string()
            ? std::stoi(item["score"].get<std::string>())
            : item["score"].get<int>();
        EXPECT_LT(score, prev);
        prev = score;
    }
}

TEST_F(PostgresIntegrationTest, Read_UnknownEntity_ReturnsError) {
    auto result = adapter->read("NoSuchEntity", "any-id");
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, FindFirst_UnknownEntity_ReturnsError) {
    auto result = adapter->findFirst("NoSuchEntity", nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, UpdateMany_UnknownEntity_ReturnsError) {
    auto result = adapter->updateMany("NoSuchEntity",
                                     nlohmann::json::object(),
                                     nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, UpdateMany_UnknownFilterField_ReturnsError) {
    // Covers sql_adapter_bulk.cpp updateMany: WHERE clause schema-validation guard
    nlohmann::json filter;
    filter["nonExistentColumn"] = "value";
    nlohmann::json data;
    data["language"] = "x";
    auto result = adapter->updateMany("TestItem", filter, data);
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, DeleteMany_UnknownEntity_ReturnsError) {
    auto result = adapter->deleteMany("NoSuchEntity", nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

// ─── Validation: unknown field guards ────────────────────────────────────────

TEST_F(PostgresIntegrationTest, FindFirst_UnknownFilterField_ReturnsError) {
    // Covers sql_adapter_query.cpp findFirst field-validation guard
    nlohmann::json filter;
    filter["nonExistentColumn"] = "x";
    auto result = adapter->findFirst("TestItem", filter);
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, List_SortByUnknownField_ReturnsError) {
    // Covers sql_adapter_crud.cpp list() sort validation catch block
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.sort["nonExistentColumn"] = "asc";
    auto result = adapter->list("TestItem", opts);
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, List_ConditionOnUnknownField_ReturnsError) {
    // Covers sql_adapter_crud.cpp list() where-clause validation catch block
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"nonExistentColumn", FilterOp::Eq, "x"});
    auto result = adapter->list("TestItem", opts);
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, List_AggregateOnUnknownField_ReturnsError) {
    // Covers sql_adapter_crud.cpp list() aggregate field validation guard
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.aggregates.push_back({AggFunc::Count, "nonExistentColumn", "cnt"});
    opts.group_by = {"language"};
    auto result = adapter->list("TestItem", opts);
    EXPECT_FALSE(result.isOk());
}

TEST_F(PostgresIntegrationTest, List_GroupByUnknownField_ReturnsError) {
    // Covers sql_adapter_crud.cpp list() group_by field validation guard
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.aggregates.push_back({AggFunc::Count, "id", "cnt"});
    opts.group_by = {"nonExistentColumn"};
    auto result = adapter->list("TestItem", opts);
    EXPECT_FALSE(result.isOk());
}

// ─── Postgres-specific: concurrent access ────────────────────────────────────

TEST_F(PostgresIntegrationTest, ConcurrentReads_NoDataRace) {
    std::atomic<int> success_count{0};
    std::vector<std::thread> threads;

    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&]() {
            ListOptions opts;
            opts.filter["tenantId"] = "tenantA";
            opts.limit = 10;
            auto result = adapter->list("TestItem", opts);
            if (result.isOk()) success_count.fetch_add(1);
        });
    }

    for (auto& t : threads) t.join();
    EXPECT_EQ(success_count.load(), 5) << "Not all concurrent reads succeeded";
}
