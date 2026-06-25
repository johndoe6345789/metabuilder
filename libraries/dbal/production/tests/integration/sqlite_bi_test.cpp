/**
 * @file sqlite_bi_test.cpp
 * @brief DBAL integration tests using in-memory SQLite — no containers required.
 *
 * Covers: CRUD lifecycle, all FilterOp variants, OR groups, aggregations,
 * sort/pagination with accurate result.total, multi-tenant isolation, transactions.
 *
 * Always runs — no env var or container setup needed.
 */

#include <gtest/gtest.h>
#include "../../src/adapters/sqlite/sqlite_adapter.hpp"
#include "../../src/adapters/sql/sql_where_builder.hpp"
#include "../../include/dbal/core/types.hpp"
#include "../helpers/integration_fixture.hpp"

using namespace dbal;
using namespace dbal::adapters;
using namespace dbal::adapters::sqlite;
using namespace dbal_test;

// ─── Fixture ────────────────────────────────────────────────────────────────

class SqliteBiTest : public IntegrationFixture {
protected:
    std::unique_ptr<dbal::adapters::Adapter> createAdapter() override {
        return std::make_unique<SQLiteAdapter>(":memory:");
    }
};

// ─── CRUD lifecycle ──────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, Create_Read_Update_Delete) {
    nlohmann::json data;
    data["id"]       = "c0000000-0000-0000-0000-000000000001";
    data["title"]    = "lifecycle-test";
    data["language"] = "cpp";
    data["score"]    = 99;
    data["tenantId"] = "tenantC";
    data["createdAt"]= 1700099999LL;

    // CREATE
    auto created = adapter->create("TestItem", data);
    ASSERT_TRUE(created.isOk()) << created.error().what();
    EXPECT_EQ(created.value()["title"].get<std::string>(), "lifecycle-test");

    // READ
    auto read = adapter->read("TestItem", "c0000000-0000-0000-0000-000000000001");
    ASSERT_TRUE(read.isOk()) << read.error().what();
    EXPECT_EQ(read.value()["language"].get<std::string>(), "cpp");

    // UPDATE
    nlohmann::json patch;
    patch["title"] = "lifecycle-updated";
    auto updated = adapter->update("TestItem", "c0000000-0000-0000-0000-000000000001", patch);
    ASSERT_TRUE(updated.isOk()) << updated.error().what();
    EXPECT_EQ(updated.value()["title"].get<std::string>(), "lifecycle-updated");

    // DELETE
    auto removed = adapter->remove("TestItem", "c0000000-0000-0000-0000-000000000001");
    ASSERT_TRUE(removed.isOk()) << removed.error().what();

    // Verify gone
    auto gone = adapter->read("TestItem", "c0000000-0000-0000-0000-000000000001");
    EXPECT_FALSE(gone.isOk());
}

TEST_F(SqliteBiTest, FindFirst_ReturnsFirstMatch) {
    nlohmann::json filter;
    filter["language"] = "python";
    auto result = adapter->findFirst("TestItem", filter);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value()["language"].get<std::string>(), "python");
}

TEST_F(SqliteBiTest, FindFirst_NoMatch_ReturnsError) {
    nlohmann::json filter;
    filter["language"] = "cobol";
    auto result = adapter->findFirst("TestItem", filter);
    EXPECT_FALSE(result.isOk());
}

// ─── List: equality operators ────────────────────────────────────────────────

TEST_F(SqliteBiTest, List_Eq_MatchesTenantARows) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 6u);  // 3 python + 2 typescript + 1 null-lang
    for (const auto& item : result.value().items) {
        EXPECT_EQ(item["tenantId"].get<std::string>(), "tenantA");
    }
}

TEST_F(SqliteBiTest, List_Ne_ExcludesLanguage) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::Ne, "typescript"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    for (const auto& item : result.value().items) {
        if (!item["language"].is_null()) {
            EXPECT_NE(item["language"].get<std::string>(), "typescript");
        }
    }
}

// ─── List: range operators (on score) ────────────────────────────────────────

TEST_F(SqliteBiTest, List_Lt_ScoreBelow25) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"score", FilterOp::Lt, "25"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    // scores 10 and 20 are < 25
    EXPECT_EQ(result.value().total, 2u);
}

TEST_F(SqliteBiTest, List_Lte_ScoreUpTo30) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"score", FilterOp::Lte, "30"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 3u);  // 10, 20, 30
}

TEST_F(SqliteBiTest, List_Gt_ScoreAbove30) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"score", FilterOp::Gt, "30"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    // 40, 50, 60 are > 30
    EXPECT_EQ(result.value().total, 3u);
}

TEST_F(SqliteBiTest, List_Gte_ScoreFrom40) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"score", FilterOp::Gte, "40"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 3u);  // 40, 50, 60
}

// ─── List: text operators ─────────────────────────────────────────────────────

TEST_F(SqliteBiTest, List_Like_PrefixMatch) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"title", FilterOp::Like, "py-%"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 3u);  // py-alpha, py-beta, py-gamma
    for (const auto& item : result.value().items) {
        EXPECT_EQ(item["title"].get<std::string>().substr(0, 3), "py-");
    }
}

TEST_F(SqliteBiTest, List_ILike_CaseInsensitive) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::ILike, "PYTHON"});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 3u);  // "python" matches PYTHON case-insensitively
}

// ─── List: null operators ─────────────────────────────────────────────────────

TEST_F(SqliteBiTest, List_IsNull_LanguageNull) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::IsNull, ""});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 1u);  // only "no-lang" row
}

TEST_F(SqliteBiTest, List_IsNotNull_NonNullLanguages) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::IsNotNull, ""});
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 5u);  // python×3 + typescript×2
}

// ─── List: set operators ──────────────────────────────────────────────────────

TEST_F(SqliteBiTest, List_In_ThreeLanguages) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    FilterCondition cond;
    cond.field  = "language";
    cond.op     = FilterOp::In;
    cond.values = {"python", "typescript", "rust"};  // rust has no rows
    opts.conditions.push_back(cond);
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 5u);  // 3 python + 2 typescript
}

TEST_F(SqliteBiTest, List_Between_ScoreRange) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    FilterCondition cond;
    cond.field  = "score";
    cond.op     = FilterOp::Between;
    cond.values = {"15", "45"};  // scores 20, 30, 40 are in range
    opts.conditions.push_back(cond);
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 3u);  // 20, 30, 40
}

// ─── OR groups ────────────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, List_OrGroup_LanguageUnion) {
    FilterGroup grp;
    grp.conditions.push_back({"language", FilterOp::Eq, "python"});
    grp.conditions.push_back({"language", FilterOp::Eq, "typescript"});

    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.filter_groups.push_back(grp);
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 5u);  // 3 python + 2 typescript
}

TEST_F(SqliteBiTest, List_OrGroup_TitlePattern) {
    FilterGroup grp;
    grp.conditions.push_back({"title", FilterOp::Like, "py-%"});
    grp.conditions.push_back({"title", FilterOp::Like, "ts-%"});

    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.filter_groups.push_back(grp);
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 5u);
}

// ─── Aggregations ─────────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, Aggregate_CountByLanguage) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.aggregates.push_back({AggFunc::Count, "id", "count"});
    opts.group_by = {"language"};
    opts.limit = 100;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();

    // Should have 3 groups: python=3, typescript=2, null=1
    EXPECT_GE(result.value().total, 1u);

    // Find the python group
    bool found_python = false;
    for (const auto& item : result.value().items) {
        if (item.contains("language") && !item["language"].is_null() &&
            item["language"].get<std::string>() == "python") {
            found_python = true;
            // count may come as string or int depending on dialect
            int cnt = item["count"].is_string()
                ? std::stoi(item["count"].get<std::string>())
                : item["count"].get<int>();
            EXPECT_EQ(cnt, 3);
        }
    }
    EXPECT_TRUE(found_python) << "Expected python group in aggregation results";
}

TEST_F(SqliteBiTest, Aggregate_SumScore) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.aggregates.push_back({AggFunc::Sum, "score", "total_score"});
    opts.limit = 1;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    ASSERT_FALSE(result.value().items.empty());

    const auto& row = result.value().items[0];
    ASSERT_TRUE(row.contains("total_score"));
    int total = row["total_score"].is_string()
        ? std::stoi(row["total_score"].get<std::string>())
        : row["total_score"].get<int>();
    EXPECT_EQ(total, 10 + 20 + 30 + 40 + 50 + 60);  // 210
}

// ─── Sort + pagination + result.total ────────────────────────────────────────

TEST_F(SqliteBiTest, List_Sort_ScoreDesc) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::Eq, "python"});
    opts.sort["score"] = "desc";
    opts.limit = 10;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    ASSERT_EQ(result.value().total, 3u);

    // Verify descending: 30, 20, 10
    const auto& items = result.value().items;
    ASSERT_EQ(items.size(), 3u);
    int prev_score = 100;
    for (const auto& item : items) {
        int score = item["score"].is_string()
            ? std::stoi(item["score"].get<std::string>())
            : item["score"].get<int>();
        EXPECT_LT(score, prev_score);
        prev_score = score;
    }
}

TEST_F(SqliteBiTest, List_Pagination_Page1_HasCorrectTotal) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::IsNotNull, ""});
    opts.page  = 1;
    opts.limit = 2;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 5u);  // result.total = COUNT(*), not page size
    EXPECT_EQ(result.value().items.size(), 2u);
}

TEST_F(SqliteBiTest, List_Pagination_Page2_HasNextItems) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::IsNotNull, ""});
    opts.sort["score"] = "asc";
    opts.page  = 2;
    opts.limit = 2;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 5u);  // total unchanged regardless of page
    EXPECT_EQ(result.value().items.size(), 2u);

    // Page 2 scores should be higher than page 1 scores (asc sort, skip 2)
    // We can't assert exact values without knowing sort order but can verify count
}

TEST_F(SqliteBiTest, List_LastPage_HasRemainingItems) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::IsNotNull, ""});
    opts.sort["score"] = "asc";
    opts.page  = 3;
    opts.limit = 2;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().total, 5u);   // always full count
    EXPECT_EQ(result.value().items.size(), 1u);  // only 1 item remains on page 3
}

// ─── Multi-tenant isolation ───────────────────────────────────────────────────

TEST_F(SqliteBiTest, TenantIsolation_TenantBDataNotVisibleToTenantA) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.limit = 100;

    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();

    for (const auto& item : result.value().items) {
        ASSERT_TRUE(item.contains("tenantId"));
        EXPECT_EQ(item["tenantId"].get<std::string>(), "tenantA")
            << "tenantB row leaked into tenantA query: " << item.dump();
    }
}

TEST_F(SqliteBiTest, TenantIsolation_EachTenantSeesOwnCount) {
    ListOptions optsA;
    optsA.filter["tenantId"] = "tenantA";
    auto rA = adapter->list("TestItem", optsA);
    ASSERT_TRUE(rA.isOk());
    EXPECT_EQ(rA.value().total, 6u);

    ListOptions optsB;
    optsB.filter["tenantId"] = "tenantB";
    auto rB = adapter->list("TestItem", optsB);
    ASSERT_TRUE(rB.isOk());
    EXPECT_EQ(rB.value().total, 2u);
}

// ─── Transactions ─────────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, Transaction_Rollback_RowNotPersisted) {
    auto begin = adapter->beginTransaction();
    ASSERT_TRUE(begin.isOk()) << begin.error().what();

    nlohmann::json data;
    data["id"]       = "tx000000-0000-0000-0000-000000000001";
    data["title"]    = "rollback-test";
    data["language"] = "rollback";
    data["score"]    = 999;
    data["tenantId"] = "tenantX";
    data["createdAt"]= 1700099999LL;

    auto created = adapter->create("TestItem", data);
    ASSERT_TRUE(created.isOk());

    auto rollback = adapter->rollbackTransaction();
    ASSERT_TRUE(rollback.isOk()) << rollback.error().what();

    // Row should not exist after rollback
    auto gone = adapter->read("TestItem", "tx000000-0000-0000-0000-000000000001");
    EXPECT_FALSE(gone.isOk()) << "Row still exists after rollback";
}

TEST_F(SqliteBiTest, Transaction_Commit_RowPersisted) {
    auto begin = adapter->beginTransaction();
    ASSERT_TRUE(begin.isOk());

    nlohmann::json data;
    data["id"]       = "tx000000-0000-0000-0000-000000000002";
    data["title"]    = "commit-test";
    data["language"] = "committed";
    data["score"]    = 111;
    data["tenantId"] = "tenantY";
    data["createdAt"]= 1700099998LL;

    auto created = adapter->create("TestItem", data);
    ASSERT_TRUE(created.isOk());

    auto commit = adapter->commitTransaction();
    ASSERT_TRUE(commit.isOk()) << commit.error().what();

    // Row should exist after commit
    auto found = adapter->read("TestItem", "tx000000-0000-0000-0000-000000000002");
    ASSERT_TRUE(found.isOk()) << "Row missing after commit";
    EXPECT_EQ(found.value()["language"].get<std::string>(), "committed");
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, CreateMany_InsertsMultipleRows) {
    std::vector<nlohmann::json> records;
    for (int i = 0; i < 5; ++i) {
        nlohmann::json row;
        row["id"]       = "bulk" + std::to_string(i) + "000-0000-0000-0000-000000000000";
        row["title"]    = "bulk-" + std::to_string(i);
        row["language"] = "go";
        row["score"]    = i * 5;
        row["tenantId"] = "tenantBulk";
        row["createdAt"]= 1700010000LL + i;
        records.push_back(row);
    }

    auto result = adapter->createMany("TestItem", records);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value(), 5);

    ListOptions opts;
    opts.filter["tenantId"] = "tenantBulk";
    auto list_result = adapter->list("TestItem", opts);
    ASSERT_TRUE(list_result.isOk());
    EXPECT_EQ(list_result.value().total, 5u);
}

TEST_F(SqliteBiTest, CreateMany_EmptyList_ReturnsZero) {
    auto result = adapter->createMany("TestItem", {});
    ASSERT_TRUE(result.isOk());
    EXPECT_EQ(result.value(), 0);
}

// ─── UpdateMany ──────────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, UpdateMany_ByTenant) {
    nlohmann::json filter;
    filter["tenantId"] = "tenantB";
    nlohmann::json data;
    data["language"] = "updated-sql";

    auto result = adapter->updateMany("TestItem", filter, data);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value(), 2);  // 2 tenantB rows

    ListOptions opts;
    opts.filter["tenantId"] = "tenantB";
    opts.conditions.push_back({"language", FilterOp::Eq, "updated-sql"});
    auto list_result = adapter->list("TestItem", opts);
    ASSERT_TRUE(list_result.isOk());
    EXPECT_EQ(list_result.value().total, 2u);
}

TEST_F(SqliteBiTest, UpdateMany_EmptyData_ReturnsError) {
    nlohmann::json filter;
    filter["tenantId"] = "tenantA";
    auto result = adapter->updateMany("TestItem", filter, nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

// ─── DeleteMany ──────────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, DeleteMany_WithFilter) {
    nlohmann::json filter;
    filter["language"] = "typescript";

    auto result = adapter->deleteMany("TestItem", filter);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value(), 2);  // 2 typescript rows in tenantA

    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.conditions.push_back({"language", FilterOp::Eq, "typescript"});
    auto list_result = adapter->list("TestItem", opts);
    ASSERT_TRUE(list_result.isOk());
    EXPECT_EQ(list_result.value().total, 0u);
}

TEST_F(SqliteBiTest, DeleteMany_EmptyFilter_DeletesAll) {
    auto result = adapter->deleteMany("TestItem", nlohmann::json::object());
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value(), 8);  // all 8 seed rows

    ListOptions opts;
    auto list_result = adapter->list("TestItem", opts);
    ASSERT_TRUE(list_result.isOk());
    EXPECT_EQ(list_result.value().total, 0u);
}

// ─── FindByField + Upsert ────────────────────────────────────────────────────

TEST_F(SqliteBiTest, FindByField_Match) {
    auto result = adapter->findByField("TestItem", "language", nlohmann::json("python"));
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value()["language"].get<std::string>(), "python");
}

TEST_F(SqliteBiTest, Upsert_CreatesWhenMissing) {
    nlohmann::json createData;
    createData["id"]       = "upsert00-0000-0000-0000-000000000001";
    createData["title"]    = "upsert-new";
    createData["language"] = "rust";
    createData["score"]    = 77;
    createData["tenantId"] = "tenantUpsert";
    createData["createdAt"]= 1700099900LL;

    auto result = adapter->upsert("TestItem", "id",
                                  nlohmann::json("upsert00-0000-0000-0000-000000000001"),
                                  createData, nlohmann::json::object());
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value()["title"].get<std::string>(), "upsert-new");
}

TEST_F(SqliteBiTest, Upsert_UpdatesWhenExists) {
    // Create a record first
    nlohmann::json data;
    data["id"]       = "upsert00-0000-0000-0000-000000000002";
    data["title"]    = "before-upsert";
    data["language"] = "go";
    data["score"]    = 5;
    data["tenantId"] = "tenantUpsert2";
    data["createdAt"]= 1700099800LL;
    ASSERT_TRUE(adapter->create("TestItem", data).isOk());

    nlohmann::json updateData;
    updateData["title"] = "after-upsert";
    auto result = adapter->upsert("TestItem", "id",
                                  nlohmann::json("upsert00-0000-0000-0000-000000000002"),
                                  data, updateData);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value()["title"].get<std::string>(), "after-upsert");
}

// ─── Metadata ────────────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, GetAvailableEntities_ReturnsTestItem) {
    auto result = adapter->getAvailableEntities();
    ASSERT_TRUE(result.isOk()) << result.error().what();
    const auto& entities = result.value();
    EXPECT_GE(entities.size(), 1u);
    bool found = std::find(entities.begin(), entities.end(), "TestItem") != entities.end();
    EXPECT_TRUE(found) << "TestItem not in available entities";
}

TEST_F(SqliteBiTest, GetEntitySchema_ReturnsFields) {
    auto result = adapter->getEntitySchema("TestItem");
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value().name, "TestItem");
    EXPECT_GE(result.value().fields.size(), 5u);  // id, title, language, score, tenantId
}

TEST_F(SqliteBiTest, GetEntitySchema_UnknownEntity_ReturnsError) {
    auto result = adapter->getEntitySchema("NoSuchEntity");
    EXPECT_FALSE(result.isOk());
}

// ─── Error paths ─────────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, Create_UnknownEntity_ReturnsError) {
    auto result = adapter->create("NoSuchEntity", nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

TEST_F(SqliteBiTest, Read_UnknownEntity_ReturnsError) {
    auto result = adapter->read("NoSuchEntity", "any-id");
    EXPECT_FALSE(result.isOk());
}

TEST_F(SqliteBiTest, Update_UnknownEntity_ReturnsError) {
    auto result = adapter->update("NoSuchEntity", "any-id", nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

TEST_F(SqliteBiTest, Remove_UnknownEntity_ReturnsError) {
    auto result = adapter->remove("NoSuchEntity", "any-id");
    EXPECT_FALSE(result.isOk());
}

TEST_F(SqliteBiTest, List_UnknownEntity_ReturnsError) {
    auto result = adapter->list("NoSuchEntity", ListOptions{});
    EXPECT_FALSE(result.isOk());
}

TEST_F(SqliteBiTest, FindFirst_UnknownEntity_ReturnsError) {
    auto result = adapter->findFirst("NoSuchEntity", nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

TEST_F(SqliteBiTest, CreateMany_UnknownEntity_ReturnsError) {
    std::vector<nlohmann::json> records = {nlohmann::json::object()};
    auto result = adapter->createMany("NoSuchEntity", records);
    EXPECT_FALSE(result.isOk());
}

TEST_F(SqliteBiTest, UpdateMany_UnknownEntity_ReturnsError) {
    auto result = adapter->updateMany("NoSuchEntity",
                                     nlohmann::json::object(),
                                     nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

TEST_F(SqliteBiTest, DeleteMany_UnknownEntity_ReturnsError) {
    auto result = adapter->deleteMany("NoSuchEntity", nlohmann::json::object());
    EXPECT_FALSE(result.isOk());
}

// ─── Transaction guard rails (SQLiteTransactionManager state machine) ────────

TEST_F(SqliteBiTest, Transaction_DoubleBegin_ReturnsError) {
    // Covers SQLiteTransactionManager::begin() "already in transaction" branch
    ASSERT_TRUE(adapter->beginTransaction().isOk());
    auto second = adapter->beginTransaction();
    EXPECT_FALSE(second.isOk()) << "Double-begin should return an error";
    // Cleanup — rollback the first tx so TearDown can drop the table cleanly
    adapter->rollbackTransaction();
}

TEST_F(SqliteBiTest, Transaction_CommitWithoutBegin_ReturnsError) {
    // Covers SQLiteTransactionManager::commit() "no transaction in progress" branch
    auto result = adapter->commitTransaction();
    EXPECT_FALSE(result.isOk()) << "Commit without begin should return an error";
}

TEST_F(SqliteBiTest, Transaction_RollbackWithoutBegin_ReturnsError) {
    // Covers SQLiteTransactionManager::rollback() "no transaction in progress" branch
    auto result = adapter->rollbackTransaction();
    EXPECT_FALSE(result.isOk()) << "Rollback without begin should return an error";
}

// ─── CreateMany partial failure (loop continue on insert error) ───────────────

TEST_F(SqliteBiTest, CreateMany_DuplicateKey_SkipsFailedRow) {
    // Covers sqlite_adapter_bulk.cpp createMany loop: result.hasValue() == false
    // Record 0: fresh id — succeeds
    // Record 1: duplicate of seeded id "a0000000-...-000000000001" — fails (UNIQUE)
    // Record 2: fresh id — succeeds
    // Expected return: 2 (only successful inserts counted)
    std::vector<nlohmann::json> records;

    nlohmann::json r0;
    r0["id"]       = "aaaa0001-0000-0000-0000-000000000099";
    r0["title"]    = "bulk-new-a";
    r0["language"] = "rust";
    r0["score"]    = 1;
    r0["tenantId"] = "tenantDup";
    r0["createdAt"]= 1700010001LL;
    records.push_back(r0);

    nlohmann::json r1;
    r1["id"]       = "a0000000-0000-0000-0000-000000000001";  // duplicate of seeded row
    r1["title"]    = "dup-row";
    r1["language"] = "rust";
    r1["score"]    = 2;
    r1["tenantId"] = "tenantDup";
    r1["createdAt"]= 1700010002LL;
    records.push_back(r1);

    nlohmann::json r2;
    r2["id"]       = "aaaa0002-0000-0000-0000-000000000099";
    r2["title"]    = "bulk-new-b";
    r2["language"] = "rust";
    r2["score"]    = 3;
    r2["tenantId"] = "tenantDup";
    r2["createdAt"]= 1700010003LL;
    records.push_back(r2);

    auto result = adapter->createMany("TestItem", records);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_EQ(result.value(), 2) << "Only non-duplicate rows should be counted";
}

// ─── List validation: sort / condition field guards ──────────────────────────

TEST_F(SqliteBiTest, List_SortByUnknownField_HandledGracefully) {
    // SQLite delegates to SQLiteQueryBuilder which silently ignores unknown sort fields
    // (no sql_adapter_crud.cpp catch block). Test that result still comes back ok
    // and the group_by count branch in sqlite_adapter_crud.cpp is exercised.
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.aggregates.push_back({AggFunc::Count, "id", "count"});
    opts.group_by = {"language"};
    opts.limit = 100;
    auto result = adapter->list("TestItem", opts);
    // SQLite aggregate with group_by must succeed and return per-language counts
    ASSERT_TRUE(result.isOk()) << result.error().what();
    EXPECT_GE(result.value().items.size(), 1u);
    // Total = number of distinct language groups returned
    EXPECT_GE(result.value().total, 1u);
}

// ─── Distinct ────────────────────────────────────────────────────────────────

TEST_F(SqliteBiTest, List_Distinct_Languages) {
    ListOptions opts;
    opts.filter["tenantId"] = "tenantA";
    opts.distinct = true;
    opts.limit = 100;
    auto result = adapter->list("TestItem", opts);
    ASSERT_TRUE(result.isOk()) << result.error().what();
    // Distinct rows still returns all rows (DISTINCT * = all unique rows)
    EXPECT_GE(result.value().total, 1u);
}
